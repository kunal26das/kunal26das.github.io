export const SIZE = 16;
export const INTERVAL = 155;
export const DIRECTIONS = Object.freeze({
  up: Object.freeze({ x: 0, y: -1 }),
  right: Object.freeze({ x: 1, y: 0 }),
  down: Object.freeze({ x: 0, y: 1 }),
  left: Object.freeze({ x: -1, y: 0 })
});

const sameCell = (a, b) => a.x === b.x && a.y === b.y;

export class Snake {
  constructor({ size = SIZE, random = Math.random, interval = INTERVAL } = {}) {
    if (!Number.isInteger(size) || size < 4) throw new RangeError('The board must be at least 4 × 4.');
    if (!Number.isFinite(interval) || interval <= 0) throw new RangeError('The interval must be positive.');
    this.size = size;
    this.random = random;
    this.interval = interval;
    this.reset();
  }

  reset() {
    const middle = Math.floor(this.size / 2);
    this.snake = [0, 1, 2].map(offset => ({ x: middle - offset, y: middle }));
    this.direction = 'right';
    this.queuedDirections = [];
    this.score = 0;
    this.steps = 0;
    this.elapsed = 0;
    this.status = 'ready';
    this.lastResult = 'ready';
    this.food = this.placeFood();
    return this.snapshot();
  }

  placeFood() {
    const free = [];
    const occupied = new Set(this.snake.map(cell => cell.y * this.size + cell.x));
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (!occupied.has(y * this.size + x)) free.push({ x, y });
      }
    }
    if (!free.length) return null;
    const draw = this.random();
    const fraction = Number.isFinite(draw) ? Math.max(0, Math.min(draw, .9999999999999999)) : 0;
    return free[Math.floor(fraction * free.length)];
  }

  start() {
    if (this.status === 'playing') return false;
    if (this.status === 'over' || this.status === 'won') this.reset();
    this.status = 'playing';
    this.elapsed = 0;
    return true;
  }

  pause() {
    if (this.status !== 'playing') return false;
    this.status = 'paused';
    this.elapsed = 0;
    this.queuedDirections = [];
    return true;
  }

  turn(direction) {
    if (this.status !== 'playing' || !Object.hasOwn(DIRECTIONS, direction) || this.queuedDirections.length >= 2) return false;
    const previous = this.queuedDirections.at(-1) || this.direction;
    const before = DIRECTIONS[previous];
    const after = DIRECTIONS[direction];
    if (previous === direction || (before.x + after.x === 0 && before.y + after.y === 0)) return false;
    this.queuedDirections.push(direction);
    return true;
  }

  step() {
    if (this.status !== 'playing') return false;
    this.direction = this.queuedDirections.shift() || this.direction;
    const delta = DIRECTIONS[this.direction];
    const head = { x: this.snake[0].x + delta.x, y: this.snake[0].y + delta.y };
    const growing = this.food !== null && sameCell(head, this.food);
    // The tail leaves its square on this tick unless food makes the snake grow.
    const body = growing ? this.snake : this.snake.slice(0, -1);
    const wall = head.x < 0 || head.y < 0 || head.x >= this.size || head.y >= this.size;
    if (wall || body.some(cell => sameCell(cell, head))) {
      this.status = 'over';
      this.lastResult = wall ? 'wall' : 'self';
      this.queuedDirections = [];
      this.elapsed = 0;
      return false;
    }
    this.snake.unshift(head);
    if (growing) {
      this.score++;
      this.food = this.placeFood();
      this.lastResult = this.food ? 'food' : 'won';
      if (!this.food) { this.status = 'won'; this.queuedDirections = []; this.elapsed = 0; }
    } else {
      this.snake.pop();
      this.lastResult = 'move';
    }
    this.steps++;
    return true;
  }

  advance(milliseconds) {
    if (this.status !== 'playing' || !Number.isFinite(milliseconds) || milliseconds <= 0) return false;
    this.elapsed += milliseconds;
    let moved = false;
    while (this.elapsed >= this.interval && this.status === 'playing') {
      this.elapsed -= this.interval;
      moved = this.step() || moved;
    }
    return moved;
  }

  snapshot() {
    return {
      size: this.size,
      snake: this.snake.map(cell => ({ ...cell })),
      food: this.food ? { ...this.food } : null,
      direction: this.direction,
      queuedDirections: [...this.queuedDirections],
      score: this.score,
      steps: this.steps,
      interval: this.interval,
      status: this.status,
      lastResult: this.lastResult
    };
  }
}
