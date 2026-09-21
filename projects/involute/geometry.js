/* Shared geometry for the diagram, measurements and distance table. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Involute = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const radians = degrees => degrees * Math.PI / 180;
  const degrees = angle => angle * 180 / Math.PI;
  const polarAngle = t => t - Math.atan(t);
  function unwindForPolar(phi) {
    if (!Number.isFinite(phi) || phi < 0) throw new RangeError('Polar angle must be non-negative and finite.');
    if (phi === 0) return 0;
    // phi <= t <= phi + pi/2. Bisection also handles the flat derivative at zero.
    let lo = phi, hi = phi + Math.PI / 2;
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      if (polarAngle(mid) < phi) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  }
  function point(radius, t) {
    return { x: radius * (Math.cos(t) + t * Math.sin(t)), y: radius * (Math.sin(t) - t * Math.cos(t)) };
  }
  function samples(radius, interval) {
    if (!Number.isFinite(radius) || radius <= 0 || !Number.isInteger(interval) || interval < 1 || interval > 90) {
      throw new RangeError('Use a positive radius and a whole-degree interval from 1 to 90.');
    }
    const rows = [];
    for (let angle = 0; angle < 360; angle += interval) {
      const t = unwindForPolar(radians(angle));
      rows.push({ angle, t, distance: radius * Math.hypot(1, t), ...point(radius, t) });
    }
    return rows;
  }
  function toCSV(rows) {
    return 'Polar angle (degrees),Centre distance\r\n' + rows.map(row => `${row.angle},${row.distance.toFixed(6)}`).join('\r\n') + '\r\n';
  }
  return { radians, degrees, polarAngle, unwindForPolar, point, samples, toCSV, maxUnwind: unwindForPolar(2 * Math.PI) };
});
