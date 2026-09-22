/* Regression tests for the original rules and the site's persistence adapter. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

class MemoryStorage {
  constructor() { this.data = new Map(); }
  getItem(key) { return this.data.has(key) ? this.data.get(key) : null; }
  setItem(key, value) { this.data.set(key, String(value)); }
  removeItem(key) { this.data.delete(key); }
}

function createContext(storage = new MemoryStorage()) {
  const window = {};
  if (storage instanceof Error) {
    Object.defineProperty(window, "localStorage", { get() { throw storage; } });
  } else window.localStorage = storage;
  const context = vm.createContext({ window, Math: Object.create(Math) });
  for (const filename of ["tile.js", "grid.js", "local_storage_manager.js", "game_manager.js"]) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, "../js", filename), "utf8"), context);
  }
  class Input {
    constructor() { this.handlers = {}; }
    on(name, handler) { this.handlers[name] = handler; }
    emit(name, value) { this.handlers[name](value); }
  }
  class Actuator {
    constructor() { this.renders = 0; this.continuations = 0; }
    actuate(grid, metadata) {
      this.renders++;
      this.grid = grid.serialize();
      this.metadata = metadata;
    }
    continueGame() { this.continuations++; }
  }
  context.newGame = () => new context.GameManager(4, Input, Actuator, context.LocalStorageManager);
  return context;
}

function setRows(context, game, rows, score = 0) {
  game.grid = new context.Grid(4);
  rows.forEach((row, y) => row.forEach((value, x) => {
    if (value) game.grid.insertTile(new context.Tile({ x, y }, value));
  }));
  game.score = score;
  game.won = false;
  game.over = false;
  game.keepPlaying = false;
  game.spawns = 0;
  game.addRandomTile = () => { game.spawns++; };
}

function rows(game) {
  return Array.from({ length: 4 }, (_, y) =>
    Array.from({ length: 4 }, (_, x) => game.grid.cells[x][y]?.value || 0));
}

const empty = [0, 0, 0, 0];
const dead = [[2, 4, 2, 4], [4, 2, 4, 2], [2, 4, 2, 4], [4, 2, 4, 2]];

test("a fresh game has two tiles, zero score, and a saved board", () => {
  const context = createContext();
  const game = context.newGame();
  assert.equal(game.grid.availableCells().length, 14);
  assert.equal(game.score, 0);
  assert.equal(game.isGameTerminated(), false);
  assert.equal(game.storageManager.getGameState().grid.size, 4);
});

test("left merges each original tile once: 2,2,2,2 becomes 4,4", () => {
  const context = createContext();
  const game = context.newGame();
  setRows(context, game, [[2, 2, 2, 2], empty, empty, empty]);
  game.move(3);
  assert.deepEqual(rows(game)[0], [4, 4, 0, 0]);
  assert.equal(game.score, 8);
  assert.equal(game.spawns, 1);
  assert.equal(game.storageManager.getBestScore(), 8);
});

test("a newly merged tile cannot merge again during the same move", () => {
  const context = createContext();
  const game = context.newGame();
  setRows(context, game, [[2, 2, 4, 0], empty, empty, empty]);
  game.move(3);
  assert.deepEqual(rows(game)[0], [4, 4, 0, 0]);
  assert.equal(game.score, 4);
  game.move(3);
  assert.deepEqual(rows(game)[0], [8, 0, 0, 0]);
  assert.equal(game.score, 12);
});

test("right traversal merges from the far edge", () => {
  const context = createContext();
  const game = context.newGame();
  setRows(context, game, [[2, 2, 2, 0], empty, empty, empty]);
  game.move(1);
  assert.deepEqual(rows(game)[0], [0, 0, 2, 4]);
  assert.equal(game.score, 4);
});

test("up moves and merges independent columns", () => {
  const context = createContext();
  const game = context.newGame();
  setRows(context, game, [[2, 0, 8, 0], [2, 4, 0, 0], [4, 4, 8, 0], [4, 0, 0, 0]]);
  game.move(0);
  assert.deepEqual(rows(game), [[4, 8, 16, 0], [8, 0, 0, 0], empty, empty]);
  assert.equal(game.score, 36);
});

test("down traversal preserves edge-first merge behavior", () => {
  const context = createContext();
  const game = context.newGame();
  setRows(context, game, [[2, 0, 0, 0], [2, 0, 0, 0], [2, 0, 0, 0], empty]);
  game.move(2);
  assert.deepEqual(rows(game), [empty, empty, [2, 0, 0, 0], [4, 0, 0, 0]]);
  assert.equal(game.score, 4);
});

test("a no-op neither spawns a tile nor increases score or saves a turn", () => {
  const context = createContext();
  const game = context.newGame();
  setRows(context, game, [[2, 4, 0, 0], empty, empty, empty], 32);
  game.actuate();
  const renderCount = game.actuator.renders;
  const before = JSON.stringify(game.serialize());
  game.move(3);
  assert.equal(JSON.stringify(game.serialize()), before);
  assert.equal(game.spawns, 0);
  assert.equal(game.actuator.renders, renderCount);
});

test("invalid input directions are ignored safely", () => {
  const context = createContext();
  const game = context.newGame();
  const before = JSON.stringify(game.serialize());
  for (const direction of [-1, 4, NaN, undefined, "3", 1.5]) game.move(direction);
  assert.equal(JSON.stringify(game.serialize()), before);
});

test("random spawning retains the original 90% 2 and 10% 4 boundary", () => {
  const context = createContext();
  const game = context.newGame();
  game.grid = new context.Grid(4);
  context.Math.random = () => 0.8999;
  game.addRandomTile();
  assert.equal(rows(game).flat().filter(value => value === 2).length, 1);
  context.Math.random = () => 0.9;
  game.addRandomTile();
  assert.equal(rows(game).flat().filter(value => value === 4).length, 1);
  assert.equal(game.grid.availableCells().length, 14);
});

test("reaching 2048 pauses moves until Keep playing and saves that choice", () => {
  const context = createContext();
  const game = context.newGame();
  setRows(context, game, [[1024, 1024, 0, 0], empty, empty, empty]);
  game.move(3);
  assert.equal(game.won, true);
  assert.equal(game.score, 2048);
  assert.equal(game.isGameTerminated(), true);
  const before = JSON.stringify(game.serialize());
  game.move(2);
  assert.equal(JSON.stringify(game.serialize()), before);
  game.inputManager.emit("keepPlaying");
  assert.equal(game.keepPlaying, true);
  assert.equal(game.isGameTerminated(), false);
  assert.equal(game.storageManager.getGameState().keepPlaying, true);
  game.move(2);
  assert.equal(rows(game)[3][0], 2048);
  assert.equal(context.newGame().keepPlaying, true);
});

test("continued games can reach 4096 without stopping a second time", () => {
  const context = createContext();
  const game = context.newGame();
  setRows(context, game, [[2048, 2048, 0, 0], empty, empty, empty]);
  game.won = true;
  game.keepPlaying = true;
  game.move(3);
  assert.equal(rows(game)[0][0], 4096);
  assert.equal(game.score, 4096);
  assert.equal(game.isGameTerminated(), false);
});

test("a move that fills the last space without matches ends the game", () => {
  const context = createContext();
  const game = context.newGame();
  setRows(context, game, [[2, 2, 8, 16], [8, 16, 2, 4], [16, 2, 4, 8], [2, 4, 8, 16]]);
  game.addRandomTile = () => game.grid.insertTile(new context.Tile({ x: 3, y: 0 }, 2));
  game.move(3);
  assert.equal(game.over, true);
  assert.equal(game.isGameTerminated(), true);
  assert.equal(game.storageManager.getGameState().over, true);
});

test("a full board with an adjacent match remains playable", () => {
  const context = createContext();
  const game = context.newGame();
  setRows(context, game, [[2, 2, 2, 4], ...dead.slice(1)]);
  assert.equal(game.movesAvailable(), true);
  game.move(3);
  assert.equal(game.over, false);
});

test("a full board without matches cannot continue and restores its result", () => {
  const context = createContext();
  const game = context.newGame();
  setRows(context, game, dead, 144);
  game.move(0);
  assert.equal(game.over, true);
  assert.equal(game.spawns, 0);
  game.inputManager.emit("keepPlaying");
  assert.equal(game.keepPlaying, false);
  const restored = context.newGame();
  assert.deepEqual(rows(restored), dead);
  assert.equal(restored.over, true);
  assert.equal(restored.score, 144);
});

test("a reload restores the current board, score, and best score", () => {
  const context = createContext();
  const game = context.newGame();
  setRows(context, game, [[2, 2, 0, 0], [4, 0, 0, 0], empty, empty], 256);
  game.move(3);
  const restored = context.newGame();
  assert.deepEqual(rows(restored), rows(game));
  assert.equal(restored.score, 260);
  assert.equal(restored.storageManager.getBestScore(), 260);
});

test("New game resets the board and terminal flags while retaining best score", () => {
  const context = createContext();
  const game = context.newGame();
  setRows(context, game, dead, 512);
  game.won = true;
  game.keepPlaying = true;
  game.over = true;
  game.actuate();
  delete game.addRandomTile;
  game.inputManager.emit("restart");
  assert.equal(game.grid.availableCells().length, 14);
  assert.equal(game.score, 0);
  assert.equal(game.over, false);
  assert.equal(game.won, false);
  assert.equal(game.keepPlaying, false);
  assert.equal(game.storageManager.getBestScore(), 512);
  assert.equal(game.storageManager.getGameState().score, 0);
});

test("malformed JSON is cleared without preventing a fresh game", () => {
  const storage = new MemoryStorage();
  storage.setItem("kunal.2048.game.v1", "{broken");
  storage.setItem("kunal.2048.best.v1", "1024");
  const game = createContext(storage).newGame();
  assert.equal(game.grid.availableCells().length, 14);
  assert.equal(game.storageManager.getBestScore(), 1024);
});

test("structurally corrupt saved states never reach the engine", () => {
  const context = createContext();
  const game = context.newGame();
  const valid = JSON.parse(JSON.stringify(game.serialize()));
  const mutations = [
    state => { state.grid.size = 5; },
    state => { state.grid.cells.pop(); },
    state => { state.grid.cells[0] = {}; },
    state => { state.grid.cells[0][0] = { position: { x: 8, y: 0 }, value: 2 }; },
    state => { state.grid.cells[0][0] = { position: { x: 0, y: 0 }, value: 3 }; },
    state => { state.grid.cells[0][0] = { position: { x: 0, y: 0 }, value: 4503599627370497 }; },
    state => { state.grid.cells[0][0] = { position: { x: 0, y: 0 }, value: -4 }; },
    state => { state.grid.cells[0][0] = { position: { x: 0, y: 0 }, value: 2 ** 54 }; },
    state => { state.score = -1; },
    state => { state.score = "100"; },
    state => { state.over = "false"; },
    state => { state.keepPlaying = null; },
    state => { state.grid.cells = Array.from({ length: 4 }, () => [null, null, null, null]); }
  ];
  for (const mutate of mutations) {
    const corrupt = JSON.parse(JSON.stringify(valid));
    mutate(corrupt);
    game.storageManager.write(game.storageManager.gameStateKey, JSON.stringify(corrupt));
    assert.equal(game.storageManager.getGameState(), null);
    assert.equal(game.storageManager.read(game.storageManager.gameStateKey), null);
  }
  assert.equal(context.LocalStorageManager.validGameState(valid), true);
});

test("stale saved terminal flags are recovered from the actual board", () => {
  const context = createContext();
  const game = context.newGame();
  setRows(context, game, dead);
  game.actuate(); // Deliberately store over=false on an immovable board.
  assert.equal(context.newGame().over, true);
  setRows(context, game, [[2048, 0, 0, 0], empty, empty, empty]);
  game.actuate(); // Deliberately store won=false after a target tile exists.
  assert.equal(context.newGame().won, true);
});

test("invalid best-score values cannot poison the score display", () => {
  const storage = new MemoryStorage();
  const context = createContext(storage);
  const manager = new context.LocalStorageManager();
  for (const value of ["NaN", "Infinity", "-1", "1.5", "broken", "9007199254740992"]) {
    storage.setItem(manager.bestScoreKey, value);
    assert.equal(manager.getBestScore(), 0);
  }
});

test("a denied localStorage getter falls back to a playable in-memory session", () => {
  const context = createContext(new Error("SecurityError"));
  const game = context.newGame();
  setRows(context, game, [[2, 2, 0, 0], empty, empty, empty]);
  game.move(3);
  assert.equal(game.score, 4);
  assert.equal(game.storageManager.getBestScore(), 4);
  assert.equal(game.storageManager.getGameState().score, 4);
});

test("read failures and later quota failures preserve memory state", () => {
  const blocked = createContext({ getItem() { throw new Error("denied"); } });
  assert.equal(blocked.newGame().score, 0);
  const storage = new MemoryStorage();
  const context = createContext(storage);
  const game = context.newGame();
  game.storageManager.setBestScore(1024);
  storage.setItem = () => { throw new Error("QuotaExceededError"); };
  setRows(context, game, [[2, 2, 0, 0], empty, empty, empty]);
  game.move(3);
  assert.equal(game.storageManager.getGameState().score, 4);
  assert.equal(game.storageManager.getBestScore(), 1024);
  assert.equal(game.storageManager.storage, null);
  game.storageManager.clearGameState();
  assert.equal(game.storageManager.getGameState(), null);
});

test("save keys do not overwrite another game's generic storage", () => {
  const storage = new MemoryStorage();
  storage.setItem("bestScore", "9000");
  storage.setItem("gameState", "another app");
  const game = createContext(storage).newGame();
  assert.equal(game.storageManager.getBestScore(), 0);
  assert.equal(storage.getItem("bestScore"), "9000");
  assert.equal(storage.getItem("gameState"), "another app");
});
