import { parseData, validateData, STORAGE_KEY, MAX_BYTES } from './data.mjs';

// Fictional examples only. Personal records are imported from a local file.
const EXAMPLE = {
  schemaVersion: 1, title: 'Career compensation', asOf: '2026-09-01',
  milestones: [
    { id: 'example-a', company: 'Maple Studio', effectiveDate: '2022-04-01', periodLabel: 'April 2022 offer', kind: 'offer', annualCTC: 780000, fixed: 720000, variable: 60000, sourceLabel: 'Fictional offer', note: 'An example package with a separate performance target.' },
    { id: 'example-b', company: 'Maple Studio', effectiveDate: '2023-04-01', periodLabel: 'April 2023 revision', kind: 'revision', annualCTC: 960000, fixed: 900000, variable: 60000, sourceLabel: 'Fictional revision', note: 'A documented revision at the same employer.' },
    { id: 'example-c', company: 'Orbit Systems', effectiveDate: '2024-01-15', periodLabel: 'January 2024 offer', kind: 'offer', annualCTC: 1280000, fixed: null, variable: null, sourceLabel: 'Fictional offer', note: 'The package is known, but its fixed and variable components are not. A missing split is never treated as zero.' },
    { id: 'example-d', company: 'Northstar', effectiveDate: '2025-03-01', periodLabel: 'March 2025 offer', kind: 'offer', annualCTC: 1460000, fixed: 1340000, variable: 120000, sourceLabel: 'Fictional offer', note: 'Equity is recorded separately from the annual package.' },
    { id: 'example-e', company: 'Northstar', effectiveDate: '2026-03-01', periodLabel: 'March 2026 revision', kind: 'revision', annualCTC: 1710000, fixed: 1560000, variable: 150000, sourceLabel: 'Fictional revision', note: 'Variable pay is a target, not a guaranteed payout.' }
  ],
  payroll: [
    { company: 'Maple Studio', period: '2023-08', gross: 73000, net: 66500, note: 'A fictional regular monthly payslip.' },
    { company: 'Orbit Systems', period: '2024-10', gross: 101500, net: 88600, note: 'Different periods and deductions affect take-home pay.' },
    { company: 'Northstar', period: '2026-08', gross: 126500, net: 109400, note: 'Annual bonuses are separate from this example month.' }
  ],
  equity: [{ company: 'Northstar', grantValue: 360000, grantDate: '2025-03-01', vesting: 'A four-year grant', note: 'A fictional grant value, not annual cash compensation or a current valuation.' }],
  consulting: [{ company: 'Independent project', monthlyFee: 62000, periodLabel: 'May–June 2026', invoiceAmount: 31000, invoicePeriod: 'First half of June', note: 'A fictional contract. An invoice is not evidence of payment.' }],
  unavailable: [],
  notes: ['All names and numbers in this example are fictional.', 'Load your own data file to replace this example. Your file is read locally and is never uploaded.']
};

const $ = id => document.getElementById(id);
const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: Number.isInteger(value) ? 0 : 2 }).format(value);
const lakh = value => (value / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
const month = value => new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(value + '-01T12:00:00Z'));
const date = value => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(value + 'T12:00:00Z'));
const timestamp = value => Date.parse(value + 'T12:00:00Z');
let data = validateData(EXAMPLE), savedData = null, personalData = null, selectedId = null, exampleMode = true;

function el(tag, className, text) {
  const item = document.createElement(tag);
  if (className) item.className = className;
  if (text !== undefined) item.textContent = text;
  return item;
}
function svgEl(tag, attrs = {}, text) {
  const item = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attrs)) item.setAttribute(key, value);
  if (text !== undefined) item.textContent = text;
  return item;
}
function appendSVG(parent, tag, attrs, text) {
  const item = svgEl(tag, attrs, text); parent.append(item); return item;
}
function orderedMilestones() {
  return [...data.milestones].sort((a, b) => (a.effectiveDate ? timestamp(a.effectiveDate) : -Infinity) - (b.effectiveDate ? timestamp(b.effectiveDate) : -Infinity));
}
function currentMilestone() {
  return data.milestones.find(item => item.id === selectedId) || orderedMilestones().at(-1);
}
function showError(message) {
  $('error-message').textContent = message;
  $('error-message').hidden = !message;
}
function announce(message) { $('data-status').textContent = message; }

