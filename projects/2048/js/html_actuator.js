/* Adapted from Gabriele Cirulli's 2048. See ../LICENSE.txt. */
function HTMLActuator() {
  this.board = document.querySelector(".game-container");
  this.tileContainer = document.querySelector(".tile-container");
  this.scoreContainer = document.querySelector(".score-container");
  this.bestContainer = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");
  this.status = document.getElementById("game-status");
  this.description = document.getElementById("board-description");
  this.moveButtons = document.querySelectorAll("[data-move]");
  this.tileContainer.setAttribute("aria-hidden", "true");
  this.score = 0;
  this.frame = null;
  this.terminated = false;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;
  if (this.frame !== null) window.cancelAnimationFrame(this.frame);
  this.frame = window.requestAnimationFrame(function () {
    self.frame = null;
    self.clearContainer(self.tileContainer);
    grid.eachCell(function (x, y, tile) {
      if (tile) self.addTile(tile);
    });
    var difference = metadata.score - self.score;
    self.updateScore(metadata.score);
    self.bestContainer.textContent = metadata.bestScore;
    self.describeBoard(grid, metadata, difference);
    self.board.dataset.terminated = String(metadata.terminated);
    self.moveButtons.forEach(function (button) { button.disabled = metadata.terminated; });
    if (metadata.terminated) self.message(metadata.won && !metadata.over);
    else self.clearMessage();
    self.terminated = metadata.terminated;
  });
};

HTMLActuator.prototype.continueGame = function () {
  this.clearMessage();
  this.board.dataset.terminated = "false";
  this.moveButtons.forEach(function (button) { button.disabled = false; });
  this.terminated = false;
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) container.removeChild(container.firstChild);
};

HTMLActuator.prototype.addTile = function (tile) {
  var self = this;
  var wrapper = document.createElement("div");
  var inner = document.createElement("div");
  var position = tile.previousPosition || { x: tile.x, y: tile.y };
  var classes = ["tile", "tile-" + tile.value, this.positionClass(position)];
  if (tile.value > 2048) classes.push("tile-super");
  this.applyClasses(wrapper, classes);
  inner.classList.add("tile-inner");
  inner.textContent = tile.value;
  if (tile.previousPosition) {
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes);
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);
    tile.mergedFrom.forEach(function (merged) { self.addTile(merged); });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }
  wrapper.appendChild(inner);
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.positionClass = function (position) {
  return "tile-position-" + (position.x + 1) + "-" + (position.y + 1);
};

HTMLActuator.prototype.updateScore = function (score) {
  var difference = score - this.score;
  this.score = score;
  this.scoreContainer.textContent = score;
  if (difference > 0) {
    var addition = document.createElement("span");
    addition.classList.add("score-addition");
    addition.setAttribute("aria-hidden", "true");
    addition.textContent = "+" + difference;
    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.describeBoard = function (grid, metadata, difference) {
  var rows = [];
  var highest = 0;
  var empty = 0;
  for (var y = 0; y < grid.size; y++) {
    var values = [];
    for (var x = 0; x < grid.size; x++) {
      var tile = grid.cells[x][y];
      values.push(tile ? tile.value : "empty");
      if (tile) highest = Math.max(highest, tile.value);
      else empty++;
    }
    rows.push("Row " + (y + 1) + ": " + values.join(", ") + ".");
  }
  this.description.textContent = rows.join(" ");
  var outcome = metadata.over ? "No moves left. " : metadata.terminated ? "You reached 2048! " : "";
  var earned = difference > 0 ? "Added " + difference + " points. " : "";
  this.status.textContent = outcome + earned + "Score " + metadata.score + ". Highest tile " + highest +
    ". " + empty + (empty === 1 ? " empty cell." : " empty cells.");
};

HTMLActuator.prototype.message = function (won) {
  this.messageContainer.hidden = false;
  this.messageContainer.classList.toggle("game-won", won);
  this.messageContainer.classList.toggle("game-over", !won);
  this.messageContainer.querySelector(".message-title").textContent = won ? "2048. Nicely done." : "One more round?";
  this.messageContainer.querySelector(".message-detail").textContent = won ?
    "You reached the goal. Keep going and see how far you can take it." :
    "No moves left. Your best score is saved for the next attempt.";
  var keepPlaying = this.messageContainer.querySelector(".keep-playing-button");
  keepPlaying.hidden = !won;
  if (!this.terminated) {
    var action = won ? keepPlaying : this.messageContainer.querySelector(".retry-button");
    action.focus({ preventScroll: true });
  }
};

HTMLActuator.prototype.clearMessage = function () {
  this.messageContainer.hidden = true;
  this.messageContainer.classList.remove("game-won", "game-over");
};
