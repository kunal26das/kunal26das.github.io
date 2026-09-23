/*
 * Browser adaptation of game-algorithms/Tetris/cpp/Group 5 - Tetris.cpp.
 * Original author notice:
 *   Batch B4, Group members :
 *   Kunal Das       (15103262)
 *   Aarush Verma    (15103116)
 *   Vaibhav Sharma  (15103226)
 *   Rohan Kumar    (15103217)
 *
 * Original project licensed under the Apache License, Version 2.0.
 * See ../LICENSE.txt and ../NOTICE.txt.
 * Modified for the browser: independent board state, seven-piece bag,
 * collision-safe rotations, next-piece preview, scoring and pause controls.
 */

export const WIDTH = 10;
export const HEIGHT = 20;
export const SHAPES = Object.freeze({
  I: [[1, 1, 1, 1]],
  J: [[1, 1, 1], [0, 0, 1]],
  L: [[1, 1, 1], [1, 0, 0]],
  O: [[1, 1], [1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  T: [[1, 1, 1], [0, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]]
});

export function rotateMatrix(matrix, clockwise = true) {
  const height = matrix.length;
  const width = matrix[0].length;
  return Array.from({ length: width }, (_, y) =>
    Array.from({ length: height }, (_, x) => clockwise
      ? matrix[height - 1 - x][y]
      : matrix[x][width - 1 - y]));
}

export function canPlace(board, piece, x = piece.x, y = piece.y, matrix = piece.matrix) {
  return matrix.every((row, dy) => row.every((cell, dx) => {
    if (!cell) return true;
    const col = x + dx;
    const line = y + dy;
    return col >= 0 && col < WIDTH && line < HEIGHT && (line < 0 || !board[line][col]);
  }));
}

export function clearFullLines(board) {
  const rows = board.filter(row => row.some(cell => !cell)).map(row => row.slice());
  const count = HEIGHT - rows.length;
  return { count, board: [...Array.from({ length: count }, () => Array(WIDTH).fill(null)), ...rows] };
}

export class Tetris {
  constructor(random = Math.random) {
    this.random = random;
    this.reset();
  }

  reset() {
    this.board = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(null));
    this.bag = [];
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.pieces = 0;
    this.lastClear = 0;
    this.elapsed = 0;
    this.status = 'ready';
    this.active = null;
    this.next = this.drawPiece();
  }

  drawPiece() {
    if (!this.bag.length) {
      this.bag = Object.keys(SHAPES);
      for (let i = this.bag.length - 1; i > 0; i--) {
        const j = Math.floor(this.random() * (i + 1));
        [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
      }
    }
    return this.bag.pop();
  }

  start() {
    if (this.status === 'playing') return false;
    if (this.status === 'paused') { this.status = 'playing'; return true; }
    this.reset();
    this.status = 'playing';
    return this.spawn();
  }

  pause() {
    if (this.status !== 'playing') return false;
    this.status = 'paused';
    return true;
  }

  spawn() {
    const type = this.next;
    const matrix = SHAPES[type].map(row => row.slice());
    this.active = { type, matrix, x: Math.floor((WIDTH - matrix[0].length) / 2), y: 0 };
    this.next = this.drawPiece();
    this.elapsed = 0;
    if (!canPlace(this.board, this.active)) {
      this.active = null;
      this.status = 'over';
      return false;
    }
    return true;
  }

  move(direction) {
    if (this.status !== 'playing' || (direction !== -1 && direction !== 1)) return false;
    if (!canPlace(this.board, this.active, this.active.x + direction)) return false;
    this.active.x += direction;
    return true;
  }

  rotate(clockwise = true) {
    if (this.status !== 'playing') return false;
    const matrix = rotateMatrix(this.active.matrix, clockwise);
    // A short nudge permits rotation beside a wall or on the floor.
    for (const dy of [0, -1, -2]) {
      for (const dx of [0, -1, 1, -2, 2, -3, 3]) {
        if (canPlace(this.board, this.active, this.active.x + dx, this.active.y + dy, matrix)) {
          this.active = { ...this.active, matrix, x: this.active.x + dx, y: this.active.y + dy };
          return true;
        }
      }
    }
    return false;
  }

  down(softDrop = false) {
    if (this.status !== 'playing') return false;
    if (canPlace(this.board, this.active, this.active.x, this.active.y + 1)) {
      this.active.y++;
      if (softDrop) this.score++;
      return true;
    }
    this.lock();
    return false;
  }

  drop() {
    if (this.status !== 'playing') return false;
    let distance = 0;
    while (canPlace(this.board, this.active, this.active.x, this.active.y + 1)) {
      this.active.y++;
      distance++;
    }
    this.score += distance * 2;
    this.lock();
    return true;
  }

  lock() {
    const { x, y, matrix, type } = this.active;
    const aboveBoard = matrix.some((row, dy) => row.some(cell => cell && y + dy < 0));
    if (aboveBoard) {
      this.active = null;
      this.status = 'over';
      return;
    }
    matrix.forEach((row, dy) => row.forEach((cell, dx) => {
      if (cell) this.board[y + dy][x + dx] = type;
    }));
    const cleared = clearFullLines(this.board);
    this.board = cleared.board;
    this.lastClear = cleared.count;
    this.score += [0, 100, 300, 500, 800][cleared.count] * this.level;
    this.lines += cleared.count;
    this.level = 1 + Math.floor(this.lines / 10);
    this.pieces++;
    this.spawn();
  }

  get interval() { return Math.max(90, 800 * Math.pow(0.82, this.level - 1)); }

  advance(milliseconds) {
    if (this.status !== 'playing' || !Number.isFinite(milliseconds) || milliseconds < 0) return;
    this.elapsed += Math.min(milliseconds, 1000);
    if (this.elapsed >= this.interval) {
      this.elapsed -= this.interval;
      this.down();
    }
  }

  snapshot() {
    let ghostY = null;
    if (this.active) {
      ghostY = this.active.y;
      while (canPlace(this.board, this.active, this.active.x, ghostY + 1)) ghostY++;
    }
    return {
      board: this.board.map(row => row.slice()),
      active: this.active ? { ...this.active, matrix: this.active.matrix.map(row => row.slice()) } : null,
      next: this.next,
      ghostY,
      score: this.score,
      lines: this.lines,
      level: this.level,
      pieces: this.pieces,
      lastClear: this.lastClear,
      status: this.status
    };
  }
}
