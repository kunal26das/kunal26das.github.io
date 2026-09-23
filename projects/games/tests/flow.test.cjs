const { test } = require('node:test');
const assert = require('node:assert/strict');
const engine = import('../flow/engine.mjs');

test('every published puzzle has distinct paired endpoints and a full, legal solution', async () => {
  const { PUZZLES, solvePuzzle, inspectPaths, adjacent, FlowGame } = await engine;
  for (const puzzle of PUZZLES) {
    assert.equal(new Set(puzzle.pairs.flat()).size, puzzle.pairs.length * 2, puzzle.id);
    const solution = solvePuzzle(puzzle);
    assert.ok(solution, puzzle.id);
    assert.ok(solution.visited >= puzzle.size ** 2, puzzle.id);
    assert.deepEqual(inspectPaths(puzzle, solution.paths), {
      valid: true, connected: puzzle.pairs.length, filled: puzzle.size ** 2, won: true
    });
    // Verify the solver independently, then reproduce through player actions.
    assert.equal(new Set(solution.paths.flat()).size, puzzle.size ** 2);
    const game = new FlowGame(puzzle);
    solution.paths.forEach((path, color) => {
      assert.equal(path[0], puzzle.pairs[color][0]);
      assert.equal(path.at(-1), puzzle.pairs[color][1]);
      assert.ok(game.start(path[0]));
      path.slice(1).forEach((cell, i) => {
        assert.ok(adjacent(path[i], cell, puzzle.size));
        assert.ok(game.extend(cell), `${puzzle.id}: ${path[i]} to ${cell}`);
      });
      assert.equal(game.active, null);
    });
    assert.equal(game.progress.won, true);
    assert.equal(game.revealed, false);
  }
});

test('paths may begin at either matching endpoint', async () => {
  const { FlowGame, PUZZLES } = await engine;
  const game = new FlowGame(PUZZLES[0]);
  assert.ok(game.start(7));
  [3, 2, 1, 0].forEach(cell => assert.ok(game.extend(cell)));
  assert.equal(game.progress.connected, 1);
  assert.equal(game.active, null);
});

test('diagonals, row wrapping, off-board cells and non-neighbor jumps are rejected', async () => {
  const { FlowGame, PUZZLES, adjacent } = await engine;
  const game = new FlowGame(PUZZLES[0]);
  game.start(0);
  [5, -1, 16, 2, 0.5].forEach(cell => assert.equal(game.extend(cell), false));
  assert.deepEqual(game.paths[0], [0]);
  assert.equal(adjacent(3, 4, 4), false);
  assert.equal(adjacent(0, 5, 4), false);
  assert.equal(adjacent(0, 4, 4), true);
});

test('another pair’s endpoint or path cannot be crossed', async () => {
  const { FlowGame, PUZZLES } = await engine;
  const game = new FlowGame(PUZZLES[0]);
  game.start(0);
  assert.equal(game.extend(4), false);
  game.extend(1);
  game.extend(5);
  game.start(4);
  assert.equal(game.extend(5), false);
  assert.deepEqual(game.paths[1], [4]);
  assert.equal(game.progress.valid, true);
});

test('retracing shortens a path, frees cells, and never creates a self-crossing', async () => {
  const { FlowGame, PUZZLES } = await engine;
  const game = new FlowGame(PUZZLES[0]);
  game.start(0);
  [1, 2, 3, 2].forEach(cell => assert.ok(game.extend(cell)));
  assert.deepEqual(game.paths[0], [0, 1, 2]);
  assert.equal(game.owner(3), null);
  assert.equal(game.back(), true);
  assert.deepEqual(game.paths[0], [0, 1]);
  game.back();
  assert.equal(game.back(), false);
  assert.equal(game.progress.valid, true);
});

test('selecting an existing path resumes it and selecting its endpoint redraws it', async () => {
  const { FlowGame, PUZZLES } = await engine;
  const game = new FlowGame(PUZZLES[0]);
  game.start(0);
  [1, 2, 3, 7].forEach(cell => game.extend(cell));
  assert.equal(game.progress.connected, 1);
  game.start(2);
  assert.deepEqual(game.paths[0], [0, 1, 2]);
  assert.equal(game.progress.connected, 0);
  game.start(7);
  assert.deepEqual(game.paths[0], [7]);
});

test('connecting every pair without filling the board does not win', async () => {
  const { inspectPaths } = await engine;
  const puzzle = { size: 3, pairs: [[0, 2], [6, 8]] };
  assert.deepEqual(inspectPaths(puzzle, [[0, 1, 2], [6, 7, 8]]), {
    valid: true, connected: 2, filled: 6, won: false
  });
});

test('validation rejects crossings, repeated cells, wrong starts, and passing an endpoint', async () => {
  const { inspectPaths } = await engine;
  const puzzle = { size: 3, pairs: [[0, 2], [6, 8]] };
  for (const paths of [
    [[0, 1, 4, 5, 2], [6, 7, 4, 5, 8]],
    [[0, 1, 0, 1, 2], [6, 7, 8]],
    [[1, 2], [6, 7, 8]],
    [[0, 1, 2, 5], [6, 7, 8]],
    [[0, 3, 6, 7, 4, 5, 2], [8]]
  ]) assert.equal(inspectPaths(puzzle, paths).valid, false);
});

test('a revealed solution stays explicitly marked and reset restores a manual game', async () => {
  const { FlowGame, PUZZLES } = await engine;
  const game = new FlowGame(PUZZLES[3]);
  assert.ok(game.reveal());
  assert.equal(game.revealed, true);
  assert.equal(game.progress.won, true);
  assert.equal(game.start(0), false);
  game.reset();
  assert.equal(game.revealed, false);
  assert.equal(game.progress.connected, 0);
  assert.equal(game.progress.filled, PUZZLES[3].pairs.length * 2);
  assert.equal(game.start(0), true);
});

test('solver rejects the original console demo’s unfillable endpoint arrangement', async () => {
  const { solvePuzzle } = await engine;
  assert.equal(solvePuzzle({ size: 5, pairs: [[0, 19], [12, 16], [15, 24], [17, 20], [4, 14]] }), null);
});

test('starting on an empty square cannot create a disconnected path', async () => {
  const { FlowGame, PUZZLES } = await engine;
  const game = new FlowGame(PUZZLES[0]);
  assert.equal(game.start(1), false);
  assert.equal(game.extend(2), false);
  assert.deepEqual(game.paths, [[], [], []]);
});
