// Browser extension of Kunal Das's Game Algorithms board-tree prototype.
// Original project: Apache-2.0. See ../LICENSE.txt and ../NOTICE.txt.
export const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const ORDER = [4,0,2,6,8,1,3,5,7];

function validate(board) {
  if (!Array.isArray(board) || board.length !== 9 || board.some(cell => cell !== null && cell !== 'X' && cell !== 'O')) {
    throw new TypeError('A board needs nine empty, X, or O cells.');
  }
}

export function outcome(board) {
  validate(board);
  for (const line of LINES) {
    if (board[line[0]] && line.every(index => board[index] === board[line[0]])) {
      return { winner: board[line[0]], line: line.slice() };
    }
  }
  return { winner: board.every(Boolean) ? 'draw' : null, line: [] };
}

export function nextMark(board) {
  validate(board);
  return board.filter(cell => cell === 'X').length === board.filter(cell => cell === 'O').length ? 'X' : 'O';
}

export function place(board, index) {
  validate(board);
  if (!Number.isInteger(index) || index < 0 || index >= 9 || board[index] || outcome(board).winner) return null;
  const next = board.slice();
  next[index] = nextMark(board);
  return next;
}

export function bestMove(board) {
  validate(board);
  if (outcome(board).winner) return null;
  const player = nextMark(board);
  const memo = new Map();
  function score(state, depth) {
    const result = outcome(state).winner;
    if (result) return result === 'draw' ? 0 : result === player ? 10 - depth : depth - 10;
    const key = state.map(cell => cell || '-').join('');
    if (memo.has(key)) return memo.get(key);
    const maximize = nextMark(state) === player;
    let value = maximize ? -Infinity : Infinity;
    for (const index of ORDER) {
      const next = place(state, index);
      if (next) value = maximize ? Math.max(value, score(next, depth + 1)) : Math.min(value, score(next, depth + 1));
    }
    memo.set(key, value);
    return value;
  }
  let choice = null, value = -Infinity;
  for (const index of ORDER) {
    const next = place(board, index);
    if (!next) continue;
    const candidate = score(next, 1);
    if (candidate > value) { value = candidate; choice = index; }
  }
  return choice;
}
