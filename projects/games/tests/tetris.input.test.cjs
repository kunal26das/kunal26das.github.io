const { test, before } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
let engine;
before(async () => { engine = await import('../tetris/engine.mjs'); });

// Exercise the page's real event handlers and engine, with only DOM drawing
// replaced. Browser play checks cover native mouse and keyboard dispatch.
function harness() {
  let document;
  class Element {
    constructor(tag = 'div', attributes = {}, parent = null) {
      this.tag = tag;
      this.attributes = attributes;
      this.parent = parent;
      this.listeners = {};
      this.dataset = {};
      this.width = 300;
      this.height = 600;
      this.focusCount = 0;
    }
    addEventListener(name, callback) { this.listeners[name] = callback; }
    setAttribute(name, value) { this.attributes[name] = value; }
    closest(selector) {
      for (let node = this; node; node = node.parent) {
        if (selector.split(',').some(item => {
          item = item.trim();
          if (item.startsWith('[contenteditable]')) return 'contenteditable' in node.attributes && node.attributes.contenteditable !== 'false';
          const role = item.match(/^\[role="(.+)"\]$/);
          return role ? node.attributes.role === role[1] : node.tag === item;
        })) return node;
      }
      return null;
    }
    focus() { this.focusCount++; document.activeElement = this; }
    getContext() { return new Proxy({}, { get: (_, key) => key === 'fillStyle' ? '' : () => {} }); }
    dispatch(name, values = {}) {
      const event = { target: this, key: '', preventDefault() { this.defaultPrevented = true; }, ...values };
      this.listeners[name]?.(event);
      return event;
    }
  }
  const elements = new Map();
  const controls = ['left', 'rotate', 'right', 'down', 'drop'].map(action => {
    const element = new Element('button'); element.dataset.action = action; return element;
  });
  for (const selector of ['#tetris-board', '#tetris-next']) elements.set(selector, new Element('canvas'));
  for (const selector of ['#tetris-toggle', '#tetris-restart', '.theme-toggle']) elements.set(selector, new Element('button'));
  elements.set('.home-menu', new Element('details'));
  document = Object.assign(new Element(), {
    hidden: false,
    menuOpen: false,
    documentElement: new Element('html'),
    querySelector(selector) {
      if (selector === '.home-menu[open]') return this.menuOpen ? elements.get('.home-menu') : null;
      if (!elements.has(selector)) elements.set(selector, new Element());
      return elements.get(selector);
    },
    querySelectorAll() { return controls; }
  });
  const context = vm.createContext({
    ...engine, document, window: {}, Element,
    requestAnimationFrame() {},
    getComputedStyle: () => ({ getPropertyValue: () => '#000' }),
    MutationObserver: class { observe() {} }
  });
  const source = fs.readFileSync(path.join(__dirname, '../tetris/app.js'), 'utf8').replace(/^import[^\n]+\n/, '');
  vm.runInContext(source, context);
  const key = (value, target = elements.get('#tetris-board'), extra = {}) => document.dispatch('keydown', { key: value, target, ...extra });
  return { game: context.window.tetrisGame, document, elements, controls, Element, key };
}

test('arrows still move and P/Escape pause and resume after a theme button click', () => {
  const { game, elements, key, Element } = harness();
  elements.get('#tetris-toggle').dispatch('click');
  const theme = elements.get('.theme-toggle');
  theme.focus();
  const x = game.snapshot().active.x;
  assert.equal(key('ArrowLeft', theme).defaultPrevented, true);
  assert.equal(game.snapshot().active.x, x - 1);
  const child = new Element('span', {}, theme);
  assert.equal(key('ArrowRight', child).defaultPrevented, true);
  assert.equal(game.snapshot().active.x, x);
  assert.equal(key('p', theme).defaultPrevented, true);
  assert.equal(game.snapshot().status, 'paused');
  key('Escape', theme);
  assert.equal(game.snapshot().status, 'playing');
  assert.equal(theme.focusCount, 1);
});

