// Browser adaptation of Kunal Das's Flow Free backtracking experiments:
// https://github.com/kunal26das/game-algorithms/tree/master/Flow%20Free
// The final puzzle adapts the layout from 3. Backtracking.cpp, moving C's second
// endpoint from 24 to 5: the original layout cannot fill its odd-sized grid.
// Unlike that experiment, a completed game must also fill every square.

export const PUZZLES = [
  { id: 'first-turns', name: 'First turns', size: 4, pairs: [[0, 7], [4, 6], [10, 14]] },
  { id: 'around-the-edge', name: 'Around the edge', size: 4, pairs: [[0, 14], [1, 15], [5, 9]] },
  { id: 'room-to-weave', name: 'Room to weave', size: 5, pairs: [[0, 14], [5, 19], [6, 17], [12, 16]] },
  { id: 'original-remix', name: 'Original remix', size: 5, pairs: [[0, 19], [12, 16], [15, 5], [17, 20], [4, 14]] }
];

export function adjacent(a, b, size) {
  return Number.isInteger(a) && Number.isInteger(b) && a >= 0 && b >= 0 &&
    a < size * size && b < size * size &&
    Math.abs(a % size - b % size) + Math.abs(Math.floor(a / size) - Math.floor(b / size)) === 1;
}

export function inspectPaths(puzzle, paths) {
  const occupied = new Map();
  const endpoints = new Map(puzzle.pairs.flatMap((pair, color) => pair.map(cell => [cell, color])));
  let connected = 0;
  let valid = Array.isArray(paths) && paths.length === puzzle.pairs.length;
  if (!valid) return { valid: false, connected: 0, filled: endpoints.size, won: false };
  for (let color = 0; color < paths.length; color++) {
    const path = paths[color];
    if (!Array.isArray(path)) return { valid: false, connected: 0, filled: 0, won: false };
    if (!path.length) continue;
    const [a, b] = puzzle.pairs[color];
    if (path[0] !== a && path[0] !== b) valid = false;
    const goal = path[0] === a ? b : a;
    for (let i = 0; i < path.length; i++) {
      const cell = path[i];
      if (!Number.isInteger(cell) || cell < 0 || cell >= puzzle.size ** 2 || occupied.has(cell)) valid = false;
      if (endpoints.has(cell) && endpoints.get(cell) !== color) valid = false;
      if (i && !adjacent(path[i - 1], cell, puzzle.size)) valid = false;
      if (cell === goal && i !== path.length - 1) valid = false;
      occupied.set(cell, color);
    }
    if (path.length > 1 && path.at(-1) === goal) connected++;
  }
  const filled = new Set([...occupied.keys(), ...endpoints.keys()]).size;
  return { valid, connected, filled, won: valid && connected === puzzle.pairs.length && filled === puzzle.size ** 2 };
}

// Depth-first search tries a path, then unwinds it when it blocks another pair.
// Endpoints stay reserved; reaching all pairs is accepted only on a full board.
export function solvePuzzle(puzzle) {
  const { size, pairs } = puzzle;
  const board = Array(size * size).fill(-1);
  const endpoints = new Map(pairs.flatMap((pair, color) => pair.map(cell => [cell, color])));
  const paths = pairs.map(() => []);
  let visited = 0;
  function neighbors(cell) {
    return [cell - size, cell + 1, cell + size, cell - 1].filter(next => adjacent(cell, next, size));
  }
  function reachable(color, head) {
    const goal = pairs[color][1];
    const seen = new Set([head]);
    const queue = [head];
    for (const cell of queue) {
      if (cell === goal) return true;
      for (const next of neighbors(cell)) {
        if (seen.has(next) || board[next] !== -1 || (endpoints.has(next) && endpoints.get(next) !== color)) continue;
        seen.add(next);
        queue.push(next);
      }
    }
    return false;
  }
  function search(color, cell, filled) {
    visited++;
    board[cell] = color;
    paths[color].push(cell);
    let solved = false;
    if (cell === pairs[color][1]) {
      if (color === pairs.length - 1) solved = filled + 1 === size * size;
      else solved = search(color + 1, pairs[color + 1][0], filled + 1);
    } else if (reachable(color, cell) && pairs.slice(color + 1).every((_, i) => reachable(color + i + 1, pairs[color + i + 1][0]))) {
      for (const next of neighbors(cell)) {
        if (board[next] !== -1 || (endpoints.has(next) && endpoints.get(next) !== color)) continue;
        if (search(color, next, filled + 1)) { solved = true; break; }
      }
    }
    if (solved) return true;
    board[cell] = -1;
    paths[color].pop();
    return false;
  }
  return search(0, pairs[0][0], 0) ? { paths, visited } : null;
}

export class FlowGame {
  constructor(puzzle) {
    this.puzzle = puzzle;
    this.endpoints = new Map(puzzle.pairs.flatMap((pair, color) => pair.map(cell => [cell, color])));
    this.reset();
  }
  reset() {
    this.paths = this.puzzle.pairs.map(() => []);
    this.active = null;
    this.revealed = false;
    this.error = '';
  }
  get progress() { return inspectPaths(this.puzzle, this.paths); }
  owner(cell) {
    if (this.endpoints.has(cell)) return this.endpoints.get(cell);
    const color = this.paths.findIndex(path => path.includes(cell));
    return color === -1 ? null : color;
  }
  start(cell) {
    this.error = '';
    if (this.revealed) { this.error = 'Reset the puzzle to try it yourself.'; return false; }
    const color = this.owner(cell);
    if (color === null) { this.error = 'Start at a lettered dot or an existing path.'; return false; }
    if (this.endpoints.has(cell)) this.paths[color] = [cell];
    else this.paths[color] = this.paths[color].slice(0, this.paths[color].indexOf(cell) + 1);
    this.active = color;
    return true;
  }
  extend(cell) {
    this.error = '';
    if (this.active === null || this.revealed) return false;
    const color = this.active;
    const path = this.paths[color];
    if (path.at(-1) === cell) return false;
    if (!adjacent(path.at(-1), cell, this.puzzle.size)) {
      this.error = 'Move one square at a time, horizontally or vertically.';
      return false;
    }
    const old = path.indexOf(cell);
    if (old !== -1) { this.paths[color] = path.slice(0, old + 1); return true; }
    const owner = this.owner(cell);
    if (owner !== null && owner !== color) {
      this.error = 'Paths cannot cross another path or a different letter.';
      return false;
    }
    path.push(cell);
    if (this.endpoints.has(cell)) this.active = null;
    return true;
  }
  back() {
    if (this.active === null) return false;
    const path = this.paths[this.active];
    if (path.length < 2) return false;
    path.pop();
    return true;
  }
  reveal() {
    const solution = solvePuzzle(this.puzzle);
    if (!solution) return false;
    this.paths = solution.paths;
    this.active = null;
    this.revealed = true;
    return solution;
  }
}
