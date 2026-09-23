import { PUZZLES, FlowGame } from './engine.mjs';

const board = document.querySelector('#flow-board');
const selector = document.querySelector('#flow-puzzle');
const status = document.querySelector('#flow-status');
const panel = document.querySelector('.flow-panel');
const alphabet = 'ABCDE';
let game;
let focusCell = 0;
let pointer = null;
let cells = [];

for (const puzzle of PUZZLES) {
  const option = document.createElement('option');
  option.value = puzzle.id;
  option.textContent = `${puzzle.name} · ${puzzle.size} × ${puzzle.size}`;
  selector.append(option);
}

function initialize(puzzle) {
  game = new FlowGame(puzzle);
  pointer = null;
  focusCell = 0;
  board.style.setProperty('--size', puzzle.size);
  board.setAttribute('aria-label', `${puzzle.size} by ${puzzle.size} Flow Free board. ${puzzle.pairs.length} pairs.`);
  cells = Array.from({ length: puzzle.size ** 2 }, (_, cell) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.cell = cell;
    button.tabIndex = cell === 0 ? 0 : -1;
    return button;
  });
  board.replaceChildren(...cells);
  render('Choose a dot to begin.');
}

function render(message = '') {
  const { puzzle, paths, active } = game;
  const progress = game.progress;
  for (let cell = 0; cell < cells.length; cell++) {
    const button = cells[cell];
    const color = game.owner(cell);
    const endpoint = game.endpoints.has(cell);
    const path = color === null ? [] : paths[color];
    const place = path.indexOf(cell);
    button.className = 'flow-cell' + (cell % puzzle.size === puzzle.size - 1 ? ' last-column' : '') +
      (cell >= puzzle.size * (puzzle.size - 1) ? ' last-row' : '') +
      (active === color && path.at(-1) === cell ? ' active-end' : '');
    button.style.setProperty('--flow-color', color === null ? 'transparent' : `var(--flow-${alphabet[color].toLowerCase()})`);
    const content = [];
    if (place !== -1) {
      const center = document.createElement('i');
      center.className = 'flow-line';
      center.setAttribute('aria-hidden', 'true');
      content.push(center);
      for (const next of [path[place - 1], path[place + 1]].filter(next => next !== undefined)) {
        const line = document.createElement('i');
        const direction = next === cell - puzzle.size ? 'up' : next === cell + puzzle.size ? 'down' : next === cell - 1 ? 'left' : 'right';
        line.className = `flow-line ${direction}`;
        line.setAttribute('aria-hidden', 'true');
        content.push(line);
      }
    }
    if (endpoint) {
      const dot = document.createElement('span');
      dot.className = 'dot';
      dot.textContent = alphabet[color];
      dot.setAttribute('aria-hidden', 'true');
      content.push(dot);
    }
    button.replaceChildren(...content);
    button.setAttribute('aria-label', `Row ${Math.floor(cell / puzzle.size) + 1}, column ${cell % puzzle.size + 1}: ${color === null ? 'empty' : `${alphabet[color]} ${endpoint ? 'dot' : 'path'}`}`);
  }
  document.querySelector('#flow-pairs').textContent = `${progress.connected} / ${puzzle.pairs.length}`;
  document.querySelector('#flow-filled').textContent = `${progress.filled} / ${puzzle.size ** 2}`;
  const legend = document.querySelector('#flow-legend');
  legend.replaceChildren(...puzzle.pairs.map((pair, color) => {
    const item = document.createElement('span');
    const dot = document.createElement('b');
    dot.textContent = alphabet[color];
    dot.style.setProperty('--flow-color', `var(--flow-${alphabet[color].toLowerCase()})`);
    const path = paths[color];
    const connected = path.length > 1 && pair.includes(path.at(-1));
    item.append(dot, document.createTextNode(connected ? 'Joined' : active === color ? 'Drawing' : 'Open'));
    return item;
  }));
  panel.dataset.outcome = game.revealed ? 'revealed' : progress.won ? 'won' : 'playing';
  if (game.revealed) status.textContent = 'Solution revealed by the solver. Reset to try the puzzle yourself.';
  else if (progress.won) status.textContent = 'Every pair connected. Every square filled. Nicely done!';
  else if (message) status.textContent = message;
  else if (progress.connected === puzzle.pairs.length) status.textContent = 'All pairs are joined, but some squares are empty. Reroute a path to fill them.';
  else if (active !== null) status.textContent = `Drawing ${alphabet[active]}. Connect the matching dot; retrace to undo.`;
  else status.textContent = 'Pair connected. Choose another dot or adjust a path.';
  document.querySelector('#flow-reveal').disabled = game.revealed;
}

function setFocus(cell, focus = true) {
  cells[focusCell].tabIndex = -1;
  focusCell = cell;
  cells[cell].tabIndex = 0;
  if (focus) cells[cell].focus({ preventScroll: true });
}

function act(cell) {
  if (game.active !== null && game.extend(cell)) { render(); return true; }
  if (game.start(cell)) { render(); return true; }
  render(game.error);
  return false;
}

board.addEventListener('pointerdown', event => {
  if (!event.isPrimary || event.button !== 0) return;
  const button = event.target.closest('[data-cell]');
  if (!button) return;
  event.preventDefault();
  pointer = event.pointerId;
  const cell = Number(button.dataset.cell);
  setFocus(cell);
  act(cell);
  board.setPointerCapture(event.pointerId);
});
board.addEventListener('pointermove', event => {
  if (pointer !== event.pointerId || game.active === null) return;
  const button = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-cell]');
  if (!button || !board.contains(button)) return;
  const cell = Number(button.dataset.cell);
  if (game.extend(cell)) { setFocus(cell); render(); }
});
function stopPointer(event) {
  if (pointer === event.pointerId) pointer = null;
}
board.addEventListener('pointerup', stopPointer);
board.addEventListener('pointercancel', stopPointer);
board.addEventListener('lostpointercapture', stopPointer);
board.addEventListener('click', event => {
  // Pointer input was handled above; keyboard/assistive clicks have no detail.
  if (event.detail !== 0) return;
  const button = event.target.closest('[data-cell]');
  if (button) act(Number(button.dataset.cell));
});
board.addEventListener('focusin', event => {
  const button = event.target.closest('[data-cell]');
  if (button) setFocus(Number(button.dataset.cell), false);
});
board.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    if (!event.repeat) act(focusCell);
    return;
  }
  if (event.key === 'Escape') { game.active = null; render('Drawing stopped. Select a dot or path to continue.'); return; }
  if (event.key === 'Backspace') {
    event.preventDefault();
    if (game.back()) { setFocus(game.paths[game.active].at(-1)); render(); }
    return;
  }
  const size = game.puzzle.size;
  const offsets = { ArrowUp: -size, ArrowRight: 1, ArrowDown: size, ArrowLeft: -1 };
  if (!(event.key in offsets)) return;
  event.preventDefault();
  const next = focusCell + offsets[event.key];
  if (next < 0 || next >= cells.length || (event.key === 'ArrowRight' && focusCell % size === size - 1) || (event.key === 'ArrowLeft' && focusCell % size === 0)) return;
  if (game.active === null) setFocus(next);
  else if (game.extend(next)) { setFocus(next); render(); }
  else render(game.error);
});

selector.addEventListener('change', () => initialize(PUZZLES.find(puzzle => puzzle.id === selector.value)));
document.querySelector('#flow-reset').addEventListener('click', () => { game.reset(); render('Puzzle reset. Choose a dot to begin.'); });
document.querySelector('#flow-reveal').addEventListener('click', () => { game.reveal(); render(); });
initialize(PUZZLES[0]);
