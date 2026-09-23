import { Tetris, SHAPES, WIDTH, HEIGHT } from './engine.mjs?v=2';

const engine = new Tetris();
const canvas = document.querySelector('#tetris-board');
const context = canvas.getContext('2d');
const nextCanvas = document.querySelector('#tetris-next');
const nextContext = nextCanvas.getContext('2d');
const toggle = document.querySelector('#tetris-toggle');
const restart = document.querySelector('#tetris-restart');
const status = document.querySelector('#tetris-status');
const overlay = document.querySelector('#tetris-overlay');
const title = document.querySelector('#tetris-overlay-title');
const detail = document.querySelector('#tetris-overlay-detail');
const controls = [...document.querySelectorAll('[data-action]')];
const colors = { I: '#88b9bc', J: '#879ebd', L: '#e1a06d', O: '#d8bd70', S: '#97ad81', T: '#b299b4', Z: '#d98b76' };
let previousTime = null;
let previousPieces = 0;
let lastState = '';

function block(ctx, x, y, color, size, ghost = false) {
  if (ghost) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x * size + 3, y * size + 3, size - 6, size - 6);
  } else {
    ctx.fillStyle = color;
    ctx.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
    ctx.fillStyle = 'rgba(255,255,255,.16)';
    ctx.fillRect(x * size + 2, y * size + 2, size - 4, 3);
  }
}

function render() {
  const state = engine.snapshot();
  const tokens = getComputedStyle(document.documentElement);
  const size = canvas.width / WIDTH;
  context.fillStyle = tokens.getPropertyValue('--surface');
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = tokens.getPropertyValue('--line');
  context.lineWidth = .5;
  for (let x = 1; x < WIDTH; x++) { context.beginPath(); context.moveTo(x * size, 0); context.lineTo(x * size, canvas.height); context.stroke(); }
  for (let y = 1; y < HEIGHT; y++) { context.beginPath(); context.moveTo(0, y * size); context.lineTo(canvas.width, y * size); context.stroke(); }
  state.board.forEach((row, y) => row.forEach((type, x) => { if (type) block(context, x, y, colors[type], size); }));
  if (state.active) {
    const piece = state.active;
    piece.matrix.forEach((row, y) => row.forEach((filled, x) => {
      if (filled) block(context, x + piece.x, y + state.ghostY, colors[piece.type], size, true);
    }));
    piece.matrix.forEach((row, y) => row.forEach((filled, x) => {
      if (filled) block(context, x + piece.x, y + piece.y, colors[piece.type], size);
    }));
  }
  nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  const next = SHAPES[state.next];
  const previewSize = 24;
  const dx = (nextCanvas.width / previewSize - next[0].length) / 2;
  const dy = (nextCanvas.height / previewSize - next.length) / 2;
  next.forEach((row, y) => row.forEach((filled, x) => { if (filled) block(nextContext, x + dx, y + dy, colors[state.next], previewSize); }));
  nextCanvas.setAttribute('aria-label', `Next piece: ${state.next}`);
  document.querySelector('#tetris-score').textContent = state.score.toLocaleString();
  document.querySelector('#tetris-lines').textContent = state.lines;
  document.querySelector('#tetris-level').textContent = state.level;
  canvas.setAttribute('aria-label', `Tetris board. ${state.status === 'over' ? 'Game over' : state.status}. ${state.lines} lines cleared. Score ${state.score}.`);
  toggle.textContent = { ready: 'Start game', playing: 'Pause', paused: 'Resume', over: 'Play again' }[state.status];
  restart.disabled = state.status === 'ready';
  controls.forEach(button => { button.disabled = state.status !== 'playing'; });
  overlay.hidden = state.status === 'playing';
  if (state.status === 'ready') { title.textContent = 'One piece at a time.'; detail.textContent = 'Ready when you are.'; }
  if (state.status === 'paused') { title.textContent = 'Take your time.'; detail.textContent = 'Press Resume to keep playing.'; }
  if (state.status === 'over') { title.textContent = 'No room left.'; detail.textContent = `${state.lines} ${state.lines === 1 ? 'line' : 'lines'} cleared. Play again for a fresh start.`; }
  if (lastState !== state.status) {
    status.textContent = { ready: 'Press Start game to begin.', playing: 'Find a place for the next piece.', paused: 'Paused. Your board will be here when you return.', over: `Game over. Score ${state.score.toLocaleString()}. Press Play again to start fresh.` }[state.status];
    lastState = state.status;
  } else if (previousPieces !== state.pieces && state.lastClear) {
    status.textContent = `${state.lastClear === 4 ? 'Four rows at once!' : `${state.lastClear} ${state.lastClear === 1 ? 'row' : 'rows'} cleared.`} ${state.lines} in total. Level ${state.level}.`;
  }
  previousPieces = state.pieces;
}

function action(name) {
  if (document.hidden) return false;
  if (engine.status !== 'playing') return false;
  const result = name === 'left' ? engine.move(-1)
    : name === 'right' ? engine.move(1)
    : name === 'rotate' ? engine.rotate()
    : name === 'counterrotate' ? engine.rotate(false)
    : name === 'down' ? engine.down(true)
    : name === 'drop' ? engine.drop() : false;
  render();
  return result;
}

function start() {
  if (document.hidden) return;
  engine.start();
  previousTime = null;
  render();
}

function pause() { engine.pause(); previousTime = null; render(); }

toggle.addEventListener('click', () => {
  if (engine.status === 'playing') pause();
  else { start(); canvas.focus({ preventScroll: true }); }
});
restart.addEventListener('click', () => {
  engine.reset();
  start();
  canvas.focus({ preventScroll: true });
});
controls.forEach(button => button.addEventListener('click', () => {
  action(button.dataset.action);
  canvas.focus({ preventScroll: true });
}));

document.addEventListener('keydown', event => {
  if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || document.hidden) return;
  if (document.querySelector('.home-menu[open]')) return;
  const target = event.target;
  if (target instanceof Element && target.closest('a, input, select, textarea, summary, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="combobox"]')) return;
  const key = event.key.toLowerCase();
  // Theme and game buttons can keep focus after a click. Continue accepting
  // game keys there, while leaving their native activation keys untouched.
  if ((key === ' ' || key === 'enter') && target instanceof Element && target.closest('button, [role="button"]')) return;
  if ((key === 'p' || key === 'escape') && (engine.status === 'playing' || engine.status === 'paused')) {
    event.preventDefault();
    if (event.repeat) return;
    if (engine.status === 'playing') pause(); else start();
    return;
  }
  const name = { arrowleft: 'left', arrowright: 'right', arrowup: 'rotate', arrowdown: 'down', ' ': 'drop', x: 'rotate', z: 'counterrotate' }[key];
  if (!name || engine.status !== 'playing') return;
  event.preventDefault();
  if (event.repeat && ['drop', 'rotate', 'counterrotate'].includes(name)) return;
  action(name);
});

document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
document.querySelector('.home-menu')?.addEventListener('toggle', event => { if (event.target.open) pause(); });
new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

function frame(time) {
  if (engine.status === 'playing' && !document.hidden) {
    const oldY = engine.active?.y;
    const oldPieces = engine.pieces;
    if (previousTime !== null) engine.advance(time - previousTime);
    previousTime = time;
    if (oldY !== engine.active?.y || oldPieces !== engine.pieces || engine.status !== 'playing') render();
  } else previousTime = null;
  requestAnimationFrame(frame);
}

// Read-only state and the same actions used by the visible controls.
window.tetrisGame = Object.freeze({ snapshot: () => engine.snapshot(), start, pause, action });
render();
requestAnimationFrame(frame);
