import { Snake, DIRECTIONS } from './engine.mjs';

const engine = new Snake();
const canvas = document.querySelector('#snake-board');
const context = canvas.getContext('2d');
const toggle = document.querySelector('#snake-toggle');
const restart = document.querySelector('#snake-restart');
const status = document.querySelector('#snake-status');
const overlay = document.querySelector('#snake-overlay');
const title = document.querySelector('#snake-overlay-title');
const detail = document.querySelector('#snake-overlay-detail');
const directions = [...document.querySelectorAll('[data-direction]')];
const bestKey = 'kunal-snake-best';
let best = 0;
try {
  const saved = Number(localStorage.getItem(bestKey));
  if (Number.isSafeInteger(saved) && saved >= 0 && saved <= engine.size ** 2 - 3) best = saved;
} catch { /* Play also works when storage is unavailable. */ }
let previousTime = null;
let lastStatus = '';
let lastScore = 0;
let swipe = null;

function render() {
  const state = engine.snapshot();
  const tokens = getComputedStyle(document.documentElement);
  const light = document.documentElement.dataset.theme === 'light';
  const size = canvas.width / state.size;
  context.fillStyle = tokens.getPropertyValue('--surface');
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = tokens.getPropertyValue('--line');
  context.lineWidth = .5;
  for (let n = 1; n < state.size; n++) {
    context.beginPath(); context.moveTo(n * size, 0); context.lineTo(n * size, canvas.height); context.stroke();
    context.beginPath(); context.moveTo(0, n * size); context.lineTo(canvas.width, n * size); context.stroke();
  }
  // A diamond remains distinct from the snake without relying on color.
  if (state.food) {
    const x = (state.food.x + .5) * size;
    const y = (state.food.y + .5) * size;
    const radius = size * .34;
    context.fillStyle = tokens.getPropertyValue('--clay');
    context.beginPath(); context.moveTo(x, y - radius); context.lineTo(x + radius, y); context.lineTo(x, y + radius); context.lineTo(x - radius, y); context.closePath(); context.fill();
  }
  state.snake.forEach((cell, index) => {
    context.fillStyle = light ? (index ? '#637f4b' : '#3c5829') : (index ? '#97ad81' : '#bdcdaa');
    context.fillRect(cell.x * size + 1.5, cell.y * size + 1.5, size - 3, size - 3);
  });
  const head = state.snake[0];
  const vector = DIRECTIONS[state.direction];
  const eyeX = (head.x + .5 + vector.x * .2) * size;
  const eyeY = (head.y + .5 + vector.y * .2) * size;
  context.fillStyle = light ? '#fbfaf6' : '#24301b';
  for (const side of [-1, 1]) {
    context.beginPath();
    context.arc(eyeX + vector.y * side * size * .19, eyeY + vector.x * side * size * .19, size * .065, 0, Math.PI * 2);
    context.fill();
  }
  if (state.score > best) {
    best = state.score;
    try { localStorage.setItem(bestKey, String(best)); } catch { /* Storage is optional. */ }
  }
  document.querySelector('#snake-score').textContent = state.score;
  document.querySelector('#snake-best').textContent = best;
  document.querySelector('#snake-length').textContent = state.snake.length;
  canvas.setAttribute('aria-label', `Snake board, ${state.size} by ${state.size}. ${state.status}. Head at column ${head.x + 1}, row ${head.y + 1}, moving ${state.direction}. ${state.food ? `Food at column ${state.food.x + 1}, row ${state.food.y + 1}.` : 'Board filled.'} Score ${state.score}.`);
  toggle.textContent = { ready: 'Start game', playing: 'Pause', paused: 'Resume', over: 'Play again', won: 'Play again' }[state.status];
  restart.disabled = state.status === 'ready';
  directions.forEach(button => { button.disabled = state.status !== 'playing'; });
  overlay.hidden = state.status === 'playing';
  const messages = {
    ready: ['A little room to grow.', 'Press Start game when you’re ready.'],
    paused: ['Take your time.', 'Press Resume to keep going.'],
    over: [state.lastResult === 'wall' ? 'End of the road.' : 'A tight turn.', `Score ${state.score}. Play again for a fresh start.`],
    won: ['Every square is yours.', `All ${state.size * state.size} squares filled. Well played.`]
  };
  if (messages[state.status]) [title.textContent, detail.textContent] = messages[state.status];
  if (state.status !== lastStatus) {
    status.textContent = {
      ready: 'Press Start game to begin.',
      playing: 'Collect the diamonds. Leave yourself a way out.',
      paused: 'Paused. Your snake will wait for you.',
      over: `Game over: ${state.lastResult === 'wall' ? 'you hit the edge' : 'you ran into yourself'}. Score ${state.score}. Press Play again.`,
      won: `You won! You filled the board. Score ${state.score}. Press Play again for a fresh start.`
    }[state.status];
  } else if (state.score !== lastScore) {
    status.textContent = `Diamond collected. Score ${state.score}. Length ${state.snake.length}.`;
  }
  lastStatus = state.status;
  lastScore = state.score;
}