function setData(next, isExample) {
  data = next; exampleMode = isExample;
  selectedId = orderedMilestones().at(-1).id;
  showError(''); render();
}
function render() {
  $('content-title').textContent = exampleMode ? 'Career compensation' : data.title;
  $('as-of').textContent = `Records reviewed ${date(data.asOf)}`;
  $('mode-badge').textContent = exampleMode ? 'Fictional example' : data === savedData ? 'Saved in this browser' : 'This session only';
  $('mode-badge').classList.toggle('is-private', !exampleMode);
  $('export-button').disabled = exampleMode;
  $('clear-button').disabled = !personalData && !savedData;
  $('demo-button').textContent = exampleMode && personalData ? 'Return to my data' : 'View example';
  $('demo-button').disabled = exampleMode && !personalData;
  $('annual-legend').replaceChildren();
  [['legend-fixed', 'Documented CTC'], ['legend-unknown', 'Breakdown unavailable']].forEach(([className, label]) => {
    const item = el('span', 'legend-item'); item.append(el('span', `legend-dot ${className}`), document.createTextNode(label)); $('annual-legend').append(item);
  });
  renderMilestones(); renderTimeline(); renderDetail(); renderPayroll(); renderEquity(); renderConsulting(); renderNotes();
}

function selectMilestone(id) {
  selectedId = id;
  $('milestone-list').querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.id === id)));
  renderTimeline(); renderDetail();
}
function renderMilestones() {
  const list = $('milestone-list'); list.replaceChildren();
  orderedMilestones().forEach(item => {
    const button = el('button', 'milestone-button');
    button.type = 'button'; button.dataset.id = item.id;
    button.setAttribute('aria-pressed', String(item.id === selectedId));
    button.setAttribute('aria-controls', 'milestone-detail');
    button.append(el('span', 'milestone-company', item.company), el('span', 'milestone-period', item.periodLabel), el('span', 'milestone-amount', `₹${lakh(item.annualCTC)}L`));
    button.addEventListener('click', () => selectMilestone(item.id));
    list.append(button);
  });
}

