const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
let rules;
before(async () => { rules = await import('../snake/engine.mjs'); });

// Run the actual page handlers with the actual rules engine. Only rendering and
// browser APIs are stubbed; event coordinates and frame times come from each test.
function harness() {
  let nextFrame;
  class Element {
    constructor() { this.listeners = {}; this.dataset = {}; this.width = 480; this.height = 480; }
    addEventListener(name, handler) { this.listeners[name] = handler; }
    setAttribute() {}
    focus() {}
    setPointerCapture() {}
    getContext() { return new Proxy({}, { get: () => () => {} }); }
    dispatch(name, values = {}) {
      const event = { target: this, pointerId: 1, pointerType: 'touch', isPrimary: true, button: 0, clientX: 100, clientY: 100, ...values };
      this.listeners[name]?.(event);
    }
  }
  const elements = new Map();
  const document = Object.assign(new Element(), {
    hidden: false,
    documentElement: new Element(),
    querySelector(selector) {
      if (selector === '.home-menu[open]') return null;
      if (!elements.has(selector)) elements.set(selector, new Element());
      return elements.get(selector);
    },
    querySelectorAll: () => []
  });
  const window = new Element();
  const context = vm.createContext({
    ...rules, document, window, Element,
    getComputedStyle: () => ({ getPropertyValue: () => '#000' }),
    localStorage: { getItem: () => null, setItem() {} },
    requestAnimationFrame: callback => { nextFrame = callback; },
    MutationObserver: class { observe() {} }
  });
  const source = fs.readFileSync(path.join(__dirname, '../snake/app.js'), 'utf8').replace(/^import[^\n]+\n/, '');
  vm.runInContext(source, context);
  const board = elements.get('#snake-board');
  return {
    start: () => elements.get('#snake-toggle').dispatch('click'),
    snapshot: () => window.snakeGame.snapshot(),
    pointer: (name, x = 100, y = 100, extra = {}) => board.dispatch(name, { clientX: x, clientY: y, ...extra }),
    frame: time => nextFrame(time)
  };
}

test('a quick flick consumes its final release coordinate even without a threshold-sized move event', () => {
  const h = harness();
  h.start();
  h.pointer('pointerdown', 100, 100);
  h.pointer('pointermove', 100, 90);
  assert.deepEqual(h.snapshot().queuedDirections, []);
  h.pointer('pointerup', 100, 50);
  assert.deepEqual(h.snapshot().queuedDirections, ['up']);
  h.frame(0);
  h.frame(155);
  assert.equal(h.snapshot().direction, 'up');
  assert.deepEqual(h.snapshot().snake[0], { x: 8, y: 7 });
});

test('a swipe with only down and up events still turns once', () => {
  const h = harness();
  h.start();
  h.pointer('pointerdown');
  h.pointer('pointerup', 100, 150);
  assert.deepEqual(h.snapshot().queuedDirections, ['down']);
  h.pointer('pointerup', 30, 150);
  h.pointer('pointermove', 30, 150);
  assert.deepEqual(h.snapshot().queuedDirections, ['down'], 'the released pointer cannot queue further turns');
});

for (const event of ['pointercancel', 'lostpointercapture']) {
  test(`${event} clears the gesture without steering from its final coordinates`, () => {
    const h = harness();
    h.start();
    h.pointer('pointerdown');
    h.pointer('pointermove', 100, 90);
    h.pointer(event, 100, 50);
    h.pointer('pointerup', 100, 50);
    h.pointer('pointermove', 100, 20);
    assert.deepEqual(h.snapshot().queuedDirections, []);
  });
}

test('another pointer cannot steer, replace, or cancel the active gesture', () => {
  const h = harness();
  h.start();
  h.pointer('pointerdown');
  for (const event of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'lostpointercapture']) {
    h.pointer(event, 100, 150, { pointerId: 2 });
  }
  assert.deepEqual(h.snapshot().queuedDirections, []);
  h.pointer('pointerup', 100, 50);
  assert.deepEqual(h.snapshot().queuedDirections, ['up']);
});

test('releasing a consumed swipe does not queue another turn, including after a game tick', () => {
  const h = harness();
  h.start();
  h.pointer('pointerdown');
  h.pointer('pointermove', 100, 50);
  h.pointer('pointermove', 50, 50);
  assert.deepEqual(h.snapshot().queuedDirections, ['up', 'left']);
  h.frame(0);
  h.frame(155);
  h.frame(310);
  assert.equal(h.snapshot().direction, 'left');
  assert.deepEqual(h.snapshot().queuedDirections, []);
  h.pointer('pointerup', 50, 50);
  assert.deepEqual(h.snapshot().queuedDirections, [], 'release must use the most recent consumed point, not the gesture origin');
});

test('a tap, invalid release coordinates, and input before Start cannot steer', () => {
  const h = harness();
  h.pointer('pointerdown'); h.pointer('pointerup', 100, 50);
  assert.deepEqual(h.snapshot().queuedDirections, []);
  h.start();
  h.pointer('pointerdown'); h.pointer('pointerup', 100, 90);
  assert.deepEqual(h.snapshot().queuedDirections, []);
  h.pointer('pointerdown'); h.pointer('pointerup', NaN, 50);
  assert.deepEqual(h.snapshot().queuedDirections, []);
  h.pointer('pointermove', 100, 50);
  assert.deepEqual(h.snapshot().queuedDirections, []);
});
