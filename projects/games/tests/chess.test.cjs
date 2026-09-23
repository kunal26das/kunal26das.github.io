const test = require('node:test');
const assert = require('node:assert/strict');
const engine = import('../chess/engine.mjs');
const immediate = () => Promise.resolve();

function assertSquares(path, length, start) {
  assert.equal(path.length, length);
  assert.equal(path[0], start, 'The chosen starting square stays first.');
  assert.equal(new Set(path).size, length, 'Every square is unique.');
  assert.ok(path.every(square => Number.isInteger(square) && square >= 0 && square < 64));
}

test('Every starting square produces a complete, legal 64-square knight tour', async () => {
  const {solvePuzzle} = await engine;
  for (let start = 0; start < 64; start++) {
    const result = await solvePuzzle('knight', start, {scheduler: immediate});
    assert.equal(result.status, 'solved', `Knight start ${start}`);
    assertSquares(result.path, 64, start);
    for (let step = 1; step < result.path.length; step++) {
      const a = result.path[step - 1], b = result.path[step];
      const dr = Math.abs(Math.floor(a / 8) - Math.floor(b / 8));
      const dc = Math.abs(a % 8 - b % 8);
      assert.ok((dr === 2 && dc === 1) || (dr === 1 && dc === 2), `Illegal knight move ${a} to ${b}`);
    }
  }
});

test('Every chosen square is included in an eight-queen arrangement without attacks', async () => {
  const {solvePuzzle} = await engine;
  for (let start = 0; start < 64; start++) {
    const result = await solvePuzzle('queens', start, {scheduler: immediate});
    assert.equal(result.status, 'solved', `Queen start ${start}`);
    assertSquares(result.path, 8, start);
    for (let i = 0; i < result.path.length; i++) {
      for (let j = i + 1; j < result.path.length; j++) {
        const a = result.path[i], b = result.path[j];
        const dr = Math.abs(Math.floor(a / 8) - Math.floor(b / 8));
        const dc = Math.abs(a % 8 - b % 8);
        assert.ok(dr !== 0 && dc !== 0 && dr !== dc, `Queens attack from ${a} and ${b}`);
      }
    }
  }
});

test('Rooks cover every row and column even when the chosen rook starts on the last row', async () => {
  const {solvePuzzle} = await engine;
  for (let start = 0; start < 64; start++) {
    const result = await solvePuzzle('rooks', start);
    assert.equal(result.status, 'solved');
    assertSquares(result.path, 8, start);
    assert.equal(new Set(result.path.map(square => Math.floor(square / 8))).size, 8);
    assert.equal(new Set(result.path.map(square => square % 8)).size, 8);
  }
});

test('Search limits never publish an incomplete solution', async () => {
  const {solvePuzzle} = await engine;
  for (const kind of ['knight', 'queens', 'rooks']) {
    const result = await solvePuzzle(kind, 56, {maxNodes: 1});
    assert.equal(result.status, 'limit');
    assert.deepEqual(result.path, []);
    assert.ok(result.nodes <= 1);
  }
});

test('Cooperative searches yield and can be cancelled before their next search slice', async () => {
  const {solvePuzzle} = await engine;
  for (const kind of ['knight', 'queens']) {
    const controller = new AbortController();
    let yields = 0;
    const result = await solvePuzzle(kind, 56, {
      signal: controller.signal, yieldEvery: 2,
      scheduler: async () => { yields++; controller.abort(); }
    });
    assert.equal(yields, 1);
    assert.equal(result.status, 'cancelled');
    assert.equal(result.nodes, 2);
    assert.deepEqual(result.path, []);
  }
});

test('Already cancelled requests do no work', async () => {
  const {solvePuzzle} = await engine;
  const controller = new AbortController(); controller.abort();
  const result = await solvePuzzle('rooks', 0, {signal: controller.signal});
  assert.deepEqual(result, {status: 'cancelled', path: [], nodes: 0});
});

test('Square labels and knight edges stay within the board', async () => {
  const {coordinate, knightNeighbors} = await engine;
  assert.equal(coordinate(0), 'a8'); assert.equal(coordinate(63), 'h1');
  assert.deepEqual(knightNeighbors(0).sort((a, b) => a - b), [10, 17]);
  assert.deepEqual(knightNeighbors(63).sort((a, b) => a - b), [46, 53]);
});

test('Invalid puzzle input and search limits are rejected', async () => {
  const {solvePuzzle} = await engine;
  await assert.rejects(solvePuzzle('bishop', 0), RangeError);
  for (const start of [-1, 64, 2.5, NaN, '5']) await assert.rejects(solvePuzzle('knight', start), RangeError);
  for (const maxNodes of [0, -1, Infinity, 1.1]) await assert.rejects(solvePuzzle('knight', 0, {maxNodes}), RangeError);
  await assert.rejects(solvePuzzle('knight', 0, {yieldEvery: 0}), RangeError);
});
