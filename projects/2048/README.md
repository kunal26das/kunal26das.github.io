# 2048

A local adaptation of [Gabriele Cirulli's 2048](https://github.com/gabrielecirulli/2048), presented in the same visual language as Kunal's portfolio. Published at `/2048/` by the root static-site build.

The original game is MIT licensed, copyright © 2014 Gabriele Cirulli. Its license is preserved in [LICENSE.txt](LICENSE.txt). Source was imported from upstream commit [`478b6ec346e3787f589e4af751378d06ded4cbbc`](https://github.com/gabrielecirulli/2048/tree/478b6ec346e3787f589e4af751378d06ded4cbbc).

## Implementation

- `js/grid.js` and `js/tile.js` retain the original engine. `js/game_manager.js` preserves the traversal, single-merge-per-move, scoring, 90% 2 / 10% 4 spawning, and 2048 win rules.
- The adapted input and renderer support keyboard controls, pointer/touch swipes, direction buttons, visible win/loss actions, and a text description of the board for assistive technology.
- Arrow keys, WASD, and HJKL work immediately when the page opens, without first clicking the board. Navigation, form fields, open menus, and browser shortcuts keep their normal keyboard behavior. Direction buttons return focus to the board so keyboard play can continue. Select **New game** to restart or **Keep playing** after reaching 2048.
- Best score and the current board are saved locally under `kunal.2048.best.v1` and `kunal.2048.game.v1`. Invalid saved data starts a fresh game; blocked or full storage falls back to in-memory play. A finished board and the decision to keep playing are saved immediately.
- Rendering, input, and local storage use browser APIs directly. There is no build dependency, account, tracking, or server-side game state.
- **Autoplay** plans normal moves from the current board. Start/pause, Slow/Normal/Fast pacing, and **Step** let you watch continuously or inspect a single move. Explanations describe the chosen direction; random tiles still come from the unchanged game engine. A win is not guaranteed.
- The expectimax search runs locally in a module Web Worker, leaving the page responsive. It considers possible 2/4 spawns and favors open cells, ordered rows/columns, and matching tiles. It uses the strategy from the recorded 932-move winning run.
- Manual moves, New game, leaving the tab, and win/loss all stop autoplay and discard pending decisions. Reloading restores the board but never restarts autoplay. After winning, choose **Keep playing**, then start autoplay again to continue. Unsupported browsers retain manual play.

Classic deferred script order: `tile.js`, `grid.js`, `local_storage_manager.js`, `keyboard_input_manager.js`, `html_actuator.js`, `game_manager.js`, `autoplay.js`, `application.js`. The controller starts `autoplay-worker.js`, which imports `autoplay-strategy.mjs`, only when requested.

## Checks

Run the engine and persistence regression tests from the repository root:

```sh
node --test projects/2048/tests/*.test.cjs
```

The tests cover direction traversal, merges, score, no-op moves, random spawning, win/continue/restart, game over, restored games, corrupt or unavailable local storage, solver predictions, and autoplay cancellation/lifecycle.
