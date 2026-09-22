/* Local autoplay: the worker plans; the existing game owns every move and spawn. */
(function () {
  "use strict";
  var workerURL = new URL("autoplay-worker.js?v=1", document.currentScript.src);

  function AutoplayController(game) {
    var self = this;
    this.game = game;
    this.panel = document.querySelector(".autoplay");
    this.toggle = document.getElementById("autoplay-toggle");
    this.step = document.getElementById("autoplay-step");
    this.speed = document.getElementById("autoplay-speed");
    this.status = document.getElementById("autoplay-status");
    this.count = document.getElementById("autoplay-count");
    this.gameStatus = document.getElementById("game-status");
    this.supported = typeof Worker === "function";
    this.mode = null;
    this.busy = false;
    this.moveCount = 0;
    this.requestId = 0;
    this.worker = null;
    this.timer = null;
    this.watchdog = null;

    this.toggle.addEventListener("click", function () {
      if (self.mode) self.pause("Paused. Resume anytime, or make your own move.");
      else self.start("play");
    });
    this.step.addEventListener("click", function () { self.start("step"); });
    this.speed.addEventListener("change", function () {
      if (self.mode === "play" && !self.busy) self.schedule();
    });
    game.inputManager.on("move", function () {
      self.pause("Your turn. Start autoplay whenever you like.");
    });
    game.inputManager.on("restart", function () {
      self.moveCount = 0;
      self.pause("A fresh board. Play yourself, start autoplay, or try one move with Step.");
    });
    game.inputManager.on("keepPlaying", function () {
      self.pause("Keep going. Start autoplay again whenever you like.");
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden && self.mode) self.pause("Paused while you were away. Resume when you’re ready.");
    });
    window.addEventListener("pagehide", function () {
      if (self.mode) self.pause("Paused. Resume when you’re ready.");
    });
    this.panel.hidden = false;
    if (!this.supported) this.status.textContent = "Autoplay isn’t supported in this browser. You can still play with the arrows or swipe.";
    if (game.isGameTerminated()) this.status.textContent = this.outcome();
    this.render();
  }

  AutoplayController.prototype.board = function () {
    var cells = this.game.grid.cells;
    return Array.from({ length: 16 }, function (_, i) {
      var tile = cells[i % 4][Math.floor(i / 4)];
      return tile ? tile.value : 0;
    });
  };

  AutoplayController.prototype.outcome = function () {
    return this.game.over ? "No moves left. Choose New game to try again." :
      "2048 reached! Choose Keep playing to continue beyond the goal.";
  };

  AutoplayController.prototype.render = function () {
    var terminated = this.game.isGameTerminated();
    this.toggle.disabled = !this.supported || terminated;
    this.step.disabled = !this.supported || terminated || !!this.mode;
    this.toggle.textContent = this.mode === "play" ? "Pause autoplay" : this.mode === "step" ?
      "Cancel step" : this.moveCount && !terminated ? "Resume autoplay" : "Start autoplay";
    this.toggle.setAttribute("aria-pressed", String(this.mode === "play"));
    this.count.textContent = this.moveCount + (this.moveCount === 1 ? " autoplay move" : " autoplay moves");
    // Continuous play must not flood assistive technology with every score update.
    var live = this.mode === "play" ? "off" : "polite";
    this.status.setAttribute("aria-live", live);
    this.gameStatus.setAttribute("aria-live", live);
  };

  AutoplayController.prototype.pause = function (message) {
    this.mode = null;
    this.busy = false;
    this.requestId++;
    clearTimeout(this.timer);
    clearTimeout(this.watchdog);
    this.timer = this.watchdog = null;
    if (this.worker) this.worker.terminate();
    this.worker = null;
    this.render();
    if (this.game.isGameTerminated()) message = this.outcome();
    if (message) this.status.textContent = message;
  };

  AutoplayController.prototype.start = function (mode) {
    if (this.mode || !this.supported || this.game.isGameTerminated() || document.hidden) return;
    this.mode = mode;
    this.render();
    this.status.textContent = "Looking ahead…";
    this.think();
  };

  AutoplayController.prototype.schedule = function () {
    var self = this;
    clearTimeout(this.timer);
    var delay = Number(this.speed.value);
    if ([1000, 500, 180].indexOf(delay) === -1) delay = 500;
    this.timer = setTimeout(function () { self.think(); }, delay);
  };

  AutoplayController.prototype.think = function () {
    var self = this;
    if (!this.mode || this.busy) return;
    if (document.hidden || this.game.isGameTerminated()) {
      this.pause("Paused. Resume when you’re ready.");
      return;
    }
    var board = this.board();
    var id = ++this.requestId;
    this.busy = true;
    function failed() {
      if (id === self.requestId) self.pause("Autoplay couldn’t plan a move. Try again, or play with the arrows.");
    }
    try {
      if (!this.worker) this.worker = new Worker(workerURL, { type: "module" });
      this.worker.onerror = function (event) { event.preventDefault(); failed(); };
      this.worker.onmessageerror = failed;
      this.worker.onmessage = function (event) {
        if (!self.mode || id !== self.requestId || event.data.id !== id) return;
        clearTimeout(self.watchdog);
        self.busy = false;
        // Discard a result if play changed while the worker was thinking.
        if (document.hidden || board.join(",") !== self.board().join(",") || self.game.isGameTerminated()) {
          self.pause("The board changed. Start autoplay again when you’re ready.");
          return;
        }
        var result = event.data;
        if (result.error || !Number.isInteger(result.direction) || result.direction < 0 || result.direction > 3) {
          failed();
          return;
        }
        // Use the normal engine. It alone handles merges, score and random tiles.
        self.game.move(result.direction);
        if (board.join(",") === self.board().join(",")) { failed(); return; }
        self.moveCount++;
        var explanation = typeof result.explanation === "string" ? result.explanation : "Move complete.";
        self.status.textContent = explanation;
        if (self.mode === "step" || self.game.isGameTerminated()) self.pause(explanation);
        else { self.render(); self.schedule(); }
      };
      this.watchdog = setTimeout(failed, 5000);
      this.worker.postMessage({ id: id, board: board });
    } catch (_) { failed(); }
  };

  window.AutoplayController = AutoplayController;
})();
