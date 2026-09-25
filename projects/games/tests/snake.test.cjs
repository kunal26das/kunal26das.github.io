const { test, before } = require('node:test');
const assert = require('node:assert/strict');
let Snake;
before(async () => ({ Snake } = await import('../snake/engine.mjs')));
const point = (x, y) => ({ x, y });

test('a ready game waits for an explicit start and keeps its initial food', () => {
  const game = new Snake({ random: () => 0 });
  const initial = game.snapshot();
  assert.equal(initial.status, 'ready');
  assert.equal(initial.snake.length, 3);
  assert.equal(game.turn('up'), false);
  assert.equal(game.step(), false);
  game.advance(10000);
  assert.deepEqual(game.snapshot(), initial);
  assert.equal(game.start(), true);
  assert.deepEqual(game.food, initial.food);
  assert.equal(game.status, 'playing');
  assert.equal(game.start(), false);
});

test('time advances at the chosen interval and multiple elapsed ticks are processed', () => {
  const game = new Snake();
  game.start();
  game.advance(game.interval - 1);
  assert.equal(game.steps, 0);
  game.advance(1);
  assert.equal(game.steps, 1);
  assert.deepEqual(game.snake[0], point(9, 8));
  game.advance(game.interval * 2);
  assert.equal(game.steps, 3);
  assert.deepEqual(game.snake[0], point(11, 8));
});

test('two quick turns are buffered and applied on separate steps without reversing', () => {
  const game = new Snake();
  game.start();
  assert.equal(game.turn('left'), false);
  assert.equal(game.turn('right'), false);
  assert.equal(game.turn('up'), true);
  assert.equal(game.turn('down'), false);
  assert.equal(game.turn('left'), true);
  assert.equal(game.turn('down'), false);
  assert.deepEqual(game.queuedDirections, ['up', 'left']);
  game.step();
  assert.deepEqual(game.snake[0], point(8, 7));
  assert.equal(game.direction, 'up');
  game.step();
  assert.deepEqual(game.snake[0], point(7, 7));
  assert.equal(game.direction, 'left');
  assert.deepEqual(game.queuedDirections, []);
});

test('food grows the snake by one and increments the score, ordinary movement does not', () => {
  const game = new Snake({ random: () => 0 });
  game.start();
  game.food = point(9, 8);
  const oldTail = { ...game.snake.at(-1) };
  game.step();
  assert.equal(game.score, 1);
  assert.equal(game.snake.length, 4);
  assert.deepEqual(game.snake.at(-1), oldTail);
  assert.equal(game.lastResult, 'food');
  assert.ok(!game.snake.some(cell => cell.x === game.food.x && cell.y === game.food.y));
  game.step();
  assert.equal(game.score, 1);
  assert.equal(game.snake.length, 4);
  assert.equal(game.lastResult, 'move');
});

test('moving into the vacating tail square is legal', () => {
  const game = new Snake({ size: 4 });
  game.start();
  game.snake = [point(1, 1), point(1, 2), point(0, 2), point(0, 1)];
  game.direction = 'up';
  game.food = point(3, 3);
  game.turn('left');
  assert.equal(game.step(), true);
  assert.equal(game.status, 'playing');
  assert.deepEqual(game.snake, [point(0, 1), point(1, 1), point(1, 2), point(0, 2)]);
});

test('the tail is occupied on a growth tick', () => {
  const game = new Snake({ size: 4 });
  game.start();
  game.snake = [point(1, 1), point(1, 2), point(0, 2), point(0, 1)];
  game.direction = 'up';
  game.food = point(0, 1);
  game.turn('left');
  assert.equal(game.step(), false);
  assert.equal(game.status, 'over');
  assert.equal(game.lastResult, 'self');
});

test('body collision ends the game without overwriting the board', () => {
  const game = new Snake({ size: 4 });
  game.start();
  game.snake = [point(1, 1), point(1, 2), point(0, 2), point(0, 1), point(0, 0)];
  game.direction = 'up';
  game.food = point(3, 3);
  const before = game.snake.map(cell => ({ ...cell }));
  game.turn('left');
  game.step();
  assert.equal(game.status, 'over');
  assert.equal(game.lastResult, 'self');
  assert.deepEqual(game.snake, before);
  const terminal = game.snapshot();
  assert.equal(game.turn('up'), false);
  game.step(); game.pause(); game.advance(10000);
  assert.deepEqual(game.snapshot(), terminal);
});

