export const DIFFICULTIES = Object.freeze({
  small: Object.freeze({ rows: 8, columns: 8, mines: 10 }),
  large: Object.freeze({ rows: 10, columns: 10, mines: 18 })
});

export function neighbors(index, rows, columns) {
  if (!Number.isInteger(index) || index < 0 || index >= rows * columns) return [];
  const row = Math.floor(index / columns);
  const column = index % columns;
  const result = [];
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      const r = row + dr;
      const c = column + dc;
      if ((dr || dc) && r >= 0 && r < rows && c >= 0 && c < columns) result.push(r * columns + c);
    }
  }
  return result;
}

/** Rules only. Randomness is injected so the same moves can be replayed in tests. */
export class Minesweeper {
  constructor({ rows = 8, columns = 8, mines = 10, random = Math.random } = {}) {
    if (![rows, columns, mines].every(Number.isInteger) || rows < 2 || columns < 2 || rows > 32 || columns > 32 || mines < 1 || mines >= rows * columns) {
      throw new RangeError('Use a 2–32 row and column board with at least one mine and one safe square.');
    }
    if (typeof random !== 'function') throw new TypeError('random must be a function.');
    this.rows = rows;
    this.columns = columns;
    this.mines = mines;
    this.random = random;
    this.reset();
  }

  reset() {
    this.cells = Array.from({ length: this.rows * this.columns }, () => ({ mine: false, adjacent: 0, revealed: false, flagged: false }));
    this.status = 'ready';
    this.generated = false;
    this.exploded = null;
    this.revealed = 0;
  }

  get flags() { return this.cells.filter(cell => cell.flagged).length; }
  get remaining() { return this.mines - this.flags; }
  get safeRemaining() { return this.cells.length - this.mines - this.revealed; }
  get finished() { return this.status === 'won' || this.status === 'lost'; }

  valid(index) { return Number.isInteger(index) && index >= 0 && index < this.cells.length; }

  generate(first) {
    const safe = new Set([first, ...neighbors(first, this.rows, this.columns)]);
    // Dense custom boards still guarantee a safe first reveal. Both published sizes
    // always have enough room to protect the surrounding eight squares as well.
    if (this.cells.length - safe.size < this.mines) { safe.clear(); safe.add(first); }
    const choices = this.cells.map((_, index) => index).filter(index => !safe.has(index));
    for (let i = 0; i < this.mines; i += 1) {
      const value = this.random();
      if (!Number.isFinite(value) || value < 0 || value >= 1) throw new RangeError('random must return a number from 0 up to, but not including, 1.');
      const chosen = i + Math.floor(value * (choices.length - i));
      [choices[i], choices[chosen]] = [choices[chosen], choices[i]];
    }
    choices.slice(0, this.mines).forEach(index => { this.cells[index].mine = true; });
    this.cells.forEach((cell, index) => {
      cell.adjacent = neighbors(index, this.rows, this.columns).filter(neighbor => this.cells[neighbor].mine).length;
    });
    this.generated = true;
    this.status = 'playing';
  }

  reveal(index) {
    if (!this.valid(index) || this.finished || this.cells[index].flagged || this.cells[index].revealed) return false;
    if (!this.generated) this.generate(index);
    if (this.cells[index].mine) {
      this.cells[index].revealed = true;
      this.exploded = index;
      this.status = 'lost';
      return true;
    }
    const pending = [index];
    while (pending.length) {
      const current = pending.pop();
      const cell = this.cells[current];
      if (cell.mine || cell.flagged || cell.revealed) continue;
      cell.revealed = true;
      this.revealed += 1;
      if (cell.adjacent === 0) pending.push(...neighbors(current, this.rows, this.columns));
    }
    if (this.safeRemaining === 0) this.status = 'won';
    return true;
  }

  toggleFlag(index) {
    if (!this.valid(index) || this.finished || this.cells[index].revealed) return false;
    const cell = this.cells[index];
    if (!cell.flagged && this.remaining === 0) return false;
    cell.flagged = !cell.flagged;
    return true;
  }

  /** A detached debug snapshot. Mutating it never changes the game. */
  get snapshot() {
    return { rows: this.rows, columns: this.columns, mines: this.mines, status: this.status,
      generated: this.generated, exploded: this.exploded, flags: this.flags,
      remaining: this.remaining, revealed: this.revealed, safeRemaining: this.safeRemaining,
      cells: this.cells.map(cell => ({ ...cell })) };
  }
}
