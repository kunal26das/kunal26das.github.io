// Expectimax considers ordinary moves and the game's 90% 2 / 10% 4 spawns.
// All searched boards are copies. The player never changes the game or its RNG.
const LEFT = new Uint16Array(65536);
const RIGHT = new Uint16Array(65536);
const ROW_SCORE = new Float64Array(65536);
const EMPTY = new Uint8Array(65536);
const OVERFLOW = new Uint8Array(65536);
const DIRECTIONS = ["Up", "Right", "Down", "Left"];
const reverse = row => ((row & 15) << 12) | ((row & 240) << 4) |
  ((row >>> 4) & 240) | ((row >>> 12) & 15);

function scoreLine(ranks) {
  let empty = 0, sum = 0, merges = 0, last = 0, consecutive = 0;
  let monotonicLeft = 0, monotonicRight = 0;
  for (let i = 0; i < 4; i++) {
    const rank = ranks[i];
    sum += rank ** 3.5;
    if (!rank) empty++;
    else {
      if (rank === last) consecutive++;
      else {
        if (consecutive > 0) merges += 1 + consecutive;
        consecutive = 0;
      }
      last = rank;
    }
    if (i < 3) {
      if (rank > ranks[i + 1]) monotonicLeft += rank ** 4 - ranks[i + 1] ** 4;
      else monotonicRight += ranks[i + 1] ** 4 - rank ** 4;
    }
  }
  if (consecutive > 0) merges += 1 + consecutive;
  return 200000 + empty * 270 + merges * 700 -
    Math.min(monotonicLeft, monotonicRight) * 47 - sum * 11;
}

function mergeLine(ranks) {
  const compact = ranks.filter(Boolean), merged = [];
  for (let i = 0; i < compact.length; i++) {
    if (i + 1 < compact.length && compact[i] === compact[i + 1]) {
      merged.push(compact[i] + 1);
      i++;
    } else merged.push(compact[i]);
  }
  while (merged.length < 4) merged.push(0);
  return merged;
}

for (let row = 0; row < 65536; row++) {
  const ranks = [row & 15, (row >>> 4) & 15, (row >>> 8) & 15, (row >>> 12) & 15];
  const merged = mergeLine(ranks);
  // Rank 16 cannot fit in a four-bit cell. Never silently wrap it into a neighbour.
  OVERFLOW[row] = merged.some(rank => rank > 15) ? 1 : 0;
  LEFT[row] = merged[0] | (merged[1] << 4) | (merged[2] << 8) | (merged[3] << 12);
  EMPTY[row] = ranks.filter(rank => rank === 0).length;
  ROW_SCORE[row] = scoreLine(ranks);
}
for (let row = 0; row < 65536; row++) RIGHT[row] = reverse(LEFT[reverse(row)]);

function validateBoard(board) {
  if (!Array.isArray(board) || board.length !== 16) {
    throw new TypeError("Autoplay needs a board containing exactly 16 tile values.");
  }
  for (let i = 0; i < 16; i++) {
    const value = board[i];
    if (value === 0) continue;
    const rank = Math.log2(value);
    if (!Number.isSafeInteger(value) || value < 2 || !Number.isInteger(rank) || 2 ** rank !== value) {
      throw new TypeError("Autoplay tiles must be zero or safe whole-number powers of two.");
    }
  }
}

function transpose(board) {
  return [
    (board[0] & 15) | ((board[1] & 15) << 4) | ((board[2] & 15) << 8) | ((board[3] & 15) << 12),
    ((board[0] >>> 4) & 15) | (board[1] & 240) | ((board[2] & 240) << 4) | ((board[3] & 240) << 8),
    ((board[0] >>> 8) & 15) | ((board[1] >>> 4) & 240) | (board[2] & 3840) | ((board[3] & 3840) << 4),
    ((board[0] >>> 12) & 15) | ((board[1] >>> 8) & 240) | ((board[2] >>> 4) & 3840) | (board[3] & 61440)
  ];
}

function movePacked(board, direction) {
  const rows = direction % 2 === 0 ? transpose(board) : board;
  if (rows.some(row => OVERFLOW[row])) throw new RangeError("This board needs the large-tile autoplay search.");
  const table = direction === 0 || direction === 3 ? LEFT : RIGHT;
  let moved = rows.map(row => table[row]);
  if (direction % 2 === 0) moved = transpose(moved);
  return moved.every((row, i) => row === board[i]) ? null : moved;
}

function moveWide(board, direction) {
  const moved = new Array(16).fill(0);
  for (let line = 0; line < 4; line++) {
    const indices = [];
    for (let offset = 0; offset < 4; offset++) {
      indices.push(direction === 0 ? offset * 4 + line :
        direction === 1 ? line * 4 + 3 - offset :
        direction === 2 ? (3 - offset) * 4 + line : line * 4 + offset);
    }
    const merged = mergeLine(indices.map(index => board[index]));
    indices.forEach((index, i) => { moved[index] = merged[i]; });
  }
  return moved.every((rank, i) => rank === board[i]) ? null : moved;
}

const packed = {
  move: movePacked,
  empty: board => EMPTY[board[0]] + EMPTY[board[1]] + EMPTY[board[2]] + EMPTY[board[3]],
  evaluate(board) {
    const columns = transpose(board);
    return ROW_SCORE[board[0]] + ROW_SCORE[board[1]] + ROW_SCORE[board[2]] + ROW_SCORE[board[3]] +
      ROW_SCORE[columns[0]] + ROW_SCORE[columns[1]] + ROW_SCORE[columns[2]] + ROW_SCORE[columns[3]];
  },
  unpack: board => board.flatMap(row => [0, 1, 2, 3].map(column => {
    const rank = (row >>> (column * 4)) & 15;
    return rank ? 2 ** rank : 0;
  }))
};