function renderTimeline() {
  const container = $('timeline-chart'); container.replaceChildren();
  const points = orderedMilestones().filter(item => item.effectiveDate);
  if (!points.length) {
    container.append(el('p', 'empty-note', 'These records have no confirmed effective dates. Select a package below to inspect its breakdown.'));
    return;
  }
  const width = Math.max(240, container.clientWidth), narrow = width < 480, height = narrow ? 285 : 370;
  const margins = { left: 46, right: 30, top: 32, bottom: 44 };
  let minDate = Math.min(...points.map(item => timestamp(item.effectiveDate))), maxDate = Math.max(...points.map(item => timestamp(item.effectiveDate)));
  const span = Math.max(maxDate - minDate, 86400000 * 365);
  minDate -= span * .035; maxDate += span * .035;
  if (points.length === 1) { minDate -= span / 2; maxDate += span / 2; }
  const rawMax = Math.max(...points.map(item => item.annualCTC / 100000));
  const step = Math.max(1, Math.ceil(rawMax / 5));
  const maxAmount = Math.ceil(rawMax * 1.15 / step) * step;
  const x = time => margins.left + (time - minDate) / (maxDate - minDate) * (width - margins.left - margins.right);
  const y = amount => height - margins.bottom - amount / maxAmount * (height - margins.top - margins.bottom);
  const svg = svgEl('svg', { viewBox: `0 0 ${width} ${height}`, width, height, role: 'img', 'aria-label': 'Documented annual CTC by effective date. Select a milestone below to read its exact amount and caveats.' });
  svg.append(svgEl('title', {}, 'Annual compensation milestones'));
  appendSVG(svg, 'text', { x: 0, y: 14, class: 'axis chart-unit' }, '₹ lakh / year');
  for (let value = 0; value <= maxAmount; value += step) {
    appendSVG(svg, 'line', { x1: margins.left, x2: width - margins.right, y1: y(value), y2: y(value), class: 'grid-line' });
    appendSVG(svg, 'text', { x: margins.left - 12, y: y(value) + 4, 'text-anchor': 'end', class: 'axis' }, value);
  }
  const firstYear = new Date(minDate).getUTCFullYear(), lastYear = new Date(maxDate).getUTCFullYear();
  const yearStep = Math.max(1, Math.ceil((lastYear - firstYear) / (narrow ? 3 : 6)));
  for (let year = firstYear; year <= lastYear; year += yearStep) {
    const time = Date.UTC(year, 0, 1);
    if (time >= minDate && time <= maxDate) appendSVG(svg, 'text', { x: x(time), y: height - 12, class: 'axis', 'text-anchor': 'middle' }, year);
  }
  // Connect only consecutive documented milestones at the same employer.
  points.forEach((item, i) => {
    const previous = points[i - 1];
    if (previous && previous.company === item.company) {
      appendSVG(svg, 'line', { x1: x(timestamp(previous.effectiveDate)), y1: y(previous.annualCTC / 100000), x2: x(timestamp(item.effectiveDate)), y2: y(item.annualCTC / 100000), class: 'timeline-line' });
    }
  });
  const selected = currentMilestone();
  if (selected.effectiveDate) {
    appendSVG(svg, 'line', { x1: x(timestamp(selected.effectiveDate)), x2: x(timestamp(selected.effectiveDate)), y1: margins.top, y2: height - margins.bottom, class: 'selection-guide' });
  }
  const placedLabels = [];
  points.forEach(item => {
    const px = x(timestamp(item.effectiveDate)), py = y(item.annualCTC / 100000), active = item.id === selectedId;
    const group = appendSVG(svg, 'g', { class: `timeline-point${active ? ' is-selected' : ''}${item.fixed === null ? ' unknown-basis' : ''}` });
    appendSVG(group, 'title', {}, `${item.company} · ${item.periodLabel} · ${money(item.annualCTC)} annual CTC`);
    if (active) appendSVG(group, 'circle', { cx: px, cy: py, r: 13, class: 'point-halo' });
    appendSVG(group, 'circle', { cx: px, cy: py, r: active ? 6 : 5, class: 'point-core' });
    const hit = appendSVG(group, 'circle', { cx: px, cy: py, r: 20, class: 'chart-hit' });
    hit.addEventListener('click', () => selectMilestone(item.id));
    if (active || (!narrow && (item === points[0] || item === points.at(-1)))) {
      const anchor = px > width * .78 ? 'end' : px < width * .22 ? 'start' : 'middle';
      placedLabels.push({ active, label: appendSVG(svg, 'text', { x: px, y: Math.max(28, py - 20), 'text-anchor': anchor, class: 'chart-label' }, `₹${lakh(item.annualCTC)}L`) });
    }
  });
  container.append(svg);
  const unplaced = data.milestones.filter(item => !item.effectiveDate);
  if (unplaced.length) container.append(el('p', 'chart-footnote', `${unplaced.length} undated ${unplaced.length === 1 ? 'baseline appears' : 'baselines appear'} in the package selector below, outside the time axis.`));
  container.append(el('p', 'chart-footnote', 'Lines link revisions at the same employer. Gaps do not imply continuous employment or income.'));
  // Remove optional colliding annotations; retain the selected point label.
  const boxes = [];
  placedLabels.sort((a, b) => Number(b.active) - Number(a.active)).forEach(({ label }) => {
    const box = label.getBoundingClientRect();
    if (boxes.some(other => box.left < other.right + 6 && box.right + 6 > other.left && box.top < other.bottom + 6 && box.bottom + 6 > other.top)) label.remove(); else boxes.push(box);
  });
}

