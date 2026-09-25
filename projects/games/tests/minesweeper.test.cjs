const { test } = require('node:test');
const assert = require('node:assert/strict');
const engine = import('../minesweeper/engine.mjs');

function seeded(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
}

test('every possible first opening is safe, including all eight neighbors, at both sizes', async () => {
  const { Minesweeper, DIFFICULTIES, neighbors } = await engine;
  for (const config of Object.values(DIFFICULTIES)) {
    for (let first = 0; first < config.rows * config.columns; first += 1) {
      const game = new Minesweeper({ ...config, random: seeded(first + 3) });
      assert.equal(game.generated, false);
      assert.equal(game.reveal(first), true);
      assert.equal(game.cells.filter(cell => cell.mine).length, config.mines);
      for (const index of [first, ...neighbors(first, config.rows, config.columns)]) {
        assert.equal(game.cells[index].mine, false, `unsafe first ${first}, neighbor ${index}`);
        assert.equal(game.cells[index].revealed, true);
      }
      assert.equal(game.cells[first].adjacent, 0);
      assert.notEqual(game.status, 'lost');
    }
  }
});

test('neighbor counts are independently correct at corners, edges and interior cells', async () => {
  const { Minesweeper, neighbors } = await engine;
  assert.deepEqual(neighbors(0, 3, 3), [1, 3, 4]);
  assert.deepEqual(neighbors(2, 3, 3), [1, 4, 5]);
  assert.deepEqual(neighbors(4, 3, 3), [0, 1, 2, 3, 5, 6, 7, 8]);
  const game = new Minesweeper({ random: seeded(57) });
  game.reveal(27);
  game.cells.forEach((cell, index) => {
    const row = Math.floor(index / game.columns);
    const col = index % game.columns;
    const expected = game.cells.filter((candidate, other) => candidate.mine && other !== index &&
      Math.abs(Math.floor(other / game.columns) - row) <= 1 && Math.abs(other % game.columns - col) <= 1).length;
    assert.equal(cell.adjacent, expected);
  });
});

test('seeded boards reproduce the same mine positions without duplicate mines', async () => {
  const { Minesweeper } = await engine;
  const one = new Minesweeper({ random: seeded(987) });
  const two = new Minesweeper({ random: seeded(987) });
  one.reveal(19); two.reveal(19);
  assert.deepEqual(one.snapshot, two.snapshot);
  assert.equal(one.cells.filter(cell => cell.mine).length, 10);
});

test('flood fill reveals connected empty squares and their numbered boundary, but never a mine', async () => {
  const { Minesweeper } = await engine;
  // With random=0, mines occupy indices 2, 3 and 6; the zero region below them
  // opens all remaining safe cells except the numbered square at index 7.
  const game = new Minesweeper({ rows: 4, columns: 4, mines: 3, random: () => 0 });
  game.reveal(0);
  assert.deepEqual(game.cells.flatMap((cell, index) => cell.mine ? [index] : []), [2, 3, 6]);
  assert.equal(game.revealed, 12);
  assert.equal(game.cells[7].revealed, false);
  assert.equal(game.cells.filter(cell => cell.mine && cell.revealed).length, 0);
  assert.equal(game.status, 'playing');
  assert.equal(game.reveal(7), true);
  assert.equal(game.status, 'won');
});

test('flags before the first reveal neither generate a board nor allow an accidental opening', async () => {
  const { Minesweeper } = await engine;
  let randomCalls = 0;
  const game = new Minesweeper({ random: () => { randomCalls += 1; return 0; } });
  assert.equal(game.toggleFlag(0), true);
  assert.equal(game.reveal(0), false);
  assert.equal(game.status, 'ready');
  assert.equal(game.generated, false);
  assert.equal(randomCalls, 0);
  assert.equal(game.flags, 1);
  assert.equal(game.remaining, 9);
  assert.equal(game.toggleFlag(0), true);
  assert.equal(game.reveal(0), true);
  assert.equal(randomCalls, 10);
});

test('flood fill respects flags on safe cells until the player removes them', async () => {
  const { Minesweeper } = await engine;
  const game = new Minesweeper({ rows: 4, columns: 4, mines: 2, random: () => 0 });
  game.toggleFlag(15);
  game.reveal(0);
  assert.equal(game.cells[15].revealed, false);
  assert.equal(game.cells[15].flagged, true);
  game.reveal(7);
  assert.equal(game.status, 'playing');
  assert.equal(game.safeRemaining, 1);
  game.toggleFlag(15);
  game.reveal(15);
  assert.equal(game.status, 'won');
});

