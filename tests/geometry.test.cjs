'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const geometry = require('../geometry.js');

function close(actual, expected, tolerance = 1e-9) {
  assert.ok(Number.isFinite(actual), `Expected a finite value, received ${actual}`);
  assert.ok(Math.abs(actual - expected) <= tolerance,
    `Expected ${actual} to be within ${tolerance} of ${expected}`);
}

test('known unwound angles give the expected point and measurements', () => {
  const cases = [
    { angle: 0, x: 45, y: 0, polar: 0, distance: 45, string: 0 },
    { angle: 90, x: 70.68583470577035, y: 45, polar: 32.48163659052975, distance: 83.79431501033639, string: 70.68583470577035 },
    { angle: 180, x: -45, y: 141.3716694115407, polar: 107.65678715141286, distance: 148.3608739264027, string: 141.3716694115407 },
    { angle: 359, x: 40.072301703425325, y: -282.7003553893053, polar: 278.0678327106978, distance: 285.5263215555614, string: 281.9579406596839 },
  ];
  for (const expected of cases) {
    const t = geometry.radians(expected.angle);
    const point = geometry.point(45, t);
    close(point.x, expected.x);
    close(point.y, expected.y);
    close(geometry.degrees(geometry.polarAngle(t)), expected.polar);
    close(Math.hypot(point.x, point.y), expected.distance);
    close(Math.hypot(point.x - 45 * Math.cos(t), point.y - 45 * Math.sin(t)), expected.string);
  }
});

test('a full polar revolution reaches the positive x axis at the correct endpoint', () => {
  close(geometry.maxUnwind, 7.725251836937707, 1e-12);
  close(geometry.degrees(geometry.maxUnwind), 442.62432593221706);
  close(geometry.polarAngle(geometry.maxUnwind), 2 * Math.PI, 1e-12);
  const point = geometry.point(45, geometry.maxUnwind);
  close(point.x, 350.5367595371726);
  close(point.y, 0);
});

test('the straight string is tangent to the base circle and has length r times t', () => {
  for (const radius of [1, 45, 100]) {
    for (const t of [0, 0.1, Math.PI / 2, Math.PI, 6, geometry.maxUnwind]) {
      const point = geometry.point(radius, t);
      const tangent = { x: radius * Math.cos(t), y: radius * Math.sin(t) };
      const string = { x: point.x - tangent.x, y: point.y - tangent.y };
      close(tangent.x * string.x + tangent.y * string.y, 0, 1e-8);
      close(Math.hypot(string.x, string.y), radius * t);
      close(Math.hypot(point.x, point.y), Math.hypot(radius, radius * t));
    }
  }
});

test('exact polar samples match independently calculated reference distances', () => {
  const rows = geometry.samples(45, 1);
  const references = new Map([
    [0, 45], [15, 66.57926238], [30, 81.47030572], [45, 95.17779638],
    [90, 133.72622418], [180, 207.15024819], [270, 279.10778785],
    [345, 338.65400126], [359, 349.74479355],
  ]);
  for (const [angle, expected] of references) close(rows[angle].distance, expected, 1e-8);
  assert.equal(rows[0].t, 0);
  assert.equal(rows[0].distance, 45);
});

test('every sample lies on its polar ray and on the involute, including the final degree', () => {
  for (const row of geometry.samples(45, 1)) {
    const phi = row.angle * Math.PI / 180;
    close(row.x, row.distance * Math.cos(phi));
    close(row.y, row.distance * Math.sin(phi));
    // Recover t from the right triangle formed by circle radius and unwound string.
    const recoveredT = Math.sqrt(Math.max(0, (row.distance / 45) ** 2 - 1));
    close(row.t, recoveredT);
    close(recoveredT - Math.atan(recoveredT), phi, 1e-12);
    close(row.x, 45 * (Math.cos(recoveredT) + recoveredT * Math.sin(recoveredT)));
    close(row.y, 45 * (Math.sin(recoveredT) - recoveredT * Math.cos(recoveredT)));
  }
});

test('doubling radius doubles lengths and coordinates without changing either angle', () => {
  const small = geometry.samples(20, 7);
  const large = geometry.samples(40, 7);
  small.forEach((row, index) => {
    assert.equal(large[index].angle, row.angle);
    close(large[index].t, row.t);
    for (const value of ['distance', 'x', 'y']) close(large[index][value], 2 * row[value]);
  });
});

test('sample intervals include zero and stop before 360 without duplicating the start ray', () => {
  for (const [interval, count, last] of [[1, 360, 359], [7, 52, 357], [15, 24, 345], [89, 5, 356], [90, 4, 270]]) {
    const rows = geometry.samples(45, interval);
    assert.equal(rows.length, count);
    assert.equal(rows[0].angle, 0);
    assert.equal(rows.at(-1).angle, last);
    assert.equal(new Set(rows.map(row => row.angle)).size, count);
    for (let i = 1; i < rows.length; i++) {
      assert.equal(rows[i].angle - rows[i - 1].angle, interval);
      assert.ok(rows[i].distance > rows[i - 1].distance);
    }
  }
});

test('polar inversion remains finite and accurate near zero and across several turns', () => {
  assert.equal(geometry.unwindForPolar(0), 0);
  let previous = 0;
  for (const phi of [1e-12, 1e-8, 0.001, 0.1, 1, Math.PI, 2 * Math.PI, 4 * Math.PI]) {
    const t = geometry.unwindForPolar(phi);
    assert.ok(t > previous);
    assert.ok(t >= phi && t <= phi + Math.PI / 2);
    close(t - Math.atan(t), phi, 2e-14);
    previous = t;
  }
});

test('invalid sampling and polar inputs fail explicitly instead of producing misleading results', () => {
  for (const radius of [0, -1, NaN, Infinity, -Infinity, '45', null, undefined]) {
    assert.throws(() => geometry.samples(radius, 15), RangeError);
  }
  for (const interval of [0, -1, 91, 0.5, 15.5, NaN, Infinity, '15', null, undefined]) {
    assert.throws(() => geometry.samples(45, interval), RangeError);
  }
  for (const phi of [-1, NaN, Infinity, -Infinity, '1', null, undefined]) {
    assert.throws(() => geometry.unwindForPolar(phi), RangeError);
  }
});

test('CSV exports labeled exact sample distances with stable decimals and spreadsheet line endings', () => {
  const rows = geometry.samples(45, 90);
  const snapshot = structuredClone(rows);
  assert.equal(geometry.toCSV(rows),
    'Polar angle (degrees),Centre distance\r\n' +
    '0,45.000000\r\n90,133.726224\r\n180,207.150248\r\n270,279.107788\r\n');
  assert.deepEqual(rows, snapshot);
});