function renderDetail() {
  const item = currentMilestone(), panel = $('milestone-detail'); panel.replaceChildren();
  panel.append(el('p', 'detail-period', item.periodLabel), el('h3', 'detail-company', item.company), el('p', 'detail-value', `₹${lakh(item.annualCTC)} lakh`), el('p', 'detail-unit', `${money(item.annualCTC)} annual CTC stated in the letter`));
  const facts = el('dl', 'detail-facts');
  [['Fixed CTC', item.fixed], ['Variable target', item.variable]].forEach(([label, value]) => {
    const row = el('div'); row.append(el('dt', '', label), el('dd', '', value === null ? 'Not specified' : money(value))); facts.append(row);
  });
  if (item.fixed !== null || item.variable !== null) {
    const split = svgEl('svg', { viewBox: '0 0 280 12', height: '12', width: '100%', role: 'img', 'aria-label': 'Fixed and variable components of annual CTC' });
    let offset = 0;
    [['fixed', 'split-fixed'], ['variable', 'split-variable']].forEach(([key, className]) => {
      if (item[key] === null) return;
      const w = item[key] / item.annualCTC * 280;
      appendSVG(split, 'rect', { x: offset, y: 0, width: w, height: 12, class: className }); offset += w;
    });
    if (offset < 279.99) appendSVG(split, 'rect', { x: offset, y: 0, width: 280 - offset, height: 12, class: 'split-unknown' });
    panel.append(split);
  }
  panel.append(facts);
  const points = orderedMilestones(), index = points.findIndex(point => point.id === item.id), previous = points[index - 1];
  if (item.kind === 'revision' && previous && previous.company === item.company && item.fixed !== null && previous.fixed !== null) {
    const change = (item.annualCTC / previous.annualCTC - 1) * 100;
    panel.append(el('p', 'revision-change', `${change >= 0 ? '+' : ''}${change.toLocaleString('en-IN', { maximumFractionDigits: 1 })}% from this employer’s previous documented package`));
  }
  if (item.note) panel.append(el('p', 'detail-note', item.note));
  if (item.sourceLabel) panel.append(el('p', 'source-label', item.sourceLabel));
}

function renderPayroll() {
  const container = $('payroll-chart'); container.replaceChildren();
  $('payroll-note').textContent = 'Latest regular payslips supplied. Dates and deductions differ; this is a comparison of recorded pay, not a tax forecast.';
  if (!data.payroll.length) { container.append(el('p', 'empty-note', 'No regular payslips in this file.')); return; }
  const max = Math.max(...data.payroll.map(item => item.gross), 1);
  data.payroll.forEach(item => {
    const row = el('article', 'payroll-row');
    const head = el('div', 'payroll-heading'); head.append(el('h3', '', item.company), el('span', '', month(item.period))); row.append(head); container.append(row);
    const width = Math.max(240, row.clientWidth), height = 80, start = 68, end = width - 90;
    const svg = svgEl('svg', { viewBox: `0 0 ${width} ${height}`, width, height, role: 'img', 'aria-label': `${item.company}, ${month(item.period)}: gross ${money(item.gross)}, take-home ${money(item.net)}` });
    [['Gross', item.gross, 'pay-gross'], ['Take-home', item.net, 'pay-net']].forEach(([label, amount, className], index) => {
      const y = 10 + index * 34, length = (end - start) * amount / max;
      appendSVG(svg, 'text', { x: 0, y: y + 16, class: 'axis' }, label);
      appendSVG(svg, 'rect', { x: start, y, width: Math.max(0, length), height: 23, rx: 3, class: className });
      appendSVG(svg, 'text', { x: start + length + 8, y: y + 16, class: 'pay-value' }, money(amount));
    });
    row.append(svg);
    if (item.note) row.append(el('p', 'payroll-note', item.note));
  });
}
function renderEquity() {
  const list = $('equity-list'); list.replaceChildren();
  if (!data.equity.length) list.append(el('p', 'empty-note', 'No equity grants recorded. This does not establish zero ownership.'));
  data.equity.forEach(item => {
    const row = el('article', 'equity-item');
    row.append(el('h3', '', item.company), el('p', 'equity-value', item.grantValue === null ? 'Value not specified' : money(item.grantValue)), el('p', 'equity-label', `Stated grant value${item.grantDate ? ' · ' + date(item.grantDate) : ''}`), el('p', 'equity-vesting', item.vesting), el('p', 'equity-note', item.note)); list.append(row);
  });
}
function renderConsulting() {
  const list = $('consulting-list'); list.replaceChildren();
  if (!data.consulting.length) list.append(el('p', 'empty-note', 'No consulting records in this file.'));
  data.consulting.forEach(item => {
    const row = el('article', 'consulting-item');
    row.append(el('h3', '', item.company), el('p', 'consulting-value', `${money(item.monthlyFee)} / month`), el('p', 'consulting-period', item.periodLabel));
    if (item.invoiceAmount !== null) row.append(el('p', 'invoice-note', `${money(item.invoiceAmount)} invoiced · ${item.invoicePeriod}`));
    row.append(el('p', '', item.note)); list.append(row);
  });
}
function renderNotes() {
  $('notes-list').replaceChildren(...data.notes.map(note => el('li', '', note)));
  $('unavailable-list').replaceChildren(...data.unavailable.map(note => el('li', '', note)));
}

