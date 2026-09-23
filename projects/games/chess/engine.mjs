/* Browser adaptation of Kunal Das's game-algorithms/Chess Pieces (Apache-2.0).
 * Changed September 2026: pure solvers, complete rook placement, constrained
 * queens, and a cooperative, bounded knight search. See /games/LICENSE.txt. */
export const SIZE = 8;
const KNIGHT_OFFSETS = [[-2, -1], [-2, 1], [-1, 2], [1, 2], [2, 1], [2, -1], [1, -2], [-1, -2]];
export const coordinate = square => `${'abcdefgh'[square % SIZE]}${SIZE - Math.floor(square / SIZE)}`;
export const knightNeighbors = square => {
  const row = Math.floor(square / SIZE), col = square % SIZE;
  return KNIGHT_OFFSETS.map(([dr, dc]) => [row + dr, col + dc])
    .filter(([r, c]) => r >= 0 && r < SIZE && c >= 0 && c < SIZE)
    .map(([r, c]) => r * SIZE + c);
};
const NEIGHBORS = Array.from({length: 64}, (_, square) => knightNeighbors(square));

function* knightSearch(start, state) {
  const visited = new Uint8Array(64), path = [];
  const degree = square => NEIGHBORS[square].reduce((count, next) => count + !visited[next], 0);
  function* visit(square) {
    if (state.nodes >= state.maxNodes) { state.limited = true; return false; }
    state.nodes++;
    if (state.nodes % state.yieldEvery === 0) yield;
    visited[square] = 1;
    path.push(square);
    if (path.length === 64) return true;
    // Warnsdorff's rule: leave the squares with fewest onward moves first.
    const candidates = NEIGHBORS[square].filter(next => !visited[next]);
    candidates.sort((a, b) => degree(a) - degree(b));
    for (const next of candidates) {
      if (yield* visit(next)) return true;
      if (state.limited) break;
    }
    visited[square] = 0;
    path.pop();
    return false;
  }
  return (yield* visit(start)) ? path.slice() : null;
}

function* queenSearch(start, state) {
  const fixedRow = Math.floor(start / SIZE), fixedCol = start % SIZE;
  const columns = new Set([fixedCol]), diagonalA = new Set([fixedRow - fixedCol]);
  const diagonalB = new Set([fixedRow + fixedCol]), path = [start];
  function* visit(row) {
    if (row === SIZE) return true;
    if (row === fixedRow) return yield* visit(row + 1);
    for (let col = 0; col < SIZE; col++) {
      if (state.nodes >= state.maxNodes) { state.limited = true; return false; }
      state.nodes++;
      if (state.nodes % state.yieldEvery === 0) yield;
      if (columns.has(col) || diagonalA.has(row - col) || diagonalB.has(row + col)) continue;
      columns.add(col); diagonalA.add(row - col); diagonalB.add(row + col);
      path.push(row * SIZE + col);
      if (yield* visit(row + 1)) return true;
      columns.delete(col); diagonalA.delete(row - col); diagonalB.delete(row + col);
      path.pop();
      if (state.limited) return false;
    }
    return false;
  }
  return (yield* visit(0)) ? path.slice() : null;
}

function* rookSearch(start, state) {
  const row = Math.floor(start / SIZE), col = start % SIZE;
  const path = [start];
  for (let offset = 1; offset < SIZE; offset++) {
    if (state.nodes >= state.maxNodes) { state.limited = true; return null; }
    state.nodes++;
    path.push(((row + offset) % SIZE) * SIZE + (col + offset) % SIZE);
  }
  return path;
}

/** Returns a solution beginning with start (0–63), without mutating the caller.
 * The solver yields to its scheduler regularly and never returns a partial
 * path as a solution. AbortSignal cancels between bounded search slices. */
export async function solvePuzzle(kind, start, options = {}) {
  if (!['knight', 'queens', 'rooks'].includes(kind)) throw new RangeError('Unknown chess puzzle.');
  if (!Number.isInteger(start) || start < 0 || start >= 64) throw new RangeError('Choose a square from 0 to 63.');
  const maxNodes = options.maxNodes ?? 250000;
  const yieldEvery = options.yieldEvery ?? 256;
  if (!Number.isInteger(maxNodes) || maxNodes < 1 || !Number.isInteger(yieldEvery) || yieldEvery < 1) {
    throw new RangeError('Search limits must be positive integers.');
  }
  const scheduler = options.scheduler ?? (() => new Promise(resolve => setTimeout(resolve, 0)));
  const state = {nodes: 0, maxNodes, yieldEvery, limited: false};
  const search = {knight: knightSearch, queens: queenSearch, rooks: rookSearch}[kind](start, state);
  let result;
  while (true) {
    if (options.signal?.aborted) return {status: 'cancelled', path: [], nodes: state.nodes};
    result = search.next();
    if (result.done) break;
    await scheduler();
  }
  return {
    status: result.value ? 'solved' : state.limited ? 'limit' : 'none',
    path: result.value ?? [],
    nodes: state.nodes
  };
}
