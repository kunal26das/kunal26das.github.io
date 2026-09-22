/* Adapted from Gabriele Cirulli's 2048. See ../LICENSE.txt. */
function LocalStorageManager() {
  this.bestScoreKey = "kunal.2048.best.v1";
  this.gameStateKey = "kunal.2048.game.v1";
  this.memory = Object.create(null);
  try {
    this.storage = window.localStorage;
  } catch (error) {
    this.storage = null;
  }
}

// Mirror successful reads and writes in memory so denied storage or a full quota
// never interrupts a game. A failed operation switches this session to memory.
LocalStorageManager.prototype.read = function (key) {
  if (this.storage) {
    try {
      var value = this.storage.getItem(key);
      if (value !== null) this.memory[key] = value;
      else delete this.memory[key];
      return value;
    } catch (error) {
      this.storage = null;
    }
  }
  return Object.prototype.hasOwnProperty.call(this.memory, key) ? this.memory[key] : null;
};

LocalStorageManager.prototype.write = function (key, value) {
  this.memory[key] = String(value);
  if (this.storage) {
    try {
      this.storage.setItem(key, String(value));
    } catch (error) {
      this.storage = null;
    }
  }
};

LocalStorageManager.prototype.remove = function (key) {
  delete this.memory[key];
  if (this.storage) {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      this.storage = null;
    }
  }
};

LocalStorageManager.prototype.getBestScore = function () {
  var raw = this.read(this.bestScoreKey);
  var score = Number(raw);
  return Number.isSafeInteger(score) && score >= 0 ? score : 0;
};

LocalStorageManager.prototype.setBestScore = function (score) {
  this.write(this.bestScoreKey, score);
};

LocalStorageManager.validGameState = function (state) {
  if (!state || typeof state !== "object" || !state.grid || state.grid.size !== 4 ||
      !Number.isSafeInteger(state.score) || state.score < 0 ||
      typeof state.over !== "boolean" || typeof state.won !== "boolean" ||
      typeof state.keepPlaying !== "boolean" || !Array.isArray(state.grid.cells) ||
      state.grid.cells.length !== 4) return false;
  var occupied = 0;
  for (var x = 0; x < 4; x++) {
    var column = state.grid.cells[x];
    if (!Array.isArray(column) || column.length !== 4) return false;
    for (var y = 0; y < 4; y++) {
      var tile = column[y];
      if (tile === null) continue;
      if (!tile || typeof tile !== "object" || !tile.position ||
          tile.position.x !== x || tile.position.y !== y ||
          !Number.isSafeInteger(tile.value) || tile.value < 2 ||
          Math.pow(2, Math.floor(Math.log2(tile.value))) !== tile.value) return false;
      occupied++;
    }
  }
  return occupied > 0;
};

LocalStorageManager.prototype.getGameState = function () {
  var stateJSON = this.read(this.gameStateKey);
  if (!stateJSON) return null;
  try {
    var state = JSON.parse(stateJSON);
    if (LocalStorageManager.validGameState(state)) return state;
  } catch (error) {
    // An interrupted write or an older incompatible state starts a fresh game.
  }
  this.clearGameState();
  return null;
};

LocalStorageManager.prototype.setGameState = function (state) {
  this.write(this.gameStateKey, JSON.stringify(state));
};

LocalStorageManager.prototype.clearGameState = function () {
  this.remove(this.gameStateKey);
};