test('focused game buttons retain native Space and Enter activation', () => {
  const { game, elements, key, Element } = harness();
  game.start();
  const before = game.snapshot();
  for (const button of [elements.get('#tetris-toggle'), elements.get('#tetris-restart'), elements.get('.theme-toggle'), new Element('div', { role: 'button' })]) {
    for (const value of [' ', 'Enter']) assert.equal(key(value, button).defaultPrevented, undefined);
  }
  assert.deepEqual(game.snapshot(), before);
  assert.equal(key(' ').defaultPrevented, true);
  assert.equal(game.snapshot().pieces, 1);
});

test('links, form controls, editable regions, and menus retain their keys', () => {
  const { game, document, Element, key } = harness();
  game.start();
  const before = game.snapshot();
  const targets = ['a', 'input', 'select', 'textarea', 'summary'].map(tag => new Element(tag));
  targets.push(new Element('div', { contenteditable: '' }), new Element('div', { role: 'textbox' }), new Element('div', { role: 'combobox' }));
  for (const target of targets) {
    const child = new Element('span', {}, target);
    for (const value of ['ArrowLeft', 'p', 'Escape', ' ']) assert.equal(key(value, child).defaultPrevented, undefined);
  }
  document.menuOpen = true;
  for (const value of ['ArrowLeft', 'p', 'Escape', ' ']) assert.equal(key(value).defaultPrevented, undefined);
  assert.deepEqual(game.snapshot(), before);
});

test('shortcuts, composition, consumed events, and hidden tabs never move or pause', () => {
  const { game, document, key } = harness();
  game.start();
  const before = game.snapshot();
  for (const field of ['altKey', 'ctrlKey', 'metaKey', 'shiftKey', 'isComposing', 'defaultPrevented']) {
    for (const value of ['ArrowLeft', 'p']) {
      const event = key(value, undefined, { [field]: true });
      assert.equal(event.defaultPrevented, field === 'defaultPrevented' ? true : undefined);
    }
  }
  document.hidden = true;
  assert.equal(key('ArrowLeft').defaultPrevented, undefined);
  assert.equal(key('p').defaultPrevented, undefined);
  assert.deepEqual(game.snapshot(), before);
});

test('one-shot keys ignore repeats and stopped games ignore movement', () => {
  const { game, key } = harness();
  assert.equal(key('ArrowLeft').defaultPrevented, undefined);
  game.start();
  const before = game.snapshot();
  for (const value of [' ', 'ArrowUp', 'z', 'p']) key(value, undefined, { repeat: true });
  assert.deepEqual(game.snapshot(), before);
  key('p');
  assert.equal(game.snapshot().status, 'paused');
  assert.equal(key('ArrowLeft').defaultPrevented, undefined);
});

test('start, restart, and touch control clicks return focus to the board', () => {
  const { game, elements, controls } = harness();
  const board = elements.get('#tetris-board');
  elements.get('#tetris-toggle').dispatch('click');
  assert.equal(board.focusCount, 1);
  for (const control of controls) control.dispatch('click');
  assert.equal(board.focusCount, 1 + controls.length);
  assert.equal(game.snapshot().pieces, 1);
  elements.get('#tetris-restart').dispatch('click');
  assert.equal(board.focusCount, 2 + controls.length);
  assert.equal(game.snapshot().pieces, 0);
  assert.equal(game.snapshot().status, 'playing');
});

test('opening the menu or hiding the tab pauses until explicitly resumed', () => {
  const { game, document, elements, key } = harness();
  game.start();
  const menu = elements.get('.home-menu');
  menu.open = true;
  menu.dispatch('toggle');
  assert.equal(game.snapshot().status, 'paused');
  key('p');
  assert.equal(game.snapshot().status, 'playing');
  document.hidden = true;
  document.dispatch('visibilitychange');
  assert.equal(game.snapshot().status, 'paused');
  document.hidden = false;
  document.dispatch('visibilitychange');
  assert.equal(game.snapshot().status, 'paused');
});