test('flags are limited to the mine count and cannot be placed on revealed squares', async () => {
  const { Minesweeper } = await engine;
  const game = new Minesweeper({ rows: 4, columns: 4, mines: 2, random: () => 0 });
  game.toggleFlag(2); game.toggleFlag(3);
  assert.equal(game.remaining, 0);
  assert.equal(game.toggleFlag(7), false);
  assert.equal(game.toggleFlag(2), true);
  assert.equal(game.toggleFlag(7), true);
  game.reveal(0);
  assert.equal(game.toggleFlag(0), false);
});

test('a mine ends the round, identifies the explosion, and freezes all subsequent actions', async () => {
  const { Minesweeper } = await engine;
  const game = new Minesweeper({ random: seeded(9) });
  game.reveal(27);
  const mine = game.cells.findIndex(cell => cell.mine);
  const safe = game.cells.findIndex(cell => !cell.mine && !cell.revealed);
  assert.ok(safe >= 0);
  game.toggleFlag(safe);
  assert.equal(game.reveal(mine), true);
  assert.equal(game.status, 'lost');
  assert.equal(game.exploded, mine);
  assert.equal(game.cells[mine].revealed, true);
  const terminal = game.snapshot;
  assert.equal(game.toggleFlag(safe), false);
  assert.equal(game.reveal(safe), false);
  assert.equal(game.reveal(63), false);
  assert.deepEqual(game.snapshot, terminal);
});

test('opening every safe square wins without requiring flags and freezes the field', async () => {
  const { Minesweeper } = await engine;
  const game = new Minesweeper({ random: seeded(65) });
  game.reveal(0);
  game.cells.forEach((cell, index) => { if (!cell.mine) game.reveal(index); });
  assert.equal(game.status, 'won');
  assert.equal(game.flags, 0);
  assert.equal(game.revealed, 54);
  assert.equal(game.safeRemaining, 0);
  const terminal = game.snapshot;
  const mine = game.cells.findIndex(cell => cell.mine);
  assert.equal(game.reveal(mine), false);
  assert.equal(game.toggleFlag(mine), false);
  assert.deepEqual(game.snapshot, terminal);
});

test('reset discards a lost or won board, every flag, and the previous opening location', async () => {
  const { Minesweeper } = await engine;
  const game = new Minesweeper({ random: seeded(72) });
  game.toggleFlag(63);
  game.reveal(0);
  game.reveal(game.cells.findIndex(cell => cell.mine && !cell.flagged));
  assert.equal(game.status, 'lost');
  game.reset();
  assert.equal(game.status, 'ready');
  assert.equal(game.generated, false);
  assert.equal(game.flags, 0);
  assert.equal(game.exploded, null);
  assert.equal(game.revealed, 0);
  assert.ok(game.cells.every(cell => !cell.mine && !cell.revealed && !cell.flagged && cell.adjacent === 0));
  game.reveal(63);
  assert.equal(game.cells[63].adjacent, 0);
  game.cells.forEach((cell, index) => { if (!cell.mine) game.reveal(index); });
  assert.equal(game.status, 'won');
  game.reset();
  assert.equal(game.status, 'ready');
  assert.equal(game.safeRemaining, 54);
});

test('invalid input cannot mutate the field, and debug snapshots are detached', async () => {
  const { Minesweeper } = await engine;
  const game = new Minesweeper();
  const initial = game.snapshot;
  for (const index of [-1, 64, 0.1, NaN, '0', undefined]) {
    assert.equal(game.reveal(index), false);
    assert.equal(game.toggleFlag(index), false);
  }
  assert.deepEqual(game.snapshot, initial);
  const copy = game.snapshot;
  copy.cells[0].mine = true;
  copy.status = 'won';
  assert.deepEqual(game.snapshot, initial);
});

test('dense custom boards still protect the first square and invalid settings fail clearly', async () => {
  const { Minesweeper } = await engine;
  const game = new Minesweeper({ rows: 2, columns: 2, mines: 3, random: () => 0 });
  game.reveal(3);
  assert.equal(game.cells[3].mine, false);
  assert.equal(game.status, 'won');
  assert.equal(game.cells.filter(cell => cell.mine).length, 3);
  for (const config of [{ rows: 1 }, { columns: 0 }, { mines: 64 }, { mines: 0 }, { rows: 8.5 }]) assert.throws(() => new Minesweeper(config), RangeError);
  assert.throws(() => new Minesweeper({ random: 5 }), TypeError);
  for (const value of [-1, 1, Infinity, NaN]) {
    const invalid = new Minesweeper({ random: () => value });
    assert.throws(() => invalid.reveal(0), RangeError);
    assert.equal(invalid.generated, false);
    assert.equal(invalid.cells.filter(cell => cell.mine).length, 0);
  }
});
