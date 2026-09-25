export const ROWS = 6;
export const COLUMNS = 7;
export const LINES = [];
for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLUMNS; col++) {
    for (const [dy, dx] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
      if (row + dy * 3 < ROWS && col + dx * 3 >= 0 && col + dx * 3 < COLUMNS) {
        LINES.push(Array.from({ length: 4 }, (_, n) => (row + dy * n) * COLUMNS + col + dx * n));
      }
    }
  }
}
const ORDER = [3, 2, 4, 1, 5, 0, 6];
export const createBoard = () => Array(ROWS * COLUMNS).fill(0);
export const nextPlayer = board => board.filter(Boolean).length % 2 + 1;

export function outcome(board) {
  for (const line of LINES) {
    const player = board[line[0]];
    if (player && line.every(index => board[index] === player)) return { winner: player, line: line.slice() };
  }
  return { winner: board.every(Boolean) ? 'draw' : null, line: [] };
}

export function legalMoves(board) {
  if (outcome(board).winner) return [];
  return ORDER.filter(column => !board[column]);
}

export function drop(board, column) {
  if (!Number.isInteger(column) || column < 0 || column >= COLUMNS || board[column] || outcome(board).winner) return null;
  const result = board.slice();
  for (let row = ROWS - 1; row >= 0; row--) {
    const index = row * COLUMNS + column;
    if (!result[index]) { result[index] = nextPlayer(board); return result; }
  }
  return null;
}

function connected(board, index) {
  const player = board[index];
  const row = Math.floor(index / COLUMNS), col = index % COLUMNS;
  for (const [dy, dx] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    let count = 1;
    for (const direction of [-1, 1]) {
      for (let step = 1; step < 4; step++) {
        const y = row + dy * step * direction, x = col + dx * step * direction;
        if (y < 0 || y >= ROWS || x < 0 || x >= COLUMNS || board[y * COLUMNS + x] !== player) break;
        count++;
      }
    }
    if (count >= 4) return true;
  }
  return false;
}

function evaluate(board, player) {
  let score = 0;
  for (const line of LINES) {
    let ours = 0, theirs = 0;
    for (const index of line) {
      if (board[index] === player) ours++;
      else if (board[index]) theirs++;
    }
    if (!theirs) score += [0, 1, 9, 70, 10000][ours];
    if (!ours) score -= [0, 1, 9, 70, 10000][theirs];
  }
  for (let row = 0; row < ROWS; row++) {
    const value = board[row * COLUMNS + 3];
    if (value) score += value === player ? 5 : -5;
  }
  return score;
}

// Iterative deepening keeps the last fully searched answer when the budget ends.
// In the browser this search runs in a worker, which can be terminated on reset.
export function bestMove(original, { maxDepth = 6, maxNodes = 60000, timeLimitMs = 120 } = {}) {
  const moves = legalMoves(original);
  if (!moves.length) return null;
  const board = original.slice();
  const heights = Array.from({ length: COLUMNS }, (_, column) => {
    let row = ROWS - 1;
    while (row >= 0 && board[row * COLUMNS + column]) row--;
    return row;
  });
  const player = nextPlayer(board);
  const put = (column, mark) => {
    const index = heights[column] * COLUMNS + column;
    board[index] = mark; heights[column]--;
    return index;
  };
  const undo = (column, index) => { board[index] = 0; heights[column]++; };
  for (const mark of [player, 3 - player]) {
    for (const column of moves) {
      const index = put(column, mark), wins = connected(board, index);
      undo(column, index);
      if (wins) return column;
    }
  }
  const clock = () => globalThis.performance?.now() ?? Date.now();
  const deadline = clock() + Math.max(1, timeLimitMs);
  const limit = Math.max(1, maxNodes);
  const stop = Symbol('search budget');
  let nodes = 0;
  function search(mark, depth, alpha, beta, lastIndex) {
    nodes++;
    if (nodes > limit || (nodes % 32 === 0 && clock() >= deadline)) throw stop;
    if (lastIndex !== null && connected(board, lastIndex)) return -100000 - depth;
    const available = ORDER.filter(column => heights[column] >= 0);
    if (!available.length) return 0;
    if (depth === 0) return evaluate(board, mark);
    let value = -Infinity;
    for (const column of available) {
      const index = put(column, mark);
      let score;
      try { score = -search(3 - mark, depth - 1, -beta, -alpha, index); }
      finally { undo(column, index); }
      value = Math.max(value, score);
      alpha = Math.max(alpha, score);
      if (alpha >= beta) break;
    }
    return value;
  }
  let choice = moves[0];
  for (let depth = 1; depth <= Math.min(8, Math.max(1, maxDepth)); depth++) {
    let candidate = choice, alpha = -Infinity;
    try {
      const ordered = [choice, ...moves.filter(column => column !== choice)];
      for (const column of ordered) {
        const index = put(column, player);
        let score;
        try { score = -search(3 - player, depth - 1, -Infinity, -alpha, index); }
        finally { undo(column, index); }
        if (score > alpha) { alpha = score; candidate = column; }
      }
      choice = candidate;
      if (alpha >= 100000) break;
    } catch (error) {
      if (error !== stop) throw error;
      break;
    }
  }
  return choice;
}

if (typeof WorkerGlobalScope !== 'undefined' && globalThis instanceof WorkerGlobalScope) {
  globalThis.onmessage = event => {
    const { board, generation } = event.data;
    globalThis.postMessage({ column: bestMove(board), generation });
  };
}
