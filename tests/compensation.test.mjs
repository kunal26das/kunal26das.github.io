import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateData, parseData, STORAGE_KEY, MAX_BYTES } from '../site/compensation/data.mjs';

// Entirely fictional examples; never use personal source material in this suite.
function sample() {
  return {
    schemaVersion: 1,
    title: 'Illustrative career',
    asOf: '2032-04-05',
    milestones: [{
      id: 'example-start', company: 'Orchid Observatory', effectiveDate: '2032-03-01',
      periodLabel: 'Spring 2032', kind: 'offer', annualCTC: 1110000,
      fixed: 999000, variable: 111000, note: 'Illustrative only.', sourceLabel: 'Example compensation note',
    }],
    payroll: [{ company: 'Orchid Observatory', period: '2032-03', gross: 83250, net: 71100, note: '' }],
    equity: [{ company: 'Orchid Observatory', grantValue: 123456, grantDate: null, vesting: 'Illustrative schedule', note: '' }],
    consulting: [{ company: 'Paper Moon Workshop', monthlyFee: 43210, periodLabel: 'Illustrative project', invoiceAmount: null, invoicePeriod: '', note: '' }],
    unavailable: ['An illustrative record is unavailable.'],
    notes: ['All figures are fictional.'],
  };
}

test('exports browser storage constants and round-trips a valid complete document', () => {
  assert.equal(STORAGE_KEY, 'compensation-explorer:data:v1');
  assert.equal(MAX_BYTES, 1e6);
  const input = sample();
  assert.deepEqual(parseData(JSON.stringify(input)), input);
});

test('normalization strips unknown fields at every level and leaves input unchanged', () => {
  const raw = sample();
  raw.externalSource = 'discard this';
  raw.milestones[0].sourceUrl = 'discard this';
  raw.milestones[0].employeeIdentifier = 'discard this';
  raw.payroll[0].account = 'discard this';
  raw.equity[0].privateReference = 'discard this';
  raw.consulting[0].taxIdentifier = 'discard this';
  const before = structuredClone(raw);
  const normalized = validateData(raw);
  assert.deepEqual(normalized, sample());
  assert.deepEqual(raw, before);
  normalized.milestones[0].note = 'Changed locally';
  normalized.notes.push('Another local note');
  assert.equal(raw.milestones[0].note, 'Illustrative only.');
  assert.equal(raw.notes.length, 1);
});

test('missing optional arrays and nullable components normalize without inventing zeroes', () => {
  const raw = sample();
  for (const key of ['payroll', 'equity', 'consulting', 'unavailable', 'notes']) delete raw[key];
  for (const key of ['fixed', 'variable', 'effectiveDate', 'note', 'sourceLabel']) delete raw.milestones[0][key];
  const normalized = validateData(raw);
  assert.equal(normalized.milestones[0].fixed, null);
  assert.equal(normalized.milestones[0].variable, null);
  assert.equal(normalized.milestones[0].effectiveDate, null);
  assert.equal(normalized.milestones[0].note, '');
  assert.deepEqual(normalized.payroll, []);
  assert.deepEqual(normalized.notes, []);
});

test('unknown variable remains null when fixed equals CTC; a true zero stays zero', () => {
  const raw = sample();
  raw.milestones[0].fixed = raw.milestones[0].annualCTC;
  raw.milestones[0].variable = null;
  assert.equal(validateData(raw).milestones[0].variable, null);
  raw.milestones[0].variable = 0;
  assert.equal(validateData(raw).milestones[0].variable, 0);
});

test('known components must reconcile within one rupee and cannot exceed CTC', () => {
  const raw = sample();
  raw.milestones[0].variable += 1;
  assert.doesNotThrow(() => validateData(raw));
  raw.milestones[0].variable += 0.01;
  assert.throws(() => validateData(raw), /fixed plus variable.*within 1 INR/);
  raw.milestones[0].variable = null;
  raw.milestones[0].fixed = raw.milestones[0].annualCTC + 2;
  assert.throws(() => validateData(raw), /milestones\[0\]\.fixed.*exceed/);
});

