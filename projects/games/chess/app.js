/* Changed September 2026: accessible interactive browser adaptation of
 * game-algorithms/Chess Pieces. Apache-2.0; see /games/LICENSE.txt. */
import {coordinate, solvePuzzle} from './engine.mjs';

const board = document.querySelector('#chess-board');
const status = document.querySelector('#chess-status');
const playButton = document.querySelector('#play');
const stepButton = document.querySelector('#step');
const showButton = document.querySelector('#show');
const speed = document.querySelector('#speed');
const pieces = {knight: '♞', queens: '♛', rooks: '♜'};
const names = {knight: 'knight', queens: 'queen', rooks: 'rook'};
const rules = {
  knight: ['An L-shaped journey.', 'A knight moves two squares in one direction and one to the side. Can it reach every square without visiting one twice?', 'The knight looks for the next square with the fewest onward moves. If it gets stuck, it backs up and tries another route. The animation follows a completed tour, so you can study the moves without the dead ends.'],
  queens: ['Room for eight queens.', 'Queens attack along rows, columns, and diagonals. Keep the first queen on your chosen square and find room for seven more.', 'The search tries one queen per row, avoiding occupied columns and diagonals. When a choice leaves no room, it backs up. The animation reveals a valid arrangement, beginning with your chosen square.'],
  rooks: ['Every rook needs its space.', 'A rook attacks along its row and column. Place eight without sharing either, starting with the square you choose.', 'Each new rook takes an unused row and an unused column, wrapping around the board as needed. This gives a complete eight-rook arrangement from any starting square.']
};
let kind = 'knight', start = 56, focusSquare = start;
let solution = [], revealed = 1, running = false, timer = null;
let controller = null, generation = 0, solving = false;
const cells = [];
for (let row = 0; row < 8; row++) {
  const line = document.createElement('div');
  line.className = 'chess-row'; line.setAttribute('role', 'row');
  for (let col = 0; col < 8; col++) {
    const square = row * 8 + col;
    const cell = document.createElement('button');
    cell.type = 'button'; cell.className = `chess-cell${(row + col) % 2 ? ' dark' : ''}`;
    cell.setAttribute('role', 'gridcell'); cell.dataset.square = square;
    cell.setAttribute('aria-colindex', col + 1); cell.setAttribute('aria-rowindex', row + 1);
    cell.addEventListener('click', () => chooseStart(square));
    cells.push(cell); line.append(cell);
  }
  board.append(line);
}

