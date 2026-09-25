const { test } = require('node:test');
const assert = require('node:assert/strict');
const engine = import('../connect-four/engine.mjs');
const DRAW = [0,2,5,1,2,1,1,1,1,6,2,4,3,6,0,1,6,4,4,4,3,0,5,0,2,2,4,3,0,3,5,5,5,2,4,5,0,3,6,6,3,6];
async function play(sequence) {
  const { createBoard, drop } = await engine;
  return sequence.reduce((board, column) => {
    const next = drop(board, column);
    assert.ok(next, `column ${column} is legal`);
    return next;
  }, createBoard());
}

test('pieces obey gravity, alternate turns, and leave the original board unchanged', async () => {
  const { createBoard, nextPlayer, drop } = await engine;
  const empty = Object.freeze(createBoard());
  const first = drop(empty, 3);
  assert.equal(first[38], 1);
  assert.equal(nextPlayer(first), 2);
  const second = drop(first, 3);
  assert.equal(second[31], 2);
  assert.equal(second[38], 1);
  assert.equal(first[31], 0);
  assert.ok(empty.every(value => value === 0));
});

test('full columns and invalid column values are rejected without changing turns', async () => {
  const { createBoard, nextPlayer, drop, legalMoves } = await engine;
  const board = await play([0, 0, 0, 0, 0, 0]);
  assert.equal(drop(board, 0), null);
  assert.equal(nextPlayer(board), 1);
  assert.ok(!legalMoves(board).includes(0));
  for (const column of [-1, 7, 1.5, null, undefined, '3', NaN]) assert.equal(drop(createBoard(), column), null);
});

test('detects all 69 horizontal, vertical and diagonal winning windows for either piece', async () => {
  const { LINES, createBoard, outcome } = await engine;
  assert.equal(LINES.length, 69);
  for (const player of [1, 2]) {
    for (const line of LINES) {
      const board = createBoard();
      line.forEach(index => { board[index] = player; });
      assert.deepEqual(outcome(board), { winner: player, line });
    }
  }
});

test('legal games can win in all four directions and cannot continue after a win', async () => {
  const { outcome, drop, legalMoves, bestMove } = await engine;
  for (const sequence of [
    [0,6,1,6,2,5,3], [0,1,0,1,0,1,0],
    [0,1,1,2,4,2,2,3,4,3,5,3,3], [6,5,5,4,2,4,4,3,2,3,1,3,3],
    [6,0,6,1,5,2,5,3]
  ]) {
    const board = await play(sequence);
    assert.equal(outcome(board).winner, sequence.length % 2 ? 1 : 2);
    assert.equal(outcome(board).line.length, 4);
    assert.deepEqual(legalMoves(board), []);
    assert.equal(bestMove(board), null);
    for (let column = 0; column < 7; column++) assert.equal(drop(board, column), null);
  }
});

test('a complete 42-move legal draw has no winner and no further move', async () => {
  const { outcome, drop, bestMove } = await engine;
  const board = await play(DRAW);
  assert.equal(board.filter(Boolean).length, 42);
  assert.deepEqual(outcome(board), { winner: 'draw', line: [] });
  assert.equal(drop(board, 3), null);
  assert.equal(bestMove(board), null);
});

test('computer takes immediate horizontal, vertical, and diagonal wins', async () => {
  const { bestMove, drop, outcome, nextPlayer } = await engine;
  for (const sequence of [[0,6,1,6,2,5], [2,3,2,3,2,4], [0,1,1,2,4,2,2,3,4,3,5,3], [6,0,6,1,5,2,5]]) {
    const board = await play(sequence);
    const choice = bestMove(board, { maxNodes: 1 });
    assert.equal(outcome(drop(board, choice)).winner, nextPlayer(board));
  }
});

test('computer blocks immediate threats and takes its own win before blocking', async () => {
  const { bestMove } = await engine;
  assert.equal(bestMove(await play([6,0,6,1,5,2])), 3);
  assert.equal(bestMove(await play([0,4,1,4,6,4])), 4);
  assert.equal(bestMove(await play([0,6,1,6,2,6])), 3, 'win now instead of blocking column 6');
});

test('bounded search returns a legal answer, respects immutable input, and favors central play', async () => {
  const { createBoard, bestMove, legalMoves } = await engine;
  assert.equal(bestMove(Object.freeze(createBoard())), 3);
  const board = Object.freeze(await play([3,3,2,2,5,4,1,3]));
  const saved = board.slice();
  assert.ok(legalMoves(board).includes(bestMove(board, { maxNodes: 1, timeLimitMs: 1 })));
  assert.deepEqual(board, saved);
});

test('computer replies remain legal through complete games as either first or second', async () => {
  const { createBoard, bestMove, legalMoves, drop, outcome, nextPlayer } = await engine;
  for (const computer of [1, 2]) {
    let board = createBoard();
    for (let move = 0; move < 42 && !outcome(board).winner; move++) {
      const moves = legalMoves(board);
      const column = nextPlayer(board) === computer ? bestMove(board, { maxDepth: 4, maxNodes: 10000 }) : moves[(move * 5 + 2) % moves.length];
      assert.ok(moves.includes(column));
      board = drop(board, column);
      assert.equal(board.filter(Boolean).length, move + 1);
    }
    assert.ok(outcome(board).winner);
    assert.notEqual(outcome(board).winner, 3 - computer);
  }
});
