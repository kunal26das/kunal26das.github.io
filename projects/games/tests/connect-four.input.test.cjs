const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
let engine;
before(async () => { engine = await import('../connect-four/engine.mjs'); });

// Run the actual UI handlers with controlled timers and workers. A terminated
// worker can still deliver an already queued reply here to exercise stale work.
function harness({ side = '1' } = {}) {
  class Element {
    constructor() { this.dataset = {}; this.attributes = {}; this.children = []; this.listeners = {}; this.classList = { toggle() {} }; }
    append(child) { this.children.push(child); }
    get lastElementChild() { return this.children.at(-1); }
    addEventListener(name, callback) { this.listeners[name] = callback; }
    setAttribute(name, value) { this.attributes[name] = value; }
    focus() { document.activeElement = this; this.dispatch('focus'); }
    dispatch(name, values = {}) {
      const event = { target: this, preventDefault() { this.defaultPrevented = true; }, ...values };
      this.listeners[name]?.(event);
      return event;
    }
  }
  const elements = new Map();
  const document = Object.assign(new Element(), {
    hidden: false,
    getElementById(id) { if (!elements.has(id)) elements.set(id, new Element()); return elements.get(id); },
    createElement: () => new Element()
  });
  document.getElementById('opponent').value = 'computer';
  document.getElementById('player-side').value = side;
  const window = new Element();
  const timers = new Map(), workers = [];
  let nextTimer = 0;
  class Worker {
    constructor() { workers.push(this); }
    postMessage(message) { this.message = message; }
    terminate() { this.terminated = true; }
    reply(column = engine.bestMove(this.message.board)) { this.onmessage({ data: { column, generation: this.message.generation } }); }
    fail() { this.onerror({ preventDefault() {} }); }
  }
  const context = vm.createContext({
    ...engine, document, window, Worker, URL,
    setTimeout(callback) { const id = ++nextTimer; timers.set(id, callback); return id; },
    clearTimeout(id) { timers.delete(id); }
  });
  const source = fs.readFileSync(path.join(__dirname, '../connect-four/app.js'), 'utf8').replace(/^import[^\n]+\n/, '').replace('import.meta.url', "'https://example.test/games/connect-four/app.js'");
  vm.runInContext(source, context);
  const columns = elements.get('connect-columns').children;
  return {
    document, window, elements, columns, workers, timers,
    snapshot: () => window.connectFour.snapshot,
    click: column => columns[column].dispatch('click'),
    change(id, value) { elements.get(id).value = value; elements.get(id).dispatch('change'); },
    tick() { const pending = [...timers.values()]; timers.clear(); pending.forEach(callback => callback()); },
    reset() { elements.get('connect-reset').dispatch('click'); },
    visibility(hidden) { document.hidden = hidden; document.dispatch('visibilitychange'); }
  };
}
const count = h => h.snapshot().board.filter(Boolean).length;

test('one human drop starts one worker turn and extra human clicks cannot steal its turn', () => {
  const h = harness();
  h.click(3); h.click(2); h.click(1);
  assert.equal(count(h), 1);
  assert.equal(h.snapshot().thinking, true);
  h.tick();
  assert.equal(h.workers.length, 1);
  h.workers[0].reply();
  assert.equal(count(h), 2);
  assert.equal(h.snapshot().thinking, false);
  assert.equal(h.workers[0].terminated, true);
});

test('reset cancels both pending delay and an in-flight answer without stale moves', () => {
  const h = harness();
  h.click(3); h.reset(); h.tick();
  assert.equal(count(h), 0);
  assert.equal(h.workers.length, 0);
  h.click(2); h.tick();
  const old = h.workers[0];
  h.reset(); old.reply();
  assert.equal(old.terminated, true);
  assert.equal(count(h), 0);
});

test('mode and piece changes cancel work; computer starts when the human goes second', () => {
  const h = harness();
  h.click(3); h.tick();
  const old = h.workers[0];
  h.change('opponent', 'friend'); old.reply();
  assert.equal(count(h), 0);
  h.click(0); h.click(1);
  assert.equal(count(h), 2);
  assert.equal(h.timers.size, 0);
  h.change('opponent', 'computer');
  h.change('player-side', '2');
  h.click(0);
  assert.equal(count(h), 0);
  h.tick(); h.workers.at(-1).reply();
  assert.equal(count(h), 1);
  assert.equal(h.snapshot().turn, 2);
});

test('hidden tabs cancel computer work and resume exactly once when visible', () => {
  const h = harness();
  h.click(3); h.tick();
  const old = h.workers[0];
  h.visibility(true); old.reply(); h.click(2);
  assert.equal(old.terminated, true);
  assert.equal(count(h), 1);
  h.visibility(false); h.tick(); h.workers.at(-1).reply();
  assert.equal(count(h), 2);
  assert.equal(h.timers.size, 0);
});

test('pagehide stops work and pageshow restores a pending computer turn', () => {
  const h = harness({ side: '2' });
  h.tick(); const old = h.workers[0];
  h.window.dispatch('pagehide'); old.reply();
  assert.equal(count(h), 0);
  h.window.dispatch('pageshow'); h.tick(); h.workers.at(-1).reply();
  assert.equal(count(h), 1);
});

test('a stale worker error cannot terminate a newer game worker, and failures recover', () => {
  const h = harness();
  h.click(3); h.tick(); const old = h.workers[0];
  h.reset(); h.click(2); h.tick(); const current = h.workers.at(-1);
  old.fail();
  assert.equal(current.terminated, undefined);
  assert.equal(count(h), 1);
  current.fail();
  assert.equal(count(h), 2);
  assert.equal(current.terminated, true);
});

test('keyboard moves column focus and Enter/Space drops once without repeated moves', () => {
  const h = harness();
  h.change('opponent', 'friend');
  h.columns[3].focus();
  assert.equal(h.columns[3].dispatch('keydown', { key: 'ArrowRight' }).defaultPrevented, true);
  assert.equal(h.document.activeElement, h.columns[4]);
  assert.equal(h.columns[4].tabIndex, 0);
  h.columns[4].dispatch('keydown', { key: 'Enter' });
  h.columns[4].dispatch('keydown', { key: 'Enter', repeat: true });
  assert.equal(count(h), 1);
  h.columns[4].dispatch('keydown', { key: ' ' });
  assert.equal(count(h), 2);
  h.columns[4].dispatch('keydown', { key: 'Home' });
  assert.equal(h.document.activeElement, h.columns[0]);
  h.columns[0].dispatch('keydown', { key: 'ArrowLeft' });
  assert.equal(h.document.activeElement, h.columns[6]);
});

test('full columns and finished rounds reject moves and expose meaningful status', () => {
  const h = harness();
  h.change('opponent', 'friend');
  for (let i = 0; i < 6; i++) h.click(0);
  h.click(0);
  assert.equal(count(h), 6);
  assert.match(h.elements.get('connect-status').textContent, /column is full/);
  assert.equal(h.columns[0].attributes['aria-disabled'], 'true');
  h.reset();
  for (const column of [0,6,1,6,2,5,3]) h.click(column);
  assert.equal(h.snapshot().winner, 1);
  h.click(4);
  assert.equal(count(h), 7);
  assert.match(h.elements.get('connect-status').textContent, /wins with four/);
  const copied = h.snapshot().board; copied[0] = 2;
  assert.equal(h.snapshot().board[0], 0, 'snapshot cannot mutate the game');
});