const wide = {
  move: moveWide,
  empty: board => board.filter(rank => rank === 0).length,
  evaluate(board) {
    let result = 0;
    for (let i = 0; i < 4; i++) {
      result += scoreLine(board.slice(i * 4, i * 4 + 4));
      result += scoreLine([board[i], board[i + 4], board[i + 8], board[i + 12]]);
    }
    return result;
  },
  unpack: board => board.map(rank => rank ? 2 ** rank : 0)
};

function createState(board, depth) {
  const ranks = board.map(value => value ? Math.log2(value) : 0);
  // Search may add at most one 4 per ply. Below this bound a 65536 tile is
  // impossible; larger games use ordinary arrays of ranks with no bit packing.
  if (board.reduce((sum, value) => sum + value, 0) + depth * 4 >= 65536) {
    return { state: ranks, backend: wide };
  }
  return {
    state: [0, 1, 2, 3].map(row => [0, 1, 2, 3].reduce(
      (value, column) => value | (ranks[row * 4 + column] << (column * 4)), 0)),
    backend: packed
  };
}

// Predicts only the slide and merges; the real game chooses its random spawn.
export function simulateMove(board, direction) {
  validateBoard(board);
  if (!Number.isInteger(direction) || direction < 0 || direction > 3) {
    throw new TypeError("Move direction must be 0, 1, 2, or 3.");
  }
  const { state, backend } = createState(board, 0);
  const moved = backend.move(state, direction);
  return moved ? backend.unpack(moved) : null;
}

export function chooseMove(board, options = {}) {
  validateBoard(board);
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    throw new TypeError("Autoplay options must be an object.");
  }
  const empties = board.filter(value => value === 0).length;
  const maxDepth = options.maxDepth ?? (empties >= 8 ? 3 : empties >= 4 ? 4 : 5);
  const requestedBudget = options.budgetMs ?? 120;
  if (!Number.isInteger(maxDepth) || maxDepth < 1 || maxDepth > 6) {
    throw new RangeError("Autoplay search depth must be between 1 and 6.");
  }
  if (!Number.isFinite(requestedBudget) || requestedBudget < 0) {
    throw new RangeError("Autoplay search time must be a finite, non-negative number.");
  }
  const start = performance.now(), deadline = start + Math.min(requestedBudget, 120);
  const { state, backend } = createState(board, maxDepth);
  let nodes = 0, aborted = false, finishedDepth = 0;
  const cache = new Map();

  function player(current, depth, probability) {
    nodes++;
    if ((nodes & 127) === 0 && performance.now() >= deadline) aborted = true;
    if (depth === 0 || probability < 0.0001 || aborted) return backend.evaluate(current);
    const key = `${current.join(",")},${depth},${Math.floor(-Math.log10(probability))}`;
    const cached = cache.get(key);
    if (cached !== undefined) return cached;
    let best = -Infinity;
    for (let direction = 0; direction < 4; direction++) {
      const moved = backend.move(current, direction);
      if (moved) best = Math.max(best, chance(moved, depth, probability));
      if (aborted) break;
    }
    if (best === -Infinity) best = backend.evaluate(current) - 800000;
    if (!aborted) cache.set(key, best);
    return best;
  }

  function chance(current, depth, probability) {
    const empty = backend.empty(current);
    if (!empty) return player(current, depth - 1, probability);
    let total = 0;
    for (let position = 0; position < 16; position++) {
      const index = backend === packed ? position >>> 2 : position;
      const shift = backend === packed ? (position & 3) * 4 : 0;
      if (backend === packed ? ((current[index] >>> shift) & 15) : current[index]) continue;
      const next = current.slice();
      next[index] = backend === packed ? current[index] | (1 << shift) : 1;
      total += 0.9 * player(next, depth - 1, probability * 0.9 / empty);
      if (aborted) return 0; // This incomplete round is discarded by the caller.
      next[index] = backend === packed ? current[index] | (2 << shift) : 2;
      total += 0.1 * player(next, depth - 1, probability * 0.1 / empty);
      if (aborted) return 0;
    }
    return total / empty;
  }

  const candidates = [0, 1, 2, 3]
    .map(direction => ({ direction, board: backend.move(state, direction) }))
    .filter(candidate => candidate.board);
  let chosen = -1;
  for (let depth = 1; depth <= maxDepth; depth++) {
    if (performance.now() >= deadline) break;
    cache.clear();
    const round = [];
    for (const candidate of candidates) {
      round.push({ direction: candidate.direction, score: chance(candidate.board, depth, 1) });
      if (aborted) break;
    }
    if (aborted) break;
    round.sort((a, b) => b.score - a.score);
    chosen = round[0]?.direction ?? -1;
    finishedDepth = depth;
  }
  if (chosen < 0 && candidates.length) {
    chosen = candidates.sort((a, b) => backend.evaluate(b.board) - backend.evaluate(a.board))[0].direction;
  }
  const moved = candidates.find(candidate => candidate.direction === chosen)?.board;
  const gains = moved ? backend.empty(moved) - empties : 0;
  return {
    direction: chosen,
    explanation: chosen < 0 ? "No legal moves remain." :
      `${DIRECTIONS[chosen]}: ${gains ? "merge matching tiles and create space" :
        "keep the larger tiles ordered while preparing the next merge"}.`,
    depth: finishedDepth,
    nodes,
    elapsedMs: Math.round(performance.now() - start)
  };
}
