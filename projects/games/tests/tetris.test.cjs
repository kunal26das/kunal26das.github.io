const { test, before } = require('node:test');
const assert = require('node:assert/strict');
let Tetris, SHAPES, rotateMatrix, canPlace, clearFullLines;
before(async () => ({ Tetris, SHAPES, rotateMatrix, canPlace, clearFullLines } = await import('../tetris/engine.mjs')));
const blank = () => Array.from({ length: 20 }, () => Array(10).fill(null));
const piece = (type, x, y, matrix = SHAPES[type].map(row => row.slice())) => ({ type, x, y, matrix });

test('starts with an empty board, a legal piece and a next piece', () => {
  const game = new Tetris(() => .5);
  assert.equal(game.status, 'ready');
  assert.equal(game.move(1), false);
  assert.equal(game.drop(), false);
  game.start();
  assert.equal(game.status, 'playing');
  assert.ok(canPlace(game.board, game.active));
  assert.ok(SHAPES[game.next]);
  assert.ok(game.board.every(row => row.every(cell => cell === null)));
});

test('every bag contains all seven pieces exactly once', () => {
  const game = new Tetris(() => .4);
  const first = [game.next, ...Array.from({ length: 6 }, () => game.drawPiece())];
  const second = Array.from({ length: 7 }, () => game.drawPiece());
  assert.deepEqual(first.slice().sort(), Object.keys(SHAPES).sort());
  assert.deepEqual(second.slice().sort(), Object.keys(SHAPES).sort());
});

test('all shapes contain four blocks and return after four rotations', () => {
  for (const shape of Object.values(SHAPES)) {
    assert.equal(shape.flat().filter(Boolean).length, 4);
    let rotated = shape;
    for (let i = 0; i < 4; i++) rotated = rotateMatrix(rotated);
    assert.deepEqual(rotated, shape);
    assert.deepEqual(rotateMatrix(rotateMatrix(shape), false), shape);
  }
});

test('collision rejects walls, floor and occupied squares, including during rotations', () => {
  const board = blank();
  board[18][5] = 'T';
  assert.equal(canPlace(board, piece('O', -1, 0)), false);
  assert.equal(canPlace(board, piece('O', 9, 0)), false);
  assert.equal(canPlace(board, piece('O', 2, 19)), false);
  assert.equal(canPlace(board, piece('O', 4, 17)), false);
  assert.equal(canPlace(board, piece('O', 3, 17)), true);
});

test('sideways motion stops at both walls without changing height', () => {
  const game = new Tetris();
  game.start();
  game.active = piece('I', 3, 4);
  for (let i = 0; i < 20; i++) game.move(-1);
  assert.equal(game.active.x, 0);
  assert.equal(game.active.y, 4);
  for (let i = 0; i < 20; i++) game.move(1);
  assert.equal(game.active.x, 6);
  assert.equal(game.active.y, 4);
});

test('rotation nudges a vertical line away from the right wall', () => {
  const game = new Tetris();
  game.start();
  game.active = piece('I', 9, 3, [[1], [1], [1], [1]]);
  assert.equal(game.rotate(), true);
  assert.equal(game.active.x, 6);
  assert.equal(game.active.matrix[0].length, 4);
  assert.ok(canPlace(game.board, game.active));
});

test('rotation blocked by a tight stack leaves the piece untouched', () => {
  const game = new Tetris();
  game.start();
  game.board = Array.from({ length: 20 }, () => Array(10).fill('O'));
  for (let x = 3; x < 7; x++) game.board[10][x] = null;
  game.active = piece('I', 3, 10);
  const original = JSON.stringify(game.active);
  assert.equal(game.rotate(), false);
  assert.equal(JSON.stringify(game.active), original);
});

test('hard drop locks a piece, awards distance points and spawns the preview', () => {
  const game = new Tetris();
  game.start();
  game.active = piece('O', 3, 0);
  const next = game.next;
  assert.equal(game.snapshot().ghostY, 18);
  game.drop();
  assert.equal(game.score, 36);
  assert.equal(game.pieces, 1);
  assert.equal(game.active.type, next);
  assert.deepEqual(game.board[19].slice(3, 5), ['O', 'O']);
  assert.equal(game.board.flat().filter(Boolean).length, 4);
});

