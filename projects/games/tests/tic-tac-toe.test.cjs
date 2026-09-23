const { test } = require('node:test');
const assert = require('node:assert/strict');
const engine = import('../tic-tac-toe/engine.mjs');

test('normal turns alternate, reject occupied cells, and preserve earlier boards', async () => {
  const { place, nextMark } = await engine;
  const empty = Array(9).fill(null);
  const first = place(empty, 4);
  assert.equal(first[4], 'X');
  assert.equal(nextMark(first), 'O');
  assert.equal(place(first, 4), null);
  for (const index of [-1, 9, 1.5, null]) assert.equal(place(first, index), null);
  assert.ok(empty.every(value => value === null));
  assert.equal(place(first, 0)[0], 'O');
});

test('all winning lines, full draws and terminal move rejection', async () => {
  const { LINES, outcome, place, bestMove } = await engine;
  for (const line of LINES) {
    const board = Array(9).fill(null);
    line.forEach(index => { board[index] = 'X'; });
    assert.deepEqual(outcome(board), { winner: 'X', line });
    assert.equal(place(board, board.indexOf(null)), null);
    assert.equal(bestMove(board), null);
  }
  assert.equal(outcome(['X','O','X','X','O','O','O','X','X']).winner, 'draw');
});

test('look-ahead takes an immediate win and blocks a forced loss', async () => {
  const { bestMove } = await engine;
  assert.equal(bestMove(['X','X',null,'O','O',null,null,null,null]), 2);
  assert.equal(bestMove(['X','X',null,null,'O',null,null,null,null]), 2);
  const frozen = Object.freeze(Array(9).fill(null));
  assert.equal(bestMove(frozen), 4);
});

test('the computer never loses against any sequence of human moves, as X or O', async () => {
  const { outcome, place, nextMark, bestMove } = await engine;
  for (const computer of ['X', 'O']) {
    const visited = new Set();
    let finished = 0;
    function walk(board) {
      const key = board.map(cell => cell || '-').join('');
      if (visited.has(key)) return;
      visited.add(key);
      const result = outcome(board).winner;
      if (result) { assert.ok(result === computer || result === 'draw'); finished++; return; }
      if (nextMark(board) === computer) walk(place(board, bestMove(board)));
      else board.forEach((cell, index) => { if (!cell) walk(place(board, index)); });
    }
    walk(Array(9).fill(null));
    assert.ok(finished > 10, 'explores multiple actual end games');
  }
});
