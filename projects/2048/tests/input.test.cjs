const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

function harness(pointerEvents = true) {
  class Element {
    constructor(interactive = false) {
      this.listeners = {};
      this.dataset = {};
      this.interactive = interactive;
      this.clientWidth = 400;
      this.focusCount = 0;
    }
    addEventListener(name, callback) { this.listeners[name] = callback; }
    closest() { return this.interactive ? this : null; }
    focus() { this.focusCount++; }
    setPointerCapture(id) { this.capturedPointer = id; }
    dispatch(name, values = {}) {
      const event = {
        target: this, key: "", isPrimary: true, button: 0, pointerId: 1,
        preventDefault() { this.prevented = true; }, ...values
      };
      this.listeners[name]?.(event);
      return event;
    }
  }
  const board = new Element();
  const restart = new Element(true);
  const retry = new Element(true);
  const keepPlaying = new Element(true);
  const arrows = Array.from({ length: 4 }, (_, direction) => {
    const element = new Element(true);
    element.dataset.move = String(direction);
    return element;
  });
  const document = {
    querySelector: () => board,
    querySelectorAll(selector) {
      return {
        ".restart-button, .retry-button": [restart, retry],
        ".keep-playing-button": [keepPlaying],
        "[data-move]": arrows
      }[selector];
    }
  };
  const context = vm.createContext({ document, window: { PointerEvent: pointerEvents ? function () {} : undefined } });
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../js/keyboard_input_manager.js"), "utf8"), context);
  const manager = new context.KeyboardInputManager();
  const moves = [];
  manager.on("move", direction => moves.push(direction));
  return { board, restart, retry, keepPlaying, arrows, manager, moves, Element };
}

test("arrows, WASD with Caps Lock, and HJKL move the focused board", () => {
  const { board, moves } = harness();
  for (const key of ["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft", "W", "D", "S", "A", "k", "l", "j", "h"]) {
    assert.equal(board.dispatch("keydown", { key }).prevented, true);
  }
  assert.deepEqual(moves, [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3]);
});

test("Tab, shortcuts, and keys on interactive descendants remain untouched", () => {
  const { board, moves, Element } = harness();
  const events = [
    { key: "Tab" }, { key: "Escape" }, { key: "r" },
    { key: "ArrowLeft", metaKey: true }, { key: "a", ctrlKey: true },
    { key: "ArrowUp", altKey: true }, { key: "ArrowRight", shiftKey: true },
    { key: "ArrowDown", target: new Element(true) }
  ];
  for (const event of events) assert.equal(board.dispatch("keydown", event).prevented, undefined);
  assert.deepEqual(moves, []);
});

test("terminal boards ignore key and swipe input", () => {
  const { board, moves } = harness();
  board.dataset.terminated = "true";
  assert.equal(board.dispatch("keydown", { key: "ArrowLeft" }).prevented, undefined);
  board.dispatch("pointerdown", { clientX: 100, clientY: 100 });
  board.dispatch("pointerup", { clientX: 0, clientY: 100 });
  assert.deepEqual(moves, []);
});

test("direction buttons emit their direction without moving keyboard focus", () => {
  const { board, arrows, moves } = harness();
  arrows.forEach(button => button.dispatch("click"));
  assert.deepEqual(moves, [0, 1, 2, 3]);
  assert.equal(board.focusCount, 0);
});

test("New game, Try again, and Keep playing use one click action and refocus board", () => {
  const { board, restart, retry, keepPlaying, manager } = harness();
  let restarts = 0;
  let continuations = 0;
  manager.on("restart", () => restarts++);
  manager.on("keepPlaying", () => continuations++);
  restart.dispatch("click");
  retry.dispatch("click");
  keepPlaying.dispatch("click");
  assert.equal(restarts, 2);
  assert.equal(continuations, 1);
  assert.equal(board.focusCount, 3);
  assert.equal(restart.listeners.touchend, undefined);
});

test("pointer swipes choose the dominant axis and ignore taps", () => {
  const { board, moves } = harness();
  for (const [x, y] of [[100, 20], [180, 110], [100, 190], [10, 100], [108, 104]]) {
    board.dispatch("pointerdown", { clientX: 100, clientY: 100 });
    board.dispatch("pointerup", { clientX: x, clientY: y });
  }
  assert.deepEqual(moves, [0, 1, 2, 3]);
  assert.equal(board.capturedPointer, 1);
});

test("cancelled, secondary, and multi-pointer gestures cannot create a move", () => {
  const { board, moves, Element } = harness();
  for (const cancel of ["pointercancel", "lostpointercapture"]) {
    board.dispatch("pointerdown", { clientX: 100, clientY: 100 });
    board.dispatch(cancel);
    board.dispatch("pointerup", { clientX: 0, clientY: 100 });
  }
  board.dispatch("pointerdown", { clientX: 100, clientY: 100, button: 2 });
  board.dispatch("pointerup", { clientX: 0, clientY: 100 });
  board.dispatch("pointerdown", { clientX: 100, clientY: 100 });
  board.dispatch("pointerdown", { isPrimary: false, pointerId: 2 });
  board.dispatch("pointerup", { clientX: 0, clientY: 100 });
  board.dispatch("pointerdown", { clientX: 100, clientY: 100, target: new Element(true) });
  board.dispatch("pointerup", { clientX: 0, clientY: 100 });
  assert.deepEqual(moves, []);
});

test("touch fallback swipes work and a cancelled gesture cannot leak into the next one", () => {
  const { board, moves } = harness(false);
  board.dispatch("touchstart", { touches: [{ clientX: 100, clientY: 100 }] });
  assert.equal(board.dispatch("touchmove").prevented, true);
  board.dispatch("touchend", { touches: [], changedTouches: [{ clientX: 0, clientY: 100 }] });
  board.dispatch("touchstart", { touches: [{ clientX: 100, clientY: 100 }] });
  board.dispatch("touchcancel");
  board.dispatch("touchend", { touches: [], changedTouches: [{ clientX: 100, clientY: 0 }] });
  assert.deepEqual(moves, [3]);
});
