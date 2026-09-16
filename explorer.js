(() => {
  'use strict';
  const G = window.Involute;
  const $ = id => document.getElementById(id);
  const radiusInput = $('radius'), radiusRange = $('radius-range');
  const unwindInput = $('unwind'), intervalInput = $('delta');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const ns = 'http://www.w3.org/2000/svg';
  const state = { radius: 45, unwind: 180, interval: 15 };
  let rows = [], frame = null, lastTime = null;

  // A constant fit for the unit-radius curve keeps every sample in view.
  const curve = Array.from({ length: 501 }, (_, i) => G.point(1, G.maxUnwind * i / 500));
  const xs = curve.map(p => p.x).concat(-1, 1), ys = curve.map(p => p.y).concat(-1, 1);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const scale = Math.min(620 / (maxX - minX), 414 / (maxY - minY));
  const cx = 350 - (minX + maxX) * scale / 2, cy = 245 + (minY + maxY) * scale / 2;
  const sx = x => cx + x * scale, sy = y => cy - y * scale;
  function attr(element, values) {
    for (const [name, value] of Object.entries(values)) element.setAttribute(name, typeof value === 'number' ? value.toFixed(3) : value);
  }
  function svgElement(tag, attributes) {
    const element = document.createElementNS(ns, tag);
    attr(element, attributes);
    return element;
  }
  function path(points) { return points.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(3)},${sy(p.y).toFixed(3)}`).join(' '); }
  function setPoint(element, point) { attr(element, { cx: sx(point.x), cy: sy(point.y) }); }
  function line(element, start, end) { attr(element, { x1: sx(start.x), y1: sy(start.y), x2: sx(end.x), y2: sy(end.y) }); }
  const origin = { x: 0, y: 0 };
  $('axes').append(svgElement('line', { class: 'axis', x1: 0, y1: cy, x2: 700, y2: cy }), svgElement('line', { class: 'axis', x1: cx, y1: 0, x2: cx, y2: 490 }));
  attr($('base-circle'), { cx, cy, r: scale });
  attr($('full-path'), { d: path(curve) });
  setPoint($('centre-dot'), origin);
  attr($('origin-label'), { x: cx + 10, y: cy + 20 });

  function measurements() {
    const t = G.radians(state.unwind);
    return { polar: G.degrees(G.polarAngle(t)), distance: state.radius * Math.hypot(1, t), arc: state.radius * t };
  }
  function announce() {
    const m = measurements();
    $('measurement-status').textContent = `Unwound angle ${state.unwind} degrees. Centre distance ${m.distance.toFixed(2)}. Polar angle ${m.polar.toFixed(2)} degrees. String length ${m.arc.toFixed(2)}.`;
  }
  function renderPoint() {
    const t = G.radians(state.unwind), selected = G.point(1, t), tangent = { x: Math.cos(t), y: Math.sin(t) };
    const traced = Array.from({ length: 241 }, (_, i) => G.point(1, t * i / 240));
    attr($('involute-path'), { d: path(traced) });
    line($('string-line'), tangent, selected);
    line($('radial-line'), origin, selected);
    setPoint($('tangent-dot'), tangent);
    setPoint($('marker-dot'), selected);
    setPoint($('marker-halo'), selected);
    attr($('marker-label'), { x: sx(selected.x) + 13, y: sy(selected.y) - 13 });
    attr($('tangent-label'), { x: sx(tangent.x) + 16 * Math.cos(t) - 4, y: sy(tangent.y) - 16 * Math.sin(t) + 6 });
    $('tangent-label').hidden = state.unwind === 0;
    $('tangent-label').style.display = state.unwind === 0 ? 'none' : '';
    const m = measurements();
    $('unwind-value').textContent = `${state.unwind}°`;
    unwindInput.setAttribute('aria-valuetext', `${state.unwind} degrees unwound`);
    $('stat-distance').textContent = m.distance.toFixed(2);
    $('stat-polar').textContent = `${m.polar.toFixed(2)}°`;
    $('stat-arc').textContent = m.arc.toFixed(2);
    $('graph-description').textContent = `Circle radius ${state.radius}. Unwound angle ${state.unwind} degrees. Point P is ${m.distance.toFixed(2)} units from the centre, at polar angle ${m.polar.toFixed(2)} degrees. The tangent string has length ${m.arc.toFixed(2)} units.`;
  }
  function renderSamples() {
    rows = G.samples(state.radius, state.interval);
    $('delta-value').textContent = `${state.interval}°`;
    intervalInput.setAttribute('aria-valuetext', `${state.interval} degrees of polar angle`);
    $('table-note').textContent = `Distances from the centre for radius ${state.radius}, sampled every ${state.interval}° of polar angle.`;
    $('sample-count').textContent = `${rows.length} points`;
    const dots = document.createDocumentFragment(), table = document.createDocumentFragment();
    for (const row of rows) {
      dots.append(svgElement('circle', { class: 'interval-dot', cx: sx(row.x / state.radius), cy: sy(row.y / state.radius), r: rows.length > 90 ? 1.7 : 3 }));
      const tr = document.createElement('tr'), angle = document.createElement('td'), distance = document.createElement('td');
      angle.textContent = `${row.angle}°`;
      distance.textContent = row.distance.toFixed(2);
      tr.append(angle, distance);
      table.append(tr);
    }
    $('interval-group').replaceChildren(dots);
    $('results').replaceChildren(table);
    // Do not move the page or the table when the user changes a slider.
    $('export-status').textContent = '';
  }
  function updatePlayButton() {
    $('play').textContent = reducedMotion.matches ? 'Step forward 15° →' : frame === null ? '▷ Animate the string' : 'Ⅱ Pause animation';
  }
  function stop() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    lastTime = null;
    updatePlayButton();
  }
  let animatedAngle = state.unwind;
  function tick(now) {
    if (lastTime !== null) animatedAngle = Math.min(360, animatedAngle + Math.min(now - lastTime, 100) * .024);
    lastTime = now;
    const next = Math.round(animatedAngle);
    if (next !== state.unwind) {
      state.unwind = next;
      unwindInput.value = next;
      renderPoint();
    }
    if (animatedAngle >= 360) { stop(); announce(); }
    else frame = requestAnimationFrame(tick);
  }
  radiusInput.addEventListener('input', () => {
    const valid = radiusInput.validity.valid && radiusInput.value !== '';
    radiusInput.setAttribute('aria-invalid', String(!valid));
    $('radius-hint').textContent = valid ? '1–100. Distances use the same unit.' : 'Enter a whole number from 1 to 100.';
    $('download').disabled = !valid;
    if (!valid) return;
    state.radius = Number(radiusInput.value);
    radiusRange.value = state.radius;
    renderPoint(); renderSamples();
  });
  radiusInput.addEventListener('change', () => { if (radiusInput.validity.valid && radiusInput.value !== '') announce(); });
  radiusRange.addEventListener('input', () => {
    state.radius = Number(radiusRange.value);
    radiusInput.value = state.radius;
    radiusInput.removeAttribute('aria-invalid');
    $('radius-hint').textContent = '1–100. Distances use the same unit.';
    $('download').disabled = false;
    renderPoint(); renderSamples();
  });
  radiusRange.addEventListener('change', announce);
  unwindInput.addEventListener('input', () => {
    stop(); state.unwind = Number(unwindInput.value); renderPoint();
  });
  unwindInput.addEventListener('change', announce);
  intervalInput.addEventListener('input', () => { state.interval = Number(intervalInput.value); renderSamples(); });
  $('show-samples').addEventListener('change', event => { $('interval-group').style.display = event.target.checked ? '' : 'none'; });
  $('play').addEventListener('click', () => {
    if (reducedMotion.matches) {
      state.unwind = state.unwind >= 360 ? 0 : Math.min(360, state.unwind + 15);
      unwindInput.value = state.unwind; renderPoint(); announce(); return;
    }
    if (frame !== null) { stop(); announce(); return; }
    if (state.unwind >= 360) { state.unwind = 0; unwindInput.value = 0; renderPoint(); }
    animatedAngle = state.unwind;
    frame = requestAnimationFrame(tick);
    updatePlayButton();
  });
  $('reset').addEventListener('click', () => {
    stop(); Object.assign(state, { radius: 45, unwind: 180, interval: 15 });
    radiusInput.value = radiusRange.value = 45; unwindInput.value = 180; intervalInput.value = 15;
    radiusInput.removeAttribute('aria-invalid');
    $('radius-hint').textContent = '1–100. Distances use the same unit.';
    $('show-samples').checked = true; $('interval-group').style.display = '';
    $('download').disabled = false;
    renderPoint(); renderSamples(); announce();
  });
  $('download').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([G.toCSV(rows)], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `involute-r${state.radius}-interval${state.interval}.csv`;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    $('export-status').textContent = `CSV prepared with ${rows.length} points at radius ${state.radius}.`;
  });
  reducedMotion.addEventListener('change', stop);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('pagehide', stop);
  document.querySelectorAll('input, button').forEach(element => { element.disabled = false; });
  renderPoint(); renderSamples(); updatePlayButton();
})();