test('rejects numeric strings, non-finite numbers, negative amounts and excessive amounts', () => {
  for (const value of ['1110000', NaN, Infinity, -Infinity, -1, 0, 1e10 + 1]) {
    const raw = sample();
    raw.milestones[0].annualCTC = value;
    assert.throws(() => validateData(raw), /milestones\[0\]\.annualCTC/);
  }
  for (const [collection, key] of [['payroll', 'gross'], ['payroll', 'net'], ['equity', 'grantValue'], ['consulting', 'monthlyFee'], ['consulting', 'invoiceAmount']]) {
    const raw = sample();
    raw[collection][0][key] = -1;
    assert.throws(() => validateData(raw), new RegExp(`${collection}\\[0\\]\\.${key}`));
  }
});

test('net pay cannot exceed gross; zero payroll and zero grants are valid', () => {
  const raw = sample();
  raw.payroll[0].net = raw.payroll[0].gross + 0.01;
  assert.throws(() => validateData(raw), /net.*exceed gross/);
  raw.payroll[0].gross = raw.payroll[0].net = 0;
  raw.equity[0].grantValue = 0;
  assert.equal(validateData(raw).equity[0].grantValue, 0);
});

test('validates real dates without silently rolling impossible dates into another month', () => {
  const raw = sample();
  raw.asOf = '2032-02-29';
  assert.doesNotThrow(() => validateData(raw));
  for (const value of ['2031-02-29', '2100-02-29', '2032-04-31', '2032-00-01', '2032-13-01', '2032-01-00', '0000-01-01', '2032-2-03', '2032-01-01T00:00:00Z']) {
    raw.asOf = value;
    assert.throws(() => validateData(raw), /asOf:/);
  }
  raw.asOf = '2000-02-29';
  raw.milestones[0].effectiveDate = '2032-02-30';
  assert.throws(() => validateData(raw), /effectiveDate/);
  raw.milestones[0].effectiveDate = null;
  raw.equity[0].grantDate = '2032-11-31';
  assert.throws(() => validateData(raw), /grantDate/);
});

test('payroll periods require a valid year and month', () => {
  for (const period of ['2032-13', '2032-00', '2032-3', '2032-03-01', '0000-03', null]) {
    const raw = sample();
    raw.payroll[0].period = period;
    assert.throws(() => validateData(raw), /payroll\[0\]\.period/);
  }
});

test('requires unique trimmed ids, recognized milestone kinds and at least one milestone', () => {
  const raw = sample();
  raw.milestones.push({ ...raw.milestones[0], id: ` ${raw.milestones[0].id} ` });
  assert.throws(() => validateData(raw), /id must be unique/);
  raw.milestones.pop();
  raw.milestones[0].kind = 'unrecognized';
  assert.throws(() => validateData(raw), /kind/);
  raw.milestones = [];
  assert.throws(() => validateData(raw), /at least one milestone/);
});

test('rejects malformed objects, missing required text, wrong versions and invalid arrays', () => {
  for (const value of [null, [], 'data', 7, new Date()]) {
    assert.throws(() => validateData(value), /data:/);
  }
  for (const version of [undefined, '1', 2]) {
    const raw = sample();
    raw.schemaVersion = version;
    assert.throws(() => validateData(raw), /schemaVersion/);
  }
  const raw = sample();
  raw.title = '   ';
  assert.throws(() => validateData(raw), /title.*empty/);
  raw.title = 'Illustrative career';
  raw.payroll = null;
  assert.throws(() => validateData(raw), /payroll.*array/);
  raw.payroll = new Array(1);
  assert.throws(() => validateData(raw), /payroll\[0\].*object/);
});

