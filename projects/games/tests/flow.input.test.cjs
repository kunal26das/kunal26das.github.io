const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
let engine;
before(async () => { engine = await import('../flow/engine.mjs'); });

// Use the real page handlers and game engine. The small DOM substitute controls
// which cell each pointer sample hits, including samples that skip whole cells.
function harness() {
  class Element {
    constructor(tag = 'div') {
      this.tag = tag;
      this.dataset = {};
      this.attributes = {};
      this.listeners = {};
      this.children = [];
      this.style = { setProperty() {} };
    }
    addEventListener(name, callback) { this.listeners[name] = callback; }
    setAttribute(name, value) { this.attributes[name] = value; }
    append(...children) {
      children.forEach(child => { child.parent = this; });
      this.children.push(...children);
    }
    replaceChildren(...children) { this.children = []; this.append(...children); }
    closest(selector) {
      for (let node = this; node; node = node.parent) {
        if (selector === '[data-cell]' && node.dataset.cell !== undefined) return node;
      }
      return null;
    }
    contains(node) {
      for (; node; node = node.parent) if (node === this) return true;
      return false;
    }
    focus() { document.activeElement = this; }
    setPointerCapture(id) { this.capturedPointer = id; }
    dispatch(name, values = {}) {
      const event = {
        target: this, isPrimary: true, button: 0, pointerId: 1,
        preventDefault() { this.defaultPrevented = true; }, ...values
      };
      this.listeners[name]?.(event);
      return event;
    }
  }
  const elements = new Map();
  let hit = null;
  const document = {
    querySelector(selector) {
      if (!elements.has(selector)) elements.set(selector, new Element());
      return elements.get(selector);
    },
    createElement: tag => new Element(tag),
    createTextNode: text => ({ textContent: text }),
    elementFromPoint: () => hit
  };
  const context = vm.createContext({ ...engine, document });
  const source = fs.readFileSync(path.join(__dirname, '../flow/app.js'), 'utf8').replace(/^import[^\n]+\n/, '');
  vm.runInContext(source, context);
  const board = elements.get('#flow-board');
  const game = () => vm.runInContext('game', context);
  const pointer = (name, cell, extra = {}) => {
    hit = cell === null ? null : board.children[cell];
    return board.dispatch(name, { target: hit || board, clientX: 0, clientY: 0, ...extra });
  };
  const tap = cell => { pointer('pointerdown', cell); pointer('pointerup', cell); };
  const key = value => board.dispatch('keydown', { key: value });
  return { board, elements, game, pointer, tap, key };
}

test('a fast drag fills skipped cells and connects the first pair: 0 → 3 → 7', () => {
  const h = harness();
  h.pointer('pointerdown', 0);
  h.pointer('pointermove', 3);
  h.pointer('pointermove', 7);
  h.pointer('pointerup', 7);
  assert.deepEqual(h.game().paths[0], [0, 1, 2, 3, 7]);
  assert.equal(h.game().progress.connected, 1);
  assert.equal(h.game().progress.filled, 9);
  assert.equal(h.game().progress.valid, true);
  assert.equal(h.elements.get('#flow-pairs').textContent, '1 / 3');
});

test('vertical drags fill crossed cells and the final release sample is applied', () => {
  const h = harness();
  h.pointer('pointerdown', 7);
  h.pointer('pointerup', 15);
  assert.deepEqual(h.game().paths[0], [7, 11, 15]);
  h.pointer('pointermove', 12);
  assert.deepEqual(h.game().paths[0], [7, 11, 15], 'released pointers cannot keep drawing');
});

test('fast drags stop at foreign dots and never jump to free cells beyond them', () => {
  const h = harness();
  h.pointer('pointerdown', 0);
  h.pointer('pointermove', 12); // B at 4 blocks the column.
  assert.deepEqual(h.game().paths[0], [0]);
  assert.equal(h.game().owner(8), null);
  assert.equal(h.game().owner(12), null);
  assert.equal(h.game().progress.valid, true);
});