test('all four edges are solid', () => {
  for (const [direction, head] of [['up', point(2, 0)], ['right', point(3, 2)], ['down', point(2, 3)], ['left', point(0, 2)]]) {
    const game = new Snake({ size: 4 });
    game.start();
    game.snake = [head];
    game.direction = direction;
    game.food = point(1, 1);
    game.step();
    assert.equal(game.status, 'over', direction);
    assert.equal(game.lastResult, 'wall', direction);
    assert.deepEqual(game.snake[0], head);
  }
});

test('the last food fills the board and wins without attempting another random spawn', () => {
  let draws = 0;
  const game = new Snake({ size: 4, random: () => { draws++; return 0; } });
  game.start();
  game.snake = [point(2, 0), point(1, 0), point(0, 0), point(0, 1), point(1, 1), point(2, 1), point(3, 1), point(3, 2), point(2, 2), point(1, 2), point(0, 2), point(0, 3), point(1, 3), point(2, 3), point(3, 3)];
  game.direction = 'right';
  game.food = point(3, 0);
  game.score = 12;
  const drawsBefore = draws;
  game.step();
  assert.equal(game.status, 'won');
  assert.equal(game.lastResult, 'won');
  assert.equal(game.score, 13);
  assert.equal(game.snake.length, 16);
  assert.equal(new Set(game.snake.map(cell => cell.y * 4 + cell.x)).size, 16);
  assert.equal(game.food, null);
  assert.equal(draws, drawsBefore);
  const terminal = game.snapshot();
  game.step(); game.turn('down'); game.advance(1000);
  assert.deepEqual(game.snapshot(), terminal);
  game.start();
  assert.equal(game.status, 'playing');
  assert.equal(game.score, 0);
  assert.equal(game.snake.length, 3);
});

test('food placement chooses only free squares, including the final available square', () => {
  const game = new Snake({ size: 4, random: () => .999999999 });
  assert.deepEqual(game.food, point(3, 3));
  game.snake = Array.from({ length: 15 }, (_, n) => point(n % 4, Math.floor(n / 4)));
  assert.deepEqual(game.placeFood(), point(3, 3));
  game.snake.push(point(3, 3));
  assert.equal(game.placeFood(), null);
});

test('pausing freezes play, discards queued turns and resumes with a full interval', () => {
  const game = new Snake();
  game.start();
  game.advance(game.interval - 1);
  game.turn('up');
  assert.equal(game.pause(), true);
  assert.deepEqual(game.queuedDirections, []);
  const paused = game.snapshot();
  game.advance(10000); game.turn('left'); game.step();
  assert.deepEqual(game.snapshot(), paused);
  game.start();
  assert.deepEqual(game.snake, paused.snake);
  game.advance(1);
  assert.equal(game.steps, 0);
  game.advance(game.interval - 1);
  assert.equal(game.steps, 1);
  assert.equal(game.direction, 'right');
});

test('reset clears played state and waits for Start, while Play again starts a fresh run', () => {
  const game = new Snake();
  game.start();
  game.food = point(9, 8);
  game.step();
  game.turn('up');
  game.reset();
  assert.equal(game.status, 'ready');
  assert.equal(game.score, 0);
  assert.equal(game.steps, 0);
  assert.equal(game.direction, 'right');
  assert.deepEqual(game.queuedDirections, []);
  assert.equal(game.snake.length, 3);
  game.start();
  game.advance(100000);
  assert.equal(game.status, 'over');
  game.start();
  assert.equal(game.status, 'playing');
  assert.equal(game.steps, 0);
});

test('a snapshot cannot mutate the game and invalid inputs do not advance play', () => {
  const game = new Snake();
  game.start();
  game.turn('up');
  const before = game.snapshot();
  const copy = game.snapshot();
  copy.snake[0].x = -9;
  copy.food.y = -9;
  copy.queuedDirections.push('left');
  assert.equal(game.turn('toString'), false);
  assert.equal(game.turn('constructor'), false);
  game.advance(NaN); game.advance(-1); game.advance(Infinity);
  assert.deepEqual(game.snapshot(), before);
});
