import { ROWS, COLUMNS, createBoard, nextPlayer, outcome, drop, bestMove } from './engine.mjs';

const boardElement = document.getElementById('connect-board');
const columnsElement = document.getElementById('connect-columns');
const turnLabel = document.getElementById('connect-turn');
const status = document.getElementById('connect-status');
const opponent = document.getElementById('opponent');
const playerSide = document.getElementById('player-side');
const names = { 1: 'Disc', 2: 'Ring' };
let board = createBoard();
let focusColumn = 3;
let generation = 0;
let timer = null;
let worker = null;
let lastMove = null;
let pageActive = true;
const computerTurn = () => opponent.value === 'computer' && nextPlayer(board) !== Number(playerSide.value);

const cells = board.map((_, index) => {
  const cell = document.createElement('span');
  cell.className = 'connect-cell';
  cell.dataset.cell = index;
  cell.setAttribute('role', 'cell');
  if (index % COLUMNS === 0) {
    const row = document.createElement('div');
    row.className = 'connect-row';
    row.setAttribute('role', 'row');
    boardElement.append(row);
  }
  boardElement.lastElementChild.append(cell);
  return cell;
});

const columns = Array.from({ length: COLUMNS }, (_, column) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.column = column;
  button.innerHTML = `<span aria-hidden="true">↓</span><span class="column-number" aria-hidden="true">${column + 1}</span>`;
  button.addEventListener('click', () => move(column));
  button.addEventListener('focus', () => { focusColumn = column; updateFocus(); });
  button.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      focusColumn = event.key === 'Home' ? 0 : event.key === 'End' ? COLUMNS - 1 : (column + (event.key === 'ArrowLeft' ? -1 : 1) + COLUMNS) % COLUMNS;
      updateFocus();
      columns[focusColumn].focus();
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!event.repeat) move(column);
    }
  });
  columnsElement.append(button);
  return button;
});

function updateFocus() {
  columns.forEach((button, index) => { button.tabIndex = focusColumn === index ? 0 : -1; });
}

function render(message) {
  const result = outcome(board), player = nextPlayer(board);
  const thinking = !result.winner && computerTurn();
  boardElement.dataset.outcome = result.winner || 'playing';
  cells.forEach((cell, index) => {
    cell.dataset.player = board[index];
    cell.classList.toggle('winning', result.line.includes(index));
    cell.classList.toggle('last-move', index === lastMove);
    cell.setAttribute('aria-label', `Row ${Math.floor(index / COLUMNS) + 1}, column ${index % COLUMNS + 1}: ${names[board[index]] || 'empty'}${result.line.includes(index) ? ', winning piece' : ''}`);
  });
  columns.forEach((button, column) => {
    const full = !!board[column];
    button.setAttribute('aria-disabled', String(full || !!result.winner || thinking));
    button.setAttribute('aria-label', `Drop ${names[player].toLowerCase()} in column ${column + 1}${full ? ', full' : ''}`);
  });
  updateFocus();
  playerSide.disabled = opponent.value === 'friend';
  turnLabel.textContent = result.winner === 'draw' ? 'A well-matched draw.' : result.winner ? `${names[result.winner]} takes the round.` : `${names[player]} to move${thinking ? ' — computer' : ''}.`;
  status.textContent = result.winner === 'draw' ? 'The board is full. Start a new round to try again.' : result.winner ? `${names[result.winner]} wins with four in a row. Ready for another round?` :
    message || (thinking ? 'The computer is considering its next move…' : opponent.value === 'friend' ? `Your turn, ${names[player].toLowerCase()}. Choose a column.` : `Your turn. You’re playing ${names[Number(playerSide.value)].toLowerCase()}.`);
}

function cancelComputer() {
  generation++;
  clearTimeout(timer);
  timer = null;
  worker?.terminate();
  worker = null;
}

function scheduleComputer() {
  cancelComputer();
  if (!pageActive || document.hidden || outcome(board).winner || !computerTurn()) return;
  const currentGeneration = generation;
  const finish = column => {
    if (currentGeneration !== generation || !pageActive || document.hidden || !computerTurn() || outcome(board).winner) return;
    worker?.terminate();
    worker = null;
    const next = drop(board, column);
    if (next) { lastMove = next.findIndex((value, index) => value !== board[index]); board = next; }
    render();
  };
  timer = setTimeout(() => {
    timer = null;
    if (currentGeneration !== generation || !pageActive || document.hidden) return;
    const fallback = () => {
      if (currentGeneration !== generation || !pageActive || document.hidden) return;
      worker?.terminate(); worker = null;
      finish(bestMove(board, { maxDepth: 3, maxNodes: 1500, timeLimitMs: 24 }));
    };
    try {
      worker = new Worker(new URL('./engine.mjs', import.meta.url), { type: 'module' });
      worker.onmessage = event => { if (event.data.generation === currentGeneration) finish(event.data.column); };
      worker.onerror = event => { event.preventDefault(); fallback(); };
      worker.postMessage({ board: board.slice(), generation: currentGeneration });
    } catch { fallback(); }
  }, 200);
}

function move(column) {
  if (!pageActive || document.hidden || computerTurn() || outcome(board).winner) return;
  const next = drop(board, column);
  if (!next) { render('That column is full. Choose another one.'); return; }
  lastMove = next.findIndex((value, index) => value !== board[index]);
  board = next;
  render();
  scheduleComputer();
}

function reset() {
  cancelComputer();
  board = createBoard();
  lastMove = null;
  focusColumn = 3;
  render();
  scheduleComputer();
}

document.getElementById('connect-reset').addEventListener('click', reset);
opponent.addEventListener('change', reset);
playerSide.addEventListener('change', reset);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) cancelComputer();
  else scheduleComputer();
});
window.addEventListener('pagehide', () => { pageActive = false; cancelComputer(); });
window.addEventListener('pageshow', () => { pageActive = true; scheduleComputer(); });
window.connectFour = Object.freeze({ get snapshot() { return { board: board.slice(), turn: nextPlayer(board), ...outcome(board), opponent: opponent.value, player: Number(playerSide.value), thinking: !outcome(board).winner && computerTurn() }; } });
render();
scheduleComputer();