async function importFile(file) {
  if (!file) return;
  try {
    if (file.size > MAX_BYTES) throw new Error('Choose a JSON file smaller than 1 MB.');
    const next = parseData(await file.text());
    let persisted = false;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); savedData = next; persisted = true; } catch (_) { /* Keep any earlier saved file available if this import cannot persist. */ }
    personalData = next;
    setData(next, false);
    announce(persisted ? 'Your data is saved in this browser. Nothing was uploaded.' : 'Loaded for this session. Browser storage is unavailable; keep your file to reopen it later.');
  } catch (error) { showError(error.message || 'This file could not be read. Choose a valid compensation JSON file.'); }
  $('import-input').value = '';
}
$('import-button').addEventListener('click', () => $('import-input').click());
$('import-input').addEventListener('change', event => importFile(event.target.files[0]));
$('demo-button').addEventListener('click', () => {
  if (exampleMode && personalData) { setData(personalData, false); announce(data === savedData ? 'Showing your saved browser data.' : 'Showing your session data. Export a backup to keep it.'); }
  else { setData(validateData(EXAMPLE), true); announce('Showing fictional example data. Your personal data is unchanged.'); }
});
$('export-button').addEventListener('click', () => {
  if (exampleMode) return;
  const blob = new Blob([JSON.stringify(data, null, 2) + '\n'], { type: 'application/json' });
  const url = URL.createObjectURL(blob), link = el('a'); link.href = url; link.download = 'compensation-backup.json';
  document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  announce('Backup downloaded to your device.');
});
$('clear-button').addEventListener('click', () => {
  if ((!savedData && !personalData) || !confirm('Remove your compensation data from this browser and this session? Your original file will not be deleted.')) return;
  let cleared = false;
  try { localStorage.removeItem(STORAGE_KEY); savedData = null; cleared = true; } catch (_) {}
  personalData = null; setData(validateData(EXAMPLE), true);
  announce('Personal data removed from this session. Showing fictional examples.');
  if (!cleared) showError('Browser storage could not be cleared. Use your browser’s site-data settings to remove any saved copy.');
  else announce('Personal data removed from this browser. Showing fictional examples.');
});
function setTheme(theme) {
  theme = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
  $('theme-toggle').textContent = theme === 'dark' ? 'Light theme' : 'Dark theme';
  $('theme-toggle').setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
}
try { setTheme(localStorage.getItem('theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')); } catch (_) { setTheme('light'); }
$('theme-toggle').addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; setTheme(theme);
  try { localStorage.setItem('theme', theme); } catch (_) {}
});
try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) { savedData = parseData(stored); personalData = savedData; data = savedData; exampleMode = false; announce('Showing your saved browser data. Nothing was uploaded.'); }
} catch (_) { announce('Saved data could not be read. Load a fresh file to restore it.'); }
selectedId = orderedMilestones().at(-1).id;
render();
let previousWidth = 0;
new ResizeObserver(entries => {
  const width = entries[0].contentRect.width;
  if (Math.abs(width - previousWidth) < 1) return;
  previousWidth = width; renderTimeline(); renderPayroll();
}).observe($('timeline-chart'));
window.addEventListener('storage', event => {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  try {
    savedData = event.newValue ? parseData(event.newValue) : null;
    personalData = savedData;
    setData(savedData || validateData(EXAMPLE), !savedData);
    announce(savedData ? 'Updated from another tab in this browser.' : 'Data was removed in another tab.');
  } catch (_) { showError('Another tab saved an unreadable file. Reload your original file.'); }
});
