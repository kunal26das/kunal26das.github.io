/* Autoplay lifecycle tests use the real game rules with a simulated browser. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const empty = [0, 0, 0, 0];
const opening = [[2, 2, 0, 0], empty, empty, empty];

class MemoryStorage {
  constructor() { this.data = new Map(); }
  getItem(key) { return this.data.get(key) ?? null; }
  setItem(key, value) { this.data.set(key, String(value)); }
  removeItem(key) { this.data.delete(key); }
}

class Element {
  constructor() {
    this.listeners = {};
    this.attributes = {};
    this.textContent = "";
    this.disabled = false;
    this.hidden = true;
    this.value = "500";
  }
  addEventListener(name, callback) {
    (this.listeners[name] ||= []).push(callback);
  }
  setAttribute(name, value) { this.attributes[name] = value; }
  dispatch(name) {
    if (name === "click" && this.disabled) return;
    for (const callback of this.listeners[name] || []) callback({ target: this });
  }
}

function harness({ storage = new MemoryStorage(), supported = true, saved = false, rows = opening } = {}) {
  const elements = Object.fromEntries([
    "autoplay-toggle", "autoplay-step", "autoplay-speed", "autoplay-status", "autoplay-count", "game-status"
  ].map(id => [id, new Element()]));
  const panel = new Element();
  const document = Object.assign(new Element(), {
    hidden: false,
    currentScript: { src: "https://example.test/2048/js/autoplay.js" },
    getElementById: id => elements[id],
    querySelector: selector => selector === ".autoplay" ? panel : null
  });
  const window = Object.assign(new Element(), { localStorage: storage });
  const timers = new Map();
  let now = 0;
  let timerId = 0;
  function tick(duration) {
    const end = now + duration;
    for (;;) {
      const next = [...timers.entries()].filter(([, timer]) => timer.at <= end)
        .sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
      if (!next) break;
      timers.delete(next[0]);
      now = next[1].at;
      next[1].callback();
    }
    now = end;
  }
  const workers = [];
  class Worker {
    constructor() {
      if (Worker.failConstruction) throw new Error("Worker unavailable");
      this.requests = [];
      this.terminated = false;
      workers.push(this);
    }
    postMessage(request) { this.requests.push(structuredClone(request)); }
    terminate() { this.terminated = true; }
    reply(data = {}, request = this.requests.at(-1)) {
      // Even terminated workers may have an already queued callback.
      this.onmessage({ data: { id: request.id, direction: 3, explanation: "Merge left.", ...data } });
    }
    fail() { this.onerror({ preventDefault() {} }); }
  }
  const math = Object.create(Math);
  math.random = () => 0;
  const context = vm.createContext({
    document, window, Worker: supported ? Worker : undefined, URL, Math: math,
    setTimeout(callback, delay) {
      const id = ++timerId;
      timers.set(id, { callback, at: now + delay });
      return id;
    },
    clearTimeout(id) { timers.delete(id); }
  });
  for (const file of ["tile.js", "grid.js", "local_storage_manager.js", "game_manager.js", "autoplay.js"]) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, "../js", file), "utf8"), context);
  }
  class Input {
    constructor() { this.handlers = {}; }
    on(name, handler) { (this.handlers[name] ||= []).push(handler); }
    emit(name, value) { for (const handler of this.handlers[name] || []) handler(value); }
  }
  class Actuator {
    actuate() {}
    continueGame() {}
  }
  const game = new context.GameManager(4, Input, Actuator, context.LocalStorageManager);
  function setRows(nextRows) {
    game.grid = new context.Grid(4);
    nextRows.forEach((row, y) => row.forEach((value, x) => {
      if (value) game.grid.insertTile(new context.Tile({ x, y }, value));
    }));
    game.score = 0;
    game.won = false;
    game.over = false;
    game.keepPlaying = false;
    game.actuate();
  }
  if (!saved) setRows(rows);
  const moves = [];
  const move = game.move.bind(game);
  game.move = direction => { moves.push(direction); move(direction); };
  const controller = new window.AutoplayController(game);
  return {
    game, controller, document, window, panel, elements, workers, Worker,
    moves, storage, setRows, tick,
    click(id) { elements[id].dispatch("click"); },
    status() { return elements["autoplay-status"].textContent; },
    snapshot() { return JSON.stringify(game.serialize()); },
    board() {
      return Array.from({ length: 4 }, (_, y) =>
        Array.from({ length: 4 }, (_, x) => game.grid.cells[x][y]?.value || 0));
    }
  };
}

test("autoplay starts paused and starting preserves the existing board and score", () => {
  const h = harness();
  h.game.score = 128;
  const before = h.snapshot();
  assert.equal(h.panel.hidden, false);
  h.tick(10000);
  assert.equal(h.workers.length, 0);
  h.click("autoplay-toggle");
  assert.equal(h.snapshot(), before);
  assert.equal(h.moves.length, 0);
  assert.equal(h.workers.length, 1);
  assert.deepEqual(h.workers[0].requests[0].board, opening.flat());
  assert.equal(h.elements["autoplay-toggle"].textContent, "Pause autoplay");
});

test("Step makes exactly one normal move, scores its merge, and spawns one tile", () => {
  const h = harness();
  h.click("autoplay-step");
  h.workers[0].reply();
  assert.deepEqual(h.moves, [3]);
  assert.deepEqual(h.board()[0], [4, 0, 0, 0]);
  assert.equal(h.board().flat().filter(Boolean).length, 2);
  assert.equal(h.board().flat().reduce((sum, value) => sum + value, 0), 6);
  assert.equal(h.game.score, 4);
  assert.equal(h.elements["autoplay-count"].textContent, "1 autoplay move");
  assert.equal(h.elements["autoplay-step"].disabled, false);
  assert.equal(h.workers[0].terminated, true);
  h.tick(10000);
  assert.deepEqual(h.moves, [3]);
  assert.equal(h.workers.length, 1);
});

test("Pause cancels pending work and stale replies cannot affect a resumed game", () => {
  const h = harness();
  h.click("autoplay-toggle");
  const oldWorker = h.workers[0];
  h.click("autoplay-toggle");
  assert.equal(oldWorker.terminated, true);
  oldWorker.reply();
  h.tick(10000);
  assert.deepEqual(h.moves, []);
  h.click("autoplay-toggle");
  oldWorker.reply();
  assert.deepEqual(h.moves, []);
  h.workers[1].reply();
  assert.deepEqual(h.moves, [3]);
});

test("a manual move takes control immediately and cancels a pending autoplay move", () => {
  const h = harness();
  h.click("autoplay-toggle");
  const worker = h.workers[0];
  h.game.inputManager.emit("move", 1);
  const afterManualMove = h.snapshot();
  assert.equal(h.game.score, 4);
  assert.equal(worker.terminated, true);
  worker.reply();
  h.tick(10000);
  assert.equal(h.snapshot(), afterManualMove);
  assert.deepEqual(h.moves, []);
  assert.match(h.status(), /Your turn/);
});

test("New game cancels the old move and resets the autoplay count", () => {
  const h = harness();
  h.click("autoplay-toggle");
  h.workers[0].reply();
  h.tick(500);
  const worker = h.workers[0];
  assert.equal(worker.requests.length, 2);
  h.game.inputManager.emit("restart");
  const fresh = h.snapshot();
  assert.equal(h.game.score, 0);
  assert.equal(h.board().flat().filter(Boolean).length, 2);
  assert.equal(h.elements["autoplay-count"].textContent, "0 autoplay moves");
  assert.equal(worker.terminated, true);
  worker.reply();
  h.tick(10000);
  assert.equal(h.snapshot(), fresh);
  assert.deepEqual(h.moves, [3]);
});

for (const event of ["visibilitychange", "pagehide"]) {
  test(`${event} stops autoplay and returning does not resume it automatically`, () => {
    const h = harness();
    h.click("autoplay-toggle");
    const worker = h.workers[0];
    if (event === "visibilitychange") {
      h.document.hidden = true;
      h.document.dispatch(event);
      h.click("autoplay-toggle");
      assert.equal(h.workers.length, 1);
      h.document.hidden = false;
      h.document.dispatch(event);
    } else h.window.dispatch(event);
    worker.reply();
    h.tick(10000);
    assert.equal(worker.terminated, true);
    assert.deepEqual(h.moves, []);
    assert.equal(h.elements["autoplay-toggle"].textContent, "Start autoplay");
  });
}

test("changing speed between moves replaces the pending delay", () => {
  const h = harness();
  h.click("autoplay-toggle");
  const worker = h.workers[0];
  worker.reply();
  h.tick(100);
  h.elements["autoplay-speed"].value = "1000";
  h.elements["autoplay-speed"].dispatch("change");
  h.tick(999);
  assert.equal(worker.requests.length, 1);
  h.tick(1);
  assert.equal(worker.requests.length, 2);
  h.elements["autoplay-speed"].value = "180";
  h.elements["autoplay-speed"].dispatch("change");
  h.tick(300);
  assert.equal(worker.requests.length, 2, "speed changes cannot create overlapping searches");
  worker.reply({ direction: 1 });
  h.tick(179);
  assert.equal(worker.requests.length, 2);
  h.tick(1);
  assert.equal(worker.requests.length, 3);
});

test("pausing between moves cancels the scheduled next move", () => {
  const h = harness();
  h.click("autoplay-toggle");
  h.workers[0].reply();
  h.click("autoplay-toggle");
  h.tick(10000);
  assert.deepEqual(h.moves, [3]);
  assert.equal(h.workers[0].requests.length, 1);
});

test("reaching 2048 stops autoplay and Keep playing requires an explicit restart", () => {
  const h = harness({ rows: [[1024, 1024, 0, 0], empty, empty, empty] });
  h.click("autoplay-toggle");
  h.workers[0].reply();
  assert.equal(h.game.won, true);
  assert.equal(h.workers[0].terminated, true);
  assert.equal(h.elements["autoplay-toggle"].disabled, true);
  assert.equal(h.elements["autoplay-step"].disabled, true);
  assert.match(h.status(), /2048 reached/);
  h.game.inputManager.emit("keepPlaying");
  h.tick(10000);
  assert.equal(h.elements["autoplay-toggle"].disabled, false);
  assert.deepEqual(h.moves, [3]);
  h.click("autoplay-toggle");
  assert.equal(h.workers.length, 2);
});

test("a losing move stops autoplay without starting another search", () => {
  const h = harness({ rows: [
    [2, 2, 8, 16], [8, 16, 2, 4], [16, 2, 4, 8], [2, 4, 8, 16]
  ] });
  h.click("autoplay-toggle");
  h.workers[0].reply();
  assert.equal(h.game.over, true);
  assert.equal(h.workers[0].terminated, true);
  assert.equal(h.elements["autoplay-toggle"].disabled, true);
  assert.match(h.status(), /No moves left/);
  h.tick(10000);
  assert.deepEqual(h.moves, [3]);
});

for (const failure of ["error", "messageerror", "timeout", "construction", "invalid direction", "no-op"]) {
  test(`worker ${failure} leaves the game playable and allows retry`, () => {
    const h = harness();
    if (failure === "construction") h.Worker.failConstruction = true;
    h.click("autoplay-toggle");
    const worker = h.workers[0];
    if (failure === "error") worker.fail();
    if (failure === "messageerror") worker.onmessageerror();
    if (failure === "timeout") h.tick(5000);
    if (failure === "invalid direction") worker.reply({ direction: 9 });
    if (failure === "no-op") worker.reply({ direction: 0 });
    assert.match(h.status(), /couldn’t plan a move/);
    assert.equal(h.elements["autoplay-toggle"].disabled, false);
    assert.equal(h.game.score, 0);
    h.game.inputManager.emit("move", 1);
    assert.equal(h.game.score, 4, "normal input remains functional");
    h.Worker.failConstruction = false;
    h.click("autoplay-step");
    h.workers.at(-1).reply();
    assert.equal(h.elements["autoplay-count"].textContent, "1 autoplay move");
  });
}

test("a response for a changed board is discarded without making a move", () => {
  const h = harness();
  h.click("autoplay-toggle");
  h.setRows([[4, 4, 0, 0], empty, empty, empty]);
  const changed = h.snapshot();
  h.workers[0].reply();
  assert.equal(h.snapshot(), changed);
  assert.deepEqual(h.moves, []);
  assert.match(h.status(), /board changed/);
});

test("reloading restores the played board but never restarts autoplay", () => {
  const h = harness();
  h.click("autoplay-toggle");
  h.workers[0].reply();
  const restored = harness({ storage: h.storage, saved: true });
  assert.equal(restored.snapshot(), h.snapshot());
  restored.tick(10000);
  assert.equal(restored.workers.length, 0);
  assert.deepEqual(restored.moves, []);
  assert.equal(restored.elements["autoplay-toggle"].textContent, "Start autoplay");
});

test("browsers without workers retain manual play and explain disabled autoplay", () => {
  const h = harness({ supported: false });
  assert.equal(h.elements["autoplay-toggle"].disabled, true);
  assert.equal(h.elements["autoplay-step"].disabled, true);
  assert.match(h.status(), /isn’t supported/);
  h.game.inputManager.emit("move", 3);
  assert.equal(h.game.score, 4);
});

test("continuous autoplay quiets score announcements and pausing restores them", () => {
  const h = harness();
  h.click("autoplay-toggle");
  assert.equal(h.elements["game-status"].attributes["aria-live"], "off");
  assert.equal(h.elements["autoplay-status"].attributes["aria-live"], "off");
  h.click("autoplay-toggle");
  assert.equal(h.elements["game-status"].attributes["aria-live"], "polite");
  assert.equal(h.elements["autoplay-status"].attributes["aria-live"], "polite");
});