test('soft drops score only successful steps, gravity does not', () => {
  const game = new Tetris();
  game.start();
  game.active = piece('O', 3, 0);
  game.down();
  assert.equal(game.score, 0);
  game.down(true);
  assert.equal(game.score, 1);
  game.active.y = 18;
  game.down(true);
  assert.equal(game.score, 1);
  assert.equal(game.pieces, 1);
});

test('clears four adjacent rows in one pass and retains blocks above', () => {
  const board = blank();
  board[15][2] = 'J';
  for (let y = 16; y < 20; y++) board[y].fill('O');
  const result = clearFullLines(board);
  assert.equal(result.count, 4);
  assert.equal(result.board.length, 20);
  assert.equal(result.board[19][2], 'J');
  assert.equal(result.board.flat().filter(Boolean).length, 1);
  assert.equal(board[15][2], 'J');
  assert.ok(board[19].every(Boolean));
});

test('four-line clear awards 800 points and advances level after ten total lines', () => {
  const game = new Tetris();
  game.start();
  game.lines = 6;
  for (let y = 16; y < 20; y++) {
    game.board[y].fill('O');
    game.board[y][5] = null;
  }
  game.active = piece('I', 5, 16, [[1], [1], [1], [1]]);
  game.drop();
  assert.equal(game.score, 800);
  assert.equal(game.lines, 10);
  assert.equal(game.level, 2);
  assert.equal(game.lastClear, 4);
  assert.ok(game.interval < 800);
  assert.ok(game.board.every(row => row.every(cell => cell === null)));
});

test('scoring multiplies by current level before crossing a threshold', () => {
  const game = new Tetris();
  game.start();
  game.lines = 19;
  game.level = 2;
  game.board[19].fill('J');
  game.board[19][9] = null;
  game.active = piece('I', 9, 16, [[1], [1], [1], [1]]);
  game.drop();
  assert.equal(game.score, 200);
  assert.equal(game.level, 3);
  assert.equal(game.lines, 20);
});

test('a blocked spawn ends the game without overwriting the stack', () => {
  const game = new Tetris();
  game.start();
  game.board[0][4] = 'Z';
  game.next = 'O';
  game.active = piece('O', 0, 18);
  game.drop();
  assert.equal(game.status, 'over');
  assert.equal(game.active, null);
  assert.equal(game.board[0][4], 'Z');
  const state = game.snapshot();
  game.move(1); game.rotate(); game.drop(); game.advance(10000);
  assert.deepEqual(game.snapshot(), state);
});

test('locking a piece above the board is game over, never a negative array write', () => {
  const game = new Tetris();
  game.start();
  game.board[1][3] = 'O';
  game.active = piece('I', 3, -3, [[1], [1], [1], [1]]);
  game.drop();
  assert.equal(game.status, 'over');
  assert.equal(game.board.flat().filter(Boolean).length, 1);
  assert.equal(game.board[-1], undefined);
});

test('pausing stops time and all moves; resume preserves the board and score', () => {
  const game = new Tetris();
  game.start();
  game.down(true);
  game.pause();
  const state = game.snapshot();
  game.advance(10000); game.down(true); game.drop(); game.move(1); game.rotate();
  assert.deepEqual(game.snapshot(), state);
  game.start();
  assert.equal(game.status, 'playing');
  assert.deepEqual(game.active, state.active);
  assert.equal(game.score, state.score);
});

test('gravity falls after the interval and reset clears a played board', () => {
  const game = new Tetris();
  game.start();
  game.advance(799);
  assert.equal(game.active.y, 0);
  game.advance(1);
  assert.equal(game.active.y, 1);
  game.drop();
  game.reset();
  assert.equal(game.status, 'ready');
  assert.equal(game.score, 0);
  assert.equal(game.active, null);
  assert.ok(game.board.every(row => row.every(cell => cell === null)));
});

test('snapshots cannot change the live game', () => {
  const game = new Tetris();
  game.start();
  const state = game.snapshot();
  state.board[0][0] = 'I';
  state.active.matrix[0].fill(0);
  assert.equal(game.board[0][0], null);
  assert.equal(game.active.matrix.flat().filter(Boolean).length, 4);
});