function pause(message) {
  clearTimeout(timer); timer = null; running = false;
  if (message) status.textContent = message;
  updateControls();
}
function updateControls() {
  playButton.textContent = solving ? 'Cancel search' : running ? 'Pause' : revealed === solution.length && solution.length ? 'Replay solution' : 'Play solution';
  playButton.setAttribute('aria-pressed', String(running));
  stepButton.disabled = solving || (!!solution.length && revealed >= solution.length);
  showButton.disabled = solving || (!!solution.length && revealed >= solution.length);
  board.setAttribute('aria-busy', String(solving));
}
function render() {
  const path = solution.length ? solution.slice(0, revealed) : [start];
  const current = path[path.length - 1];
  cells.forEach((cell, square) => {
    const position = path.indexOf(square);
    const hasPiece = kind === 'knight' ? square === current : position >= 0;
    cell.classList.toggle('current', square === current);
    cell.setAttribute('aria-selected', String(square === start));
    cell.tabIndex = square === focusSquare ? 0 : -1;
    let label = coordinate(square);
    if (square === start) label += ', starting square';
    if (position >= 0) label += kind === 'knight' ? `, visit ${position + 1}${hasPiece ? ', knight here' : ''}` : `, ${names[kind]} ${position + 1}`;
    cell.setAttribute('aria-label', label);
    cell.replaceChildren();
    if (square % 8 === 0) {
      const rank = document.createElement('span'); rank.className = 'rank';
      rank.textContent = 8 - Math.floor(square / 8); rank.setAttribute('aria-hidden', 'true'); cell.append(rank);
    }
    if (hasPiece || position >= 0) {
      const symbol = document.createElement('span'); symbol.setAttribute('aria-hidden', 'true');
      symbol.className = hasPiece ? 'piece' : 'step-number';
      symbol.textContent = hasPiece ? pieces[kind] : position + 1; cell.append(symbol);
    }
    if (square === start) {
      const mark = document.createElement('span'); mark.className = 'start-mark'; mark.setAttribute('aria-hidden', 'true'); cell.append(mark);
    }
  });
  document.querySelector('#tour-path').setAttribute('points', kind === 'knight' ? path.map(square => `${square % 8 * 100 + 50},${Math.floor(square / 8) * 100 + 50}`).join(' ') : '');
  document.querySelector('#start-square').textContent = coordinate(start);
  document.querySelector('#progress').textContent = `${path.length} / ${kind === 'knight' ? '64 squares' : '8 pieces'}`;
  updateControls();
}
function reset(message) {
  generation++; controller?.abort(); controller = null; solving = false;
  pause(); solution = []; revealed = 1;
  status.textContent = message || `Your ${names[kind]} starts at ${coordinate(start)}. Play the ${kind === 'knight' ? 'tour' : 'solution'} or reveal it one step at a time.`;
  render();
}
function chooseStart(square) {
  focusSquare = square; start = square; reset();
}
async function ensureSolution() {
  if (solution.length) return true;
  if (solving) return false;
  const version = generation;
  controller = new AbortController(); solving = true;
  status.textContent = `Finding a solution from ${coordinate(start)}…`;
  updateControls();
  // Let the search state paint before doing even a short search.
  await new Promise(resolve => setTimeout(resolve, 0));
  if (version !== generation || !controller) return false;
  const result = await solvePuzzle(kind, start, {signal: controller.signal});
  if (version !== generation) return false;
  solving = false; controller = null;
  if (result.status !== 'solved') {
    pause();
    status.textContent = result.status === 'limit' ? 'The search reached its limit. Choose another starting square to try a different route.' : result.status === 'cancelled' ? 'Search paused. Play or Step to try again.' : 'No complete solution was found from this square. Choose another starting square.';
    updateControls(); return false;
  }
  solution = result.path; revealed = 1; render(); return true;
}
function describeStep() {
  const square = coordinate(solution[revealed - 1]);
  if (revealed === solution.length) {
    return kind === 'knight' ? 'Tour complete. All 64 squares visited exactly once.' : `All eight ${kind} placed. No two can attack each other.`;
  }
  if (kind === 'knight') return `Visit ${revealed} of 64: the knight moves to ${square}.`;
  return `${names[kind][0].toUpperCase() + names[kind].slice(1)} ${revealed} of 8 placed on ${square}. No shared ${kind === 'queens' ? 'rows, columns, or diagonals' : 'rows or columns'}.`;
}
function advance() {
  if (revealed < solution.length) revealed++;
  status.textContent = describeStep();
  if (revealed === solution.length) pause();
  render();
}
function schedule() {
  clearTimeout(timer);
  if (!running) return;
  timer = setTimeout(() => { if (running) { advance(); schedule(); } }, Number(speed.value));
}
playButton.addEventListener('click', async () => {
  if (running || solving) {
    if (solving) { generation++; controller?.abort(); controller = null; solving = false; }
    pause('Paused. Continue with Play or take one move with Step.'); return;
  }
  if (!(await ensureSolution())) return;
  if (revealed === solution.length) revealed = 1;
  running = true; status.textContent = `Playing from ${coordinate(solution[revealed - 1])}. Pause at any time to inspect the board.`;
  render(); schedule();
});
stepButton.addEventListener('click', async () => {
  pause(); if (!(await ensureSolution())) return; advance();
});
showButton.addEventListener('click', async () => {
  pause(); if (!(await ensureSolution())) return;
  revealed = solution.length; status.textContent = describeStep(); render();
});
document.querySelector('#reset').addEventListener('click', () => reset());
speed.addEventListener('change', schedule);
document.querySelectorAll('[name="puzzle"]').forEach(radio => radio.addEventListener('change', () => {
  kind = radio.value;
  const [title, detail, note] = rules[kind];
  document.querySelector('#rule-title').textContent = title;
  document.querySelector('#rule-detail').textContent = detail;
  document.querySelector('#algorithm-note').textContent = note;
  reset();
}));
board.addEventListener('keydown', event => {
  if (event.altKey || event.metaKey || event.isComposing) return;
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault(); chooseStart(focusSquare); return;
  }
  const row = Math.floor(focusSquare / 8), col = focusSquare % 8;
  let next;
  if (event.key === 'ArrowLeft') next = row * 8 + Math.max(0, col - 1);
  if (event.key === 'ArrowRight') next = row * 8 + Math.min(7, col + 1);
  if (event.key === 'ArrowUp') next = Math.max(0, row - 1) * 8 + col;
  if (event.key === 'ArrowDown') next = Math.min(7, row + 1) * 8 + col;
  if (event.key === 'Home') next = event.ctrlKey ? 0 : row * 8;
  if (event.key === 'End') next = event.ctrlKey ? 63 : row * 8 + 7;
  if (next === undefined) return;
  event.preventDefault(); focusSquare = next;
  cells.forEach((cell, square) => { cell.tabIndex = square === next ? 0 : -1; });
  cells[next].focus();
});
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) return;
  if (solving) { generation++; controller?.abort(); controller = null; solving = false; }
  if (running || !solution.length) pause('Paused while this tab is hidden. Play or Step when you return.');
});
render();
