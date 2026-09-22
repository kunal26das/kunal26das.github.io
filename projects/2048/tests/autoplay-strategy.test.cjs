const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const { pathToFileURL } = require("node:url");
const strategy = import(pathToFileURL(path.join(__dirname, "../js/autoplay-strategy.mjs")));

// Verify the search's hypothetical moves against the actual game engine,
// disabling only the spawn so both results describe the same stage of a turn.
function createEngine() {
  const context = vm.createContext({ Math: Object.create(Math) });
  for (const filename of ["tile.js", "grid.js", "game_manager.js"]) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, "../js", filename), "utf8"), context);
  }
  const game = Object.create(context.GameManager.prototype);
  game.size = 4;
  game.addRandomTile = () => {};
  game.actuate = () => {};
  return (board, direction) => {
    game.grid = new context.Grid(4);
    board.forEach((value, index) => {
      if (value) game.grid.insertTile(new context.Tile({ x: index % 4, y: Math.floor(index / 4) }, value));
    });
    game.score = 0;
    game.over = false;
    game.won = true;
    game.keepPlaying = true;
    game.move(direction);
    const result = Array.from({ length: 16 }, (_, index) =>
      game.grid.cells[index % 4][Math.floor(index / 4)]?.value || 0);
    return result.every((value, i) => value === board[i]) ? null : result;
  };
}

function generator() {
  let seed = 26922;
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
}

const dead = [2, 4, 2, 4, 4, 2, 4, 2, 2, 4, 2, 4, 4, 2, 4, 2];

test("slide predictions match the actual engine in every direction for 1000 varied boards", async () => {
  const { simulateMove } = await strategy;
  const engineMove = createEngine(), random = generator();
  for (let sample = 0; sample < 1000; sample++) {
    const board = Array.from({ length: 16 }, () => random() < 0.3 ? 0 : 2 ** (1 + Math.floor(random() * 12)));
    for (let direction = 0; direction < 4; direction++) {
      assert.deepEqual(simulateMove(board, direction), engineMove(board, direction));
    }
  }
});

test("large tiles and hypothetical merges beyond 32768 do not overflow packed cells", async () => {
  const { simulateMove, chooseMove } = await strategy;
  const engineMove = createEngine();
  const fixtures = [
    [32768, 32768, 2, 2, ...Array(12).fill(0)],
    [16384, 16384, 16384, 16384, ...Array(12).fill(0)],
    [32768, 2, 0, 0, ...Array(12).fill(0)],
    [65536, 65536, 32768, 32768, ...Array(12).fill(0)],
    [2 ** 52, 2 ** 52, 2, 2, ...Array(12).fill(0)]
  ];
  for (const board of fixtures) {
    for (let direction = 0; direction < 4; direction++) {
      assert.deepEqual(simulateMove(board, direction), engineMove(board, direction));
    }
    const result = chooseMove(board, { maxDepth: 2, budgetMs: 30 });
    assert.notEqual(engineMove(board, result.direction), null);
  }
  assert.deepEqual(simulateMove(fixtures[0], 3).slice(0, 4), [65536, 4, 0, 0]);
});

test("full and sparse boards always receive a legal choice, including a zero-time fallback", async () => {
  const { chooseMove } = await strategy;
  const engineMove = createEngine(), random = generator();
  for (let sample = 0; sample < 80; sample++) {
    const board = Array.from({ length: 16 }, () => random() < sample % 4 / 5 ? 0 : 2 ** (1 + Math.floor(random() * 9)));
    const legal = [0, 1, 2, 3].filter(direction => engineMove(board, direction));
    const result = chooseMove(board, { budgetMs: sample % 2 ? 0 : 5, maxDepth: 2 });
    if (legal.length) {
      assert.ok(legal.includes(result.direction));
      assert.match(result.explanation, /^(Up|Right|Down|Left): /);
    } else assert.equal(result.direction, -1);
  }
});

test("terminal and empty boards have no suggested move", async () => {
  const { chooseMove } = await strategy;
  for (const board of [dead, Array(16).fill(0)]) {
    const result = chooseMove(board);
    assert.equal(result.direction, -1);
    assert.equal(result.explanation, "No legal moves remain.");
  }
});

test("a nearly full board's only legal direction is selected", async () => {
  const { chooseMove } = await strategy;
  // Rows are full and distinct; only the empty bottom row permits movement.
  const board = [2, 4, 8, 16, 4, 8, 16, 32, 8, 16, 32, 64, 0, 0, 0, 0];
  assert.equal(chooseMove(board).direction, 2);
});

test("planning never mutates the input or consumes random numbers", async () => {
  const { chooseMove, simulateMove } = await strategy;
  const board = Object.freeze([2, 2, 4, 8, 4, 8, 16, 32, 8, 16, 32, 64, 0, 0, 0, 0]);
  const before = [...board];
  const random = Math.random;
  Math.random = () => { throw new Error("The autoplay planner must not consume game randomness"); };
  try {
    const first = chooseMove(board, { maxDepth: 2 });
    const second = chooseMove(board, { maxDepth: 2 });
    assert.equal(first.direction, second.direction);
    assert.equal(first.explanation, second.explanation);
    assert.notEqual(simulateMove(board, first.direction), null);
  } finally { Math.random = random; }
  assert.deepEqual(board, before);
});

test("invalid board values cannot be rounded or packed into valid tiles", async () => {
  const { chooseMove, simulateMove } = await strategy;
  const invalid = [null, {}, [], Array(15).fill(0), Array(17).fill(0), Array(16)];
  for (const value of [1, -2, 3, 1.5, "2", null, undefined, NaN, Infinity, 2 ** 54, 2 ** 52 + 1]) {
    invalid.push([value, ...Array(15).fill(0)]);
  }
  for (const board of invalid) {
    assert.throws(() => chooseMove(board), TypeError);
    assert.throws(() => simulateMove(board, 0), TypeError);
  }
});

test("invalid directions and search limits fail with useful errors", async () => {
  const { chooseMove, simulateMove } = await strategy;
  for (const direction of [-1, 4, 0.5, "0", undefined, NaN]) {
    assert.throws(() => simulateMove(dead, direction), /direction/);
  }
  for (const options of [null, [], "fast"]) assert.throws(() => chooseMove(dead, options), /options/);
  for (const maxDepth of [0, 7, -1, 1.5, Infinity]) assert.throws(() => chooseMove(dead, { maxDepth }), /depth/);
  for (const budgetMs of [-1, NaN, Infinity, "120"]) assert.throws(() => chooseMove(dead, { budgetMs }), /time/);
});

test("worker replies retain request IDs and errors do not prevent the next request", async () => {
  const { chooseMove } = await strategy;
  const replies = [];
  let onMessage;
  const context = vm.createContext({
    chooseMove,
    Error,
    self: {
      addEventListener(type, listener) { assert.equal(type, "message"); onMessage = listener; },
      postMessage(message) { replies.push(message); }
    }
  });
  const worker = fs.readFileSync(path.join(__dirname, "../js/autoplay-worker.js"), "utf8");
  vm.runInContext(worker.replace(/^import[^\n]+\n/, ""), context);
  onMessage({ data: { id: 14, board: [3, ...Array(15).fill(0)] } });
  assert.equal(replies[0].id, 14);
  assert.match(replies[0].error, /powers of two/);
  onMessage({ data: { id: 15, board: dead } });
  assert.equal(replies[1].id, 15);
  assert.equal(replies[1].direction, -1);
  assert.equal(replies[1].error, undefined);
});
