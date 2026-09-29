/** Browser-only data boundary. No personal data or persistence belongs in this module. */
export const STORAGE_KEY = 'compensation-explorer:data:v1';
export const MAX_BYTES = 1e6;

const MAX_ENTRIES = 100;
const MAX_AMOUNT = 1e10;
const KINDS = new Set(['baseline', 'offer', 'revision']);

function invalid(path, message) {
  throw new Error(`${path}: ${message}`);
}

function record(value, path) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    invalid(path, 'must be an object.');
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    invalid(path, 'must be a plain object.');
  }
  return value;
}

function text(value, path, maxLength, { optional = false } = {}) {
  if (value === undefined && optional) return '';
  if (typeof value !== 'string') invalid(path, 'must be text.');
  const normalized = value.trim();
  if (!optional && normalized.length === 0) invalid(path, 'must not be empty.');
  if (normalized.length > maxLength) invalid(path, `must be ${maxLength} characters or fewer.`);
  return normalized;
}

function amount(value, path, { nullable = false, positive = false } = {}) {
  if (nullable && (value === null || value === undefined)) return null;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    invalid(path, 'must be a finite number, without currency symbols or quotation marks.');
  }
  if (positive ? value <= 0 : value < 0) {
    invalid(path, positive ? 'must be greater than zero.' : 'must not be negative.');
  }
  if (value > MAX_AMOUNT) invalid(path, 'must not exceed 10,000,000,000 INR.');
  return Object.is(value, -0) ? 0 : value;
}

function date(value, path, { nullable = false, monthOnly = false } = {}) {
  if (nullable && (value === null || value === undefined)) return null;
  const pattern = monthOnly ? /^(\d{4})-(\d{2})$/ : /^(\d{4})-(\d{2})-(\d{2})$/;
  const match = typeof value === 'string' ? pattern.exec(value) : null;
  if (!match) invalid(path, `must be a valid ${monthOnly ? 'YYYY-MM' : 'YYYY-MM-DD'} date.`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (year === 0 || month < 1 || month > 12) invalid(path, 'contains an invalid year or month.');
  if (!monthOnly) {
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const day = Number(match[3]);
    if (day < 1 || day > days[month - 1]) invalid(path, 'contains an invalid calendar day.');
  }
  return value;
}

function list(value, path, normalize, { required = false } = {}) {
  if (value === undefined && !required) return [];
  if (!Array.isArray(value)) invalid(path, 'must be an array.');
  if (required && value.length === 0) invalid(path, 'must contain at least one milestone.');
  if (value.length > MAX_ENTRIES) invalid(path, `must contain no more than ${MAX_ENTRIES} entries.`);
  // Array.from also visits sparse entries, so holes cannot bypass validation.
  return Array.from(value, (entry, index) => normalize(entry, `${path}[${index}]`));
}

function milestone(raw, path) {
  const item = record(raw, path);
  const annualCTC = amount(item.annualCTC, `${path}.annualCTC`, { positive: true });
  const fixed = amount(item.fixed, `${path}.fixed`, { nullable: true });
  const variable = amount(item.variable, `${path}.variable`, { nullable: true });
  if (!KINDS.has(item.kind)) invalid(`${path}.kind`, 'must be baseline, offer, or revision.');
  if (fixed !== null && fixed > annualCTC + 1) {
    invalid(`${path}.fixed`, 'must not exceed annualCTC.');
  }
  if (variable !== null && variable > annualCTC + 1) {
    invalid(`${path}.variable`, 'must not exceed annualCTC.');
  }
  if (fixed !== null && variable !== null && Math.abs(fixed + variable - annualCTC) > 1) {
    invalid(path, 'fixed plus variable must equal annualCTC within 1 INR; use null for an unknown component.');
  }
  return {
    id: text(item.id, `${path}.id`, 80),
    company: text(item.company, `${path}.company`, 80),
    effectiveDate: date(item.effectiveDate, `${path}.effectiveDate`, { nullable: true }),
    periodLabel: text(item.periodLabel, `${path}.periodLabel`, 80),
    kind: item.kind,
    annualCTC,
    fixed,
    variable,
    note: text(item.note, `${path}.note`, 1200, { optional: true }),
    sourceLabel: text(item.sourceLabel, `${path}.sourceLabel`, 160, { optional: true }),
  };
}

function payroll(raw, path) {
  const item = record(raw, path);
  const gross = amount(item.gross, `${path}.gross`);
  const net = amount(item.net, `${path}.net`);
  if (net > gross) invalid(`${path}.net`, 'must not exceed gross pay.');
  return {
    company: text(item.company, `${path}.company`, 80),
    period: date(item.period, `${path}.period`, { monthOnly: true }),
    gross,
    net,
    note: text(item.note, `${path}.note`, 1200, { optional: true }),
  };
}

function equity(raw, path) {
  const item = record(raw, path);
  return {
    company: text(item.company, `${path}.company`, 80),
    grantValue: amount(item.grantValue, `${path}.grantValue`, { nullable: true }),
    grantDate: date(item.grantDate, `${path}.grantDate`, { nullable: true }),
    vesting: text(item.vesting, `${path}.vesting`, 300, { optional: true }),
    note: text(item.note, `${path}.note`, 1200, { optional: true }),
  };
}

function consulting(raw, path) {
  const item = record(raw, path);
  return {
    company: text(item.company, `${path}.company`, 80),
    monthlyFee: amount(item.monthlyFee, `${path}.monthlyFee`),
    periodLabel: text(item.periodLabel, `${path}.periodLabel`, 80),
    invoiceAmount: amount(item.invoiceAmount, `${path}.invoiceAmount`, { nullable: true }),
    invoicePeriod: text(item.invoicePeriod, `${path}.invoicePeriod`, 80, { optional: true }),
    note: text(item.note, `${path}.note`, 1200, { optional: true }),
  };
}

/**
 * Return a fresh version-1 allowlisted object; never mutate or retain input objects.
 * Optional arrays default to []; omitted nullable fields remain unknown (null).
 * Text is plain data. Render it with textContent, never innerHTML.
 */
export function validateData(raw) {
  const input = record(raw, 'data');
  if (input.schemaVersion !== 1) invalid('schemaVersion', 'must be the number 1.');
  const milestones = list(input.milestones, 'milestones', milestone, { required: true });
  const ids = new Set();
  for (const item of milestones) {
    if (ids.has(item.id)) invalid('milestones', 'each milestone id must be unique.');
    ids.add(item.id);
  }
  return {
    schemaVersion: 1,
    title: text(input.title, 'title', 100),
    asOf: date(input.asOf, 'asOf'),
    milestones,
    payroll: list(input.payroll, 'payroll', payroll),
    equity: list(input.equity, 'equity', equity),
    consulting: list(input.consulting, 'consulting', consulting),
    unavailable: list(input.unavailable, 'unavailable', (item, path) => text(item, path, 1200)),
    notes: list(input.notes, 'notes', (item, path) => text(item, path, 1200)),
  };
}

/** Parse local JSON without leaking its contents into error messages. */
export function parseData(input) {
  if (typeof input !== 'string') invalid('file', 'must contain JSON text.');
  if (input.length > MAX_BYTES || new TextEncoder().encode(input).byteLength > MAX_BYTES) {
    invalid('file', 'must be 1 MB or smaller.');
  }
  let raw;
  try {
    raw = JSON.parse(input);
  } catch {
    invalid('file', 'is not valid JSON. Check commas, quotation marks, and brackets.');
  }
  return validateData(raw);
}
