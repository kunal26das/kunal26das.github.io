import { chooseMove } from "./autoplay-strategy.mjs";

self.addEventListener("message", function (event) {
  const { id, board } = event.data || {};
  try {
    const result = chooseMove(board, { budgetMs: 120 });
    self.postMessage({ id, ...result });
  } catch (error) {
    self.postMessage({ id, error: error instanceof Error ? error.message : "Autoplay could not choose a move." });
  }
});
