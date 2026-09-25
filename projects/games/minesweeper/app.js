import { DIFFICULTIES, Minesweeper } from './engine.mjs';

const board = document.getElementById('mines-board');
const panel = document.querySelector('.mines-panel');
const difficulty = document.getElementById('mines-difficulty');
const status = document.getElementById('mines-status');
const flagButton = document.getElementById('mines-flag');
const time = document.getElementById('mines-time');
let game;
let cells = [];
let flagMode = false;
let focusIndex = 0;
let startedAt = null;
let elapsed = 0;
let clock = null;
let contextClick = null;

function elapsedSeconds() { return startedAt === null ? elapsed : Math.floor((Date.now() - startedAt) / 1000); }
function formatTime(seconds) { return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`; }
function updateTime() { time.textContent = formatTime(elapsedSeconds()); }
function stopClock() { clearInterval(clock); clock = null; }
function syncClock() {
  stopClock();
  updateTime();
  if (game.status === 'playing' && !document.hidden) clock = setInterval(updateTime, 250);
}

function focusCell(index) {
  focusIndex = index;
  cells.forEach((cell, i) => { cell.tabIndex = i === index ? 0 : -1; });
}

function render(message) {
  const review = game.status === 'lost';
  panel.dataset.outcome = game.status;
  cells.forEach((button, index) => {
    const cell = game.cells[index];
    const location = `Row ${Math.floor(index / game.columns) + 1}, column ${index % game.columns + 1}`;
    let label = cell.flagged ? 'flagged, covered' : 'covered';
    let symbol = cell.flagged ? '⚑' : '';
    let state = cell.flagged ? 'flagged' : 'covered';
    const visible = cell.revealed || review;
    if (review && cell.mine) {
      label = index === game.exploded ? 'mine hit' : cell.flagged ? 'correctly flagged mine' : 'mine';
      symbol = cell.flagged ? '⚑' : '✹';
      state = index === game.exploded ? 'exploded' : cell.flagged ? 'correct-flag' : 'mine';
    } else if (review && cell.flagged) {
      label = `incorrect flag, safe square, ${cell.adjacent} neighboring mines`;
      symbol = '×';
      state = 'incorrect-flag';
    } else if (visible) {
      label = cell.adjacent ? `${cell.adjacent} neighboring mine${cell.adjacent === 1 ? '' : 's'}` : 'clear, no neighboring mines';
      symbol = cell.adjacent || '';
      state = 'open';
    }
    button.textContent = symbol;
    button.dataset.state = state;
    if (visible && !cell.mine) button.dataset.count = cell.adjacent;
    else delete button.dataset.count;
    button.setAttribute('aria-label', `${location}: ${label}`);
    button.setAttribute('aria-disabled', String(game.finished || cell.revealed));
    button.tabIndex = index === focusIndex ? 0 : -1;
  });
  document.getElementById('mines-remaining').textContent = game.remaining;
  document.getElementById('mines-safe').textContent = game.safeRemaining;
  document.getElementById('mines-review').hidden = !review;
  flagButton.setAttribute('aria-pressed', String(flagMode));
  flagButton.disabled = game.finished;
  document.getElementById('mines-mode').textContent = flagMode ? 'Tap to flag' : 'Tap to reveal';
  if (game.status === 'won') status.textContent = `Field cleared in ${formatTime(elapsedSeconds())}. Every safe square found. Ready for a new field?`;
  else if (review) status.textContent = 'Mine hit. The field is open for review. Start a new field to try again.';
  else status.textContent = message || (game.status === 'ready' ? 'Choose a square. Your first reveal and its neighbors are safe.' : `${game.safeRemaining} safe squares left. Follow the numbers.`);
}

function reveal(index) {
  if (game.finished) return;
  if (game.cells[index].flagged) { render('This square is flagged. Remove its flag before revealing it.'); return; }
  const before = game.revealed;
  if (!game.reveal(index)) return;
  if (startedAt === null) startedAt = Date.now();
  if (game.finished) { elapsed = elapsedSeconds(); startedAt = null; }
  syncClock();
  const opened = game.revealed - before;
  render(`Opened ${opened} square${opened === 1 ? '' : 's'}. ${game.safeRemaining} safe squares left.`);
}

function flag(index) {
  if (game.finished || game.cells[index].revealed) return;
  if (!game.toggleFlag(index)) { render('All flags are in use. Remove one to mark another square.'); return; }
  render(`${game.cells[index].flagged ? 'Flag placed' : 'Flag removed'}. ${game.remaining} flag${game.remaining === 1 ? '' : 's'} left.`);
}

function reset() {
  stopClock();
  game = new Minesweeper(DIFFICULTIES[difficulty.value] || DIFFICULTIES.small);
  flagMode = false;
  focusIndex = 0;
  startedAt = null;
  elapsed = 0;
  contextClick = null;
  board.replaceChildren();
  board.style.setProperty('--columns', game.columns);
  board.setAttribute('aria-label', `Minesweeper board, ${game.rows} rows and ${game.columns} columns`);
  cells = game.cells.map((_, index) => {
    const button = document.createElement('button');
    let pointerType = 'mouse';
    button.type = 'button';
    button.dataset.cell = index;
    button.addEventListener('pointerdown', event => { pointerType = event.pointerType; });
    button.addEventListener('focus', () => focusCell(index));
    button.addEventListener('click', () => {
      if (contextClick && contextClick.index === index && Date.now() - contextClick.at < 500) { contextClick = null; return; }
      contextClick = null;
      if (flagMode) flag(index); else reveal(index);
    });
    button.addEventListener('contextmenu', event => {
      event.preventDefault();
      contextClick = pointerType === 'touch' ? { index, at: Date.now() } : null;
      flag(index);
    });
    button.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      let next = index;
      const row = Math.floor(index / game.columns);
      const column = index % game.columns;
      if (event.key === 'ArrowLeft') next = row * game.columns + Math.max(0, column - 1);
      else if (event.key === 'ArrowRight') next = row * game.columns + Math.min(game.columns - 1, column + 1);
      else if (event.key === 'ArrowUp') next = Math.max(0, row - 1) * game.columns + column;
      else if (event.key === 'ArrowDown') next = Math.min(game.rows - 1, row + 1) * game.columns + column;
      else if (event.key === 'Home') next = row * game.columns;
      else if (event.key === 'End') next = row * game.columns + game.columns - 1;
      else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); if (!event.repeat) reveal(index); return; }
      else if (event.key.toLowerCase() === 'f') { event.preventDefault(); if (!event.repeat) flag(index); return; }
      else return;
      event.preventDefault();
      focusCell(next);
      cells[next].focus();
    });
    board.append(button);
    return button;
  });
  updateTime();
  render();
}

document.getElementById('mines-reset').addEventListener('click', reset);
difficulty.addEventListener('change', reset);
flagButton.addEventListener('click', () => {
  flagMode = !flagMode;
  render(flagMode ? 'Flag mode on. Tap a covered square to place or remove a flag.' : 'Reveal mode on. Tap a covered square to open it.');
});
document.addEventListener('visibilitychange', syncClock);
window.addEventListener('pagehide', stopClock);
window.addEventListener('pageshow', syncClock);
// Read-only QA API. Exposes a detached board; there are no move or reset shortcuts.
Object.defineProperty(window, 'minesweeper', { value: Object.freeze({ get snapshot() { return { ...game.snapshot, flagMode, focusIndex, elapsedSeconds: elapsedSeconds() }; } }) });
reset();
