# 2048

A local adaptation of [Gabriele Cirulli's 2048](https://github.com/gabrielecirulli/2048), presented in the same visual language as Kunal's portfolio. Published at `/2048/` by the root static-site build.

The original game is MIT licensed, copyright © 2014 Gabriele Cirulli. Its license is preserved in [LICENSE.txt](LICENSE.txt). Source was imported from upstream commit [`478b6ec346e3787f589e4af751378d06ded4cbbc`](https://github.com/gabrielecirulli/2048/tree/478b6ec346e3787f589e4af751378d06ded4cbbc).

## Implementation

- `js/grid.js` and `js/tile.js` retain the original engine. `js/game_manager.js` preserves the traversal, single-merge-per-move, scoring, 90% 2 / 10% 4 spawning, and 2048 win rules.
- The adapted input and renderer support focused keyboard controls, pointer/touch swipes, direction buttons, visible win/loss actions, and a text description of the board for assistive technology.
- Arrow keys, WASD, and HJKL act only while the board is focused. Tab leaves the board normally. Select **New game** to restart or **Keep playing** after reaching 2048.
- Best score and the current board are saved locally under `kunal.2048.best.v1` and `kunal.2048.game.v1`. Invalid saved data starts a fresh game; blocked or full storage falls back to in-memory play. A finished board and the decision to keep playing are saved immediately.
- Rendering, input, and local storage use browser APIs directly. There is no build dependency, account, tracking, or server-side game state.

Classic deferred script order: `tile.js`, `grid.js`, `local_storage_manager.js`, `keyboard_input_manager.js`, `html_actuator.js`, `game_manager.js`, `application.js`.

## Checks

Run the engine and persistence regression tests from the repository root:

```sh
node --test projects/2048/tests/*.test.cjs
```

The tests cover direction traversal, merges, score, no-op moves, random spawning, win/continue/restart, game over, restored games, and corrupt or unavailable local storage.
