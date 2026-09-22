/* Input adapter for Gabriele Cirulli's 2048. See ../LICENSE.txt. */
function KeyboardInputManager() {
  this.events = {};
  this.board = document.querySelector(".game-container");
  this.listen();
}

KeyboardInputManager.prototype.on = function (event, callback) {
  if (!this.events[event]) this.events[event] = [];
  this.events[event].push(callback);
};

KeyboardInputManager.prototype.emit = function (event, data) {
  (this.events[event] || []).forEach(function (callback) { callback(data); });
};

KeyboardInputManager.prototype.listen = function () {
  var self = this;
  var board = this.board;
  var keyMap = {
    ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3,
    w: 0, d: 1, s: 2, a: 3, k: 0, l: 1, j: 2, h: 3
  };
  var interactive = "button, a, input, select, textarea, [contenteditable], .game-message";
  function canMove(event) {
    return board.dataset.terminated !== "true" &&
      !event.target.closest(interactive);
  }
  board.addEventListener("keydown", function (event) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || !canMove(event)) return;
    var key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    var direction = keyMap[key];
    if (direction !== undefined) {
      event.preventDefault();
      self.emit("move", direction);
    }
  });
  document.querySelectorAll(".restart-button, .retry-button").forEach(function (button) {
    button.addEventListener("click", function () {
      self.emit("restart");
      board.focus({ preventScroll: true });
    });
  });
  document.querySelectorAll(".keep-playing-button").forEach(function (button) {
    button.addEventListener("click", function () {
      self.emit("keepPlaying");
      board.focus({ preventScroll: true });
    });
  });
  document.querySelectorAll("[data-move]").forEach(function (button) {
    button.addEventListener("click", function () {
      self.emit("move", Number(button.dataset.move));
    });
  });

  var start = null;
  function finish(x, y) {
    if (!start) return;
    var dx = x - start.x;
    var dy = y - start.y;
    start = null;
    var threshold = Math.max(16, Math.min(30, board.clientWidth * 0.045));
    if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) return;
    self.emit("move", Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
  }
  if (window.PointerEvent) {
    board.addEventListener("pointerdown", function (event) {
      if (!event.isPrimary) { start = null; return; }
      if (event.button !== 0 || !canMove(event)) return;
      event.preventDefault();
      board.focus({ preventScroll: true });
      start = { x: event.clientX, y: event.clientY, id: event.pointerId };
      board.setPointerCapture(event.pointerId);
    });
    board.addEventListener("pointerup", function (event) {
      if (start && start.id === event.pointerId) finish(event.clientX, event.clientY);
    });
    board.addEventListener("pointercancel", function () { start = null; });
    board.addEventListener("lostpointercapture", function () { start = null; });
  } else {
    board.addEventListener("touchstart", function (event) {
      if (event.touches.length !== 1 || !canMove(event)) { start = null; return; }
      event.preventDefault();
      board.focus({ preventScroll: true });
      start = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }, { passive: false });
    board.addEventListener("touchmove", function (event) {
      if (start) event.preventDefault();
    }, { passive: false });
    board.addEventListener("touchend", function (event) {
      if (event.touches.length || !event.changedTouches.length) { start = null; return; }
      finish(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
    });
    board.addEventListener("touchcancel", function () { start = null; });
    board.addEventListener("click", function (event) {
      if (canMove(event)) board.focus({ preventScroll: true });
    });
  }
};
