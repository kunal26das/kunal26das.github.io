/* Original game by Gabriele Cirulli, adapted for kunal26das.github.io. */
window.game = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
window.autoplay = new AutoplayController(window.game);