test('enforces array caps and field-specific text limits', () => {
  for (const key of ['milestones', 'payroll', 'equity', 'consulting', 'unavailable', 'notes']) {
    const raw = sample();
    raw[key] = Array.from({ length: 101 }, () => raw[key][0]);
    assert.throws(() => validateData(raw), new RegExp(`${key}:.*100 entries`));
  }
  for (const [field, limit] of [['id', 80], ['company', 80], ['periodLabel', 80], ['note', 1200], ['sourceLabel', 160]]) {
    const raw = sample();
    raw.milestones[0][field] = 'x'.repeat(limit + 1);
    assert.throws(() => validateData(raw), new RegExp(`milestones\\[0\\]\\.${field}`));
  }
  const raw = sample();
  raw.title = 'x'.repeat(101);
  assert.throws(() => validateData(raw), /title.*100/);
  raw.title = 'Illustrative career';
  raw.equity[0].vesting = 'x'.repeat(301);
  assert.throws(() => validateData(raw), /vesting.*300/);
});

test('treats markup as plain text and drops prototype-related unknown properties', () => {
  const raw = sample();
  raw.milestones[0].id = '__proto__';
  raw.milestones[0].note = '<b>Plain text only</b>';
  const parsed = JSON.parse(JSON.stringify(raw));
  Object.defineProperty(parsed, '__proto__', { value: { polluted: true }, enumerable: true });
  parsed.constructor = { prototype: { polluted: true } };
  const normalized = validateData(parsed);
  assert.equal(normalized.milestones[0].id, '__proto__');
  assert.equal(normalized.milestones[0].note, '<b>Plain text only</b>');
  assert.equal(Object.hasOwn(normalized, '__proto__'), false);
  assert.equal(Object.hasOwn(normalized, 'constructor'), false);
  assert.equal({}.polluted, undefined);
});

test('parse errors never echo private input and enforce byte rather than character size', () => {
  assert.throws(() => parseData('{ private example syntax'), error => {
    assert.match(error.message, /not valid JSON/);
    assert.doesNotMatch(error.message, /private example syntax/);
    return true;
  });
  assert.throws(() => parseData(null), /JSON text/);
  assert.throws(() => parseData(' '.repeat(MAX_BYTES + 1)), /1 MB/);
  assert.throws(() => parseData('é'.repeat(MAX_BYTES / 2 + 1)), /1 MB/);
});

test('the private workspace blocks connections and loads no third-party active resources', async () => {
  const html = await readFile(new URL('../site/compensation/index.html', import.meta.url), 'utf8');
  const csp = html.match(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"/i)?.[1];
  assert.ok(csp, 'The private workspace must declare its content security policy.');
  for (const directive of ["connect-src 'none'", "object-src 'none'", "base-uri 'none'", "form-action 'none'", "frame-src 'none'"]) {
    assert.ok(csp.split(';').map(value => value.trim()).includes(directive), `Missing privacy boundary: ${directive}`);
  }
  assert.doesNotMatch(csp, /unsafe-inline|unsafe-eval|https?:|\*/);
  const resources = [...html.matchAll(/<(?:script|link|img|iframe|audio|video|source)\b[^>]*>/gi)]
    .filter(([tag]) => !/\brel="canonical"/i.test(tag));
  for (const [tag] of resources) {
    const target = tag.match(/\b(?:src|href)="([^"]+)"/i)?.[1];
    if (target) assert.doesNotMatch(target, /^(?:[a-z][a-z\d+.-]*:|\/\/)/i, 'Active resources must remain on this origin.');
  }
});

test('imported data has no executable HTML sink or outbound API in the browser code', async () => {
  const sources = await Promise.all(['app.mjs', 'data.mjs'].map(file =>
    readFile(new URL(`../site/compensation/${file}`, import.meta.url), 'utf8')));
  for (const source of sources) {
    assert.doesNotMatch(source, /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon|importScripts)\s*\(/);
    assert.doesNotMatch(source, /\b(?:innerHTML|outerHTML)\s*=|\binsertAdjacentHTML\s*\(|\bdocument\.write(?:ln)?\s*\(/);
    assert.doesNotMatch(source, /\beval\s*\(|\bnew\s+Function\s*\(/);
  }
});
