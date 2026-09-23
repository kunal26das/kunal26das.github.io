import { outcome, nextMark, place, bestMove } from './engine.mjs';

const boardElement = document.getElementById('ttt-board');
const status = document.getElementById('ttt-status');
const turn = document.getElementById('ttt-turn');
const opponent = document.getElementById('opponent');
const playerMark = document.getElementById('player-mark');
const hintButton = document.getElementById('ttt-hint');
let board = Array(9).fill(null);
let timer = null;
let hint = null;
let focusIndex = 0;

const cells = board.map((_, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.cell = index;
  button.addEventListener('click', () => move(index));
  button.addEventListener('focus', () => { focusIndex = index; });
  button.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!event.repeat) move(index);
      return;
    }
    const offsets = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3 };
    if (event.key in offsets) {
      event.preventDefault();
      focusIndex = (index + offsets[event.key] + 9) % 9;
      cells.forEach((cell, i) => { cell.tabIndex = i === focusIndex ? 0 : -1; });
      cells[focusIndex].focus();
    }
  });
  boardElement.append(button);
  return button;
});

function computerTurn() { return opponent.value === 'computer' && nextMark(board) !== playerMark.value; }
function render(message) {
  const result = outcome(board);
  const thinking = !result.winner && computerTurn();
  const mark = nextMark(board);
  cells.forEach((cell, index) => {
    cell.textContent = board[index] || '';
    cell.dataset.mark = board[index] || '';
    cell.classList.toggle('winning', result.line.includes(index));
    cell.classList.toggle('hint', hint === index);
    cell.tabIndex = focusIndex === index ? 0 : -1;
    cell.setAttribute('aria-disabled', String(!!board[index] || !!result.winner || thinking));
    cell.setAttribute('aria-label', `Row ${Math.floor(index / 3) + 1}, column ${index % 3 + 1}: ${board[index] || 'empty'}${hint === index ? ', suggested move' : ''}`);
  });
  hintButton.disabled = !!result.winner || thinking;
  playerMark.disabled = opponent.value === 'friend';
  turn.textContent = result.winner === 'draw' ? 'A well-matched draw.' : result.winner ? `${result.winner} takes the round.` : `${mark} to move${thinking ? ' — computer' : ''}.`;
  status.textContent = result.winner === 'draw' ? 'No squares left. Start a new round to try again.' :
    result.winner ? `${result.winner} wins with three in a row. Ready for another round?` :
    message || (thinking ? 'The computer is considering its next move…' : opponent.value === 'friend' ? `Your turn, ${mark}. Choose an empty square.` : `Your turn. You’re playing ${playerMark.value}.`);
}

function scheduleComputer() {
  clearTimeout(timer);
  timer = null;
  if (document.hidden || outcome(board).winner || !computerTurn()) return;
  timer = setTimeout(() => {
    timer = null;
    if (document.hidden || !computerTurn() || outcome(board).winner) return;
    const choice = bestMove(board);
    if (choice !== null) board = place(board, choice);
    hint = null;
    render();
  }, 280);
}

function move(index) {
  if (computerTurn()) return;
  const next = place(board, index);
  if (!next) return;
  board = next;
  hint = null;
  render();
  scheduleComputer();
}

function reset() {
  clearTimeout(timer);
  timer = null;
  board = Array(9).fill(null);
  hint = null;
  focusIndex = 0;
  render();
  scheduleComputer();
}

document.getElementById('ttt-reset').addEventListener('click', reset);
opponent.addEventListener('change', reset);
playerMark.addEventListener('change', reset);
hintButton.addEventListener('click', () => {
  if (computerTurn() || outcome(board).winner) return;
  hint = bestMove(board);
  render(`Try row ${Math.floor(hint / 3) + 1}, column ${hint % 3 + 1}. The outlined square keeps your best possible result within reach.`);
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { clearTimeout(timer); timer = null; }
  else scheduleComputer();
});
window.addEventListener('pagehide', () => { clearTimeout(timer); timer = null; });
window.ticTacToe = { get snapshot() { return { board: board.slice(), turn: nextMark(board), ...outcome(board) }; } };
render();
scheduleComputer();