test('fast drags stop at an existing path without replacing or crossing it', () => {
  const h = harness();
  h.pointer('pointerdown', 0);
  h.pointer('pointermove', 1);
  h.pointer('pointermove', 5);
  h.pointer('pointerup', 5);
  h.pointer('pointerdown', 4);
  h.pointer('pointermove', 7);
  assert.deepEqual(h.game().paths[0], [0, 1, 5]);
  assert.deepEqual(h.game().paths[1], [4]);
  assert.equal(h.game().progress.valid, true);
});

test('a partially blocked segment keeps its valid prefix and stops before the blocker', () => {
  const h = harness();
  h.pointer('pointerdown', 4);
  h.pointer('pointermove', 12);
  h.pointer('pointermove', 15); // 13 is free; C at 14 blocks the rest.
  assert.deepEqual(h.game().paths[1], [4, 8, 12, 13]);
  assert.equal(h.game().owner(15), null);
  assert.equal(h.game().progress.valid, true);
  assert.equal(h.board.children[13].tabIndex, 0);
});

test('a straight segment ends at its matching dot even when the sample lies beyond it', () => {
  const h = harness();
  h.pointer('pointerdown', 4);
  h.pointer('pointermove', 7); // Connect B at 6; do not continue into A at 7.
  assert.deepEqual(h.game().paths[1], [4, 5, 6]);
  assert.equal(h.game().active, null);
  assert.equal(h.game().progress.connected, 1);
  assert.equal(h.game().progress.valid, true);
});

test('diagonal and off-board samples cannot invent a route', () => {
  const h = harness();
  h.pointer('pointerdown', 0);
  h.pointer('pointermove', 5);
  h.pointer('pointermove', null);
  assert.deepEqual(h.game().paths[0], [0]);
  h.pointer('pointermove', 3);
  h.pointer('pointermove', 4); // Neighboring numeric indices do not wrap rows.
  assert.deepEqual(h.game().paths[0], [0, 1, 2, 3]);
});

test('fast retracing frees each crossed cell without corrupting the remaining path', () => {
  const h = harness();
  h.pointer('pointerdown', 0);
  h.pointer('pointermove', 3);
  h.pointer('pointermove', 1);
  assert.deepEqual(h.game().paths[0], [0, 1]);
  assert.equal(h.game().owner(2), null);
  assert.equal(h.game().owner(3), null);
  h.pointer('pointermove', 0);
  assert.deepEqual(h.game().paths[0], [0]);
  assert.equal(h.game().progress.valid, true);
});

test('tap input still requires neighboring cells and keyboard drawing remains unchanged', () => {
  const h = harness();
  h.tap(0);
  h.tap(3);
  assert.deepEqual(h.game().paths[0], [0], 'separate taps must not become a drag');
  h.tap(1);
  h.key('ArrowRight');
  assert.deepEqual(h.game().paths[0], [0, 1, 2]);
  h.key('Backspace');
  assert.deepEqual(h.game().paths[0], [0, 1]);
  h.key('Escape');
  assert.equal(h.game().active, null);
  h.key('ArrowRight');
  assert.deepEqual(h.game().paths[0], [0, 1]);
});

for (const end of ['pointercancel', 'lostpointercapture']) {
  test(`${end} stops interpolation, and another pointer cannot extend a drag`, () => {
    const h = harness();
    h.pointer('pointerdown', 0);
    h.pointer('pointermove', 3, { pointerId: 2 });
    assert.deepEqual(h.game().paths[0], [0]);
    h.pointer('pointermove', 3);
    h.pointer(end, 3);
    h.pointer('pointermove', 7);
    assert.deepEqual(h.game().paths[0], [0, 1, 2, 3]);
  });
}

test('revealed solutions stay immutable to drags and reset restores manual drawing', () => {
  const h = harness();
  h.elements.get('#flow-reveal').dispatch('click');
  const solution = structuredClone(h.game().paths);
  h.pointer('pointerdown', 0);
  h.pointer('pointermove', 3);
  h.pointer('pointerup', 7);
  assert.deepEqual(h.game().paths, solution);
  assert.equal(h.game().revealed, true);
  h.elements.get('#flow-reset').dispatch('click');
  h.pointer('pointerdown', 0);
  h.pointer('pointermove', 3);
  h.pointer('pointerup', 7);
  assert.deepEqual(h.game().paths[0], [0, 1, 2, 3, 7]);
  assert.equal(h.game().revealed, false);
});