function start() {
  if (document.hidden || document.querySelector('.home-menu[open]')) return;
  engine.start();
  previousTime = null;
  render();
  canvas.focus({ preventScroll: true });
}

function pause() {
  engine.pause();
  previousTime = null;
  swipe = null;
  render();
}

function turn(direction) {
  if (document.hidden || document.querySelector('.home-menu[open]')) return;
  engine.turn(direction);
}

toggle.addEventListener('click', () => { if (engine.status === 'playing') pause(); else start(); });
restart.addEventListener('click', () => { engine.reset(); start(); });
directions.forEach(button => button.addEventListener('click', () => {
  turn(button.dataset.direction);
  canvas.focus({ preventScroll: true });
}));

document.addEventListener('keydown', event => {
  if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || document.hidden) return;
  if (document.querySelector('.home-menu[open]')) return;
  const target = event.target;
  if (target instanceof Element && target.closest('a, input, select, textarea, summary, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="combobox"]')) return;
  const key = event.key.toLowerCase();
  if ((key === ' ' || key === 'enter') && target instanceof Element && target.closest('button, [role="button"]')) return;
  if ((key === 'p' || key === 'escape') && ['playing', 'paused'].includes(engine.status)) {
    event.preventDefault();
    if (!event.repeat) { if (engine.status === 'playing') pause(); else start(); }
    return;
  }
  const direction = { arrowup: 'up', w: 'up', arrowright: 'right', d: 'right', arrowdown: 'down', s: 'down', arrowleft: 'left', a: 'left' }[key];
  if (!direction || engine.status !== 'playing') return;
  event.preventDefault();
  if (!event.repeat) turn(direction);
});

canvas.addEventListener('pointerdown', event => {
  if (swipe || engine.status !== 'playing' || !event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
  swipe = { id: event.pointerId, x: event.clientX, y: event.clientY };
  canvas.setPointerCapture(event.pointerId);
  canvas.focus({ preventScroll: true });
});
function sampleSwipe(event) {
  if (!swipe || event.pointerId !== swipe.id || !Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return;
  const dx = event.clientX - swipe.x;
  const dy = event.clientY - swipe.y;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
  turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
  swipe = { id: event.pointerId, x: event.clientX, y: event.clientY };
}
canvas.addEventListener('pointermove', sampleSwipe);
function endSwipe(event) { if (swipe?.id === event.pointerId) swipe = null; }
canvas.addEventListener('pointerup', event => { sampleSwipe(event); endSwipe(event); });
canvas.addEventListener('pointercancel', endSwipe);
canvas.addEventListener('lostpointercapture', endSwipe);
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
window.addEventListener('blur', pause);
document.querySelector('.home-menu')?.addEventListener('toggle', event => { if (event.target.open) pause(); });
new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

function frame(time) {
  if (engine.status === 'playing' && !document.hidden) {
    const oldSteps = engine.steps;
    if (previousTime !== null) engine.advance(Math.min(time - previousTime, engine.interval));
    previousTime = time;
    if (engine.steps !== oldSteps || engine.status !== 'playing') render();
  } else previousTime = null;
  requestAnimationFrame(frame);
}

window.snakeGame = Object.freeze({ snapshot: () => engine.snapshot() });
render();
requestAnimationFrame(frame);
