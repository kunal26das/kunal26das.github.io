# Games

The `/games/` collection brings browser editions of
[Game Algorithms](https://github.com/kunal26das/game-algorithms) into the portfolio,
alongside original Snake, Minesweeper and Connect Four implementations and
links to its existing 2048 and DOOM pages.

Source reference: `bb8545995e4c2d43a4feb2175eed4f0c5c636cce`.
The original Apache-2.0 license and contributor notices are retained in
`LICENSE.txt` and `NOTICE.txt`. The original repository remains separate.

- **Tetris** adapts the falling-piece, rotation, collision and line-clear ideas
  from the original C++/Borland graphics project to browser play.
- **Chess puzzles** retain the original knight tour, queens and rooks ideas,
  with validated solutions and playback controls.
- **Flow Free** adapts the path-finding experiment into playable Numberlink
  puzzles. Joining all pairs and covering every cell are both required.
- **Tic-Tac-Toe** extends the original board-tree skeleton. The full game,
  minimax opponent, hints and two-player controls are new browser features.

- **Snake** adds a growing-tail arcade game with keyboard, swipe and direction controls.
- **Minesweeper** adds safe first openings, flags and two board sizes.
- **Connect Four** adds gravity-based four-in-a-row play against a computer or friend.

The three additions are original implementations for this collection, not
ports from the historical Game Algorithms repository.

Each game separates rules in `engine.mjs` from its interface in `app.js`.
Shared colors and typography come from the portfolio; `styles.css` supplies
the collection and common game layout. Everything runs locally in the browser
without dependencies, accounts or a game server.

Flow Free’s **Original remix** adapts the five-pair board in
`Flow Free/3. Backtracking.cpp`. The original endpoints cannot cover the entire
5 × 5 grid; its original full-board check was commented out. The browser puzzle
moves pair C’s second endpoint from the bottom-right square to row 2, column 1,
making a full-board solution possible. The other three puzzles are new layouts;
all four are verified by the browser backtracking solver and the rules tests.

Run rules and solver checks with:

```sh
node --test projects/games/tests/*.test.cjs
```

The root build publishes only web assets and notices. Tests, documentation,
original executables, object files and graphics-library samples are excluded.
