(() => {
  'use strict';
  const model = window.OGFormModel;
  if (!model) return;
  const byId = id => document.getElementById(id);
  const root = byId('form-experience');
  if (!root) return;
  const views = [
    { canvas: byId('form-view-a'), yaw: 0, pitch: 0, label: 'Front' },
    { canvas: byId('form-view-b'), yaw: 90, pitch: 0, label: 'Side' },
    { canvas: byId('form-view-c'), yaw: 0, pitch: 90, label: 'Above' }
  ];
  const main = byId('form-main-canvas');
  const makerPreview = byId('form-maker-canvas');
  const yawInput = byId('form-yaw'), pitchInput = byId('form-pitch');
  const fields = ['bend', 'depth', 'width'];
  const state = { ...model.defaults, yaw: 25, pitch: 35, revealed: false };
  const status = byId('form-status');
  let source = model.points(state), pendingFrame = 0;
  const wrap = value => ((value % 360) + 360) % 360;
  const clampPitch = value => Math.max(-90, Math.min(90, value));

  function fit(canvas) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(rect.width * dpr), height = Math.round(rect.height * dpr);
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    const context = canvas.getContext('2d');
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { context, width: rect.width, height: rect.height };
  }
  function paint(canvas, yaw, pitch, dimensional) {
    const sized = fit(canvas);
    if (!sized) return;
    const { context: ctx, width, height } = sized;
    ctx.clearRect(0, 0, width, height);
    const scale = Math.min(width, height) / 7.6;
    const projected = model.project(source, yaw, pitch);
    const screen = point => ({ x: width / 2 + point.x * scale, y: height / 2 - point.y * scale });
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (!dimensional) {
      ctx.strokeStyle = '#123d64'; ctx.lineWidth = 2 * state.width * scale;
      ctx.beginPath();
      projected.forEach((point, index) => { const p = screen(point); index ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); });
      ctx.closePath(); ctx.stroke();
      return;
    }
    ctx.strokeStyle = '#123d6410'; ctx.lineWidth = 1;
    for (let i = 1; i < 8; i++) {
      const x = width * i / 8, y = height * i / 8;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }
    const segments = projected.slice(1).map((point, i) => ({ a: projected[i], b: point, z: (projected[i].z + point.z) / 2 }));
    segments.sort((a, b) => a.z - b.z);
    for (const segment of segments) {
      const a = screen(segment.a), b = screen(segment.b);
      const front = (segment.z + 3.5) / 7;
      const hue = 188 + 20 * (1 - front), light = 24 + front * 32;
      ctx.strokeStyle = '#123d64'; ctx.lineWidth = 2 * state.width * scale + 1.4;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.strokeStyle = `hsl(${hue} 69% ${light}%)`; ctx.lineWidth = 2 * state.width * scale;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
  }
  function render() {
    pendingFrame = 0;
    views.forEach(view => paint(view.canvas, view.yaw, view.pitch, false));
    if (state.revealed) {
      paint(main, state.yaw, state.pitch, true);
      paint(makerPreview, state.yaw, state.pitch, true);
    }
  }
  function schedule() { if (!pendingFrame) pendingFrame = requestAnimationFrame(render); }
  function syncView() {
    yawInput.value = String(Math.round(state.yaw)); pitchInput.value = String(Math.round(state.pitch));
    byId('form-yaw-value').value = `${Math.round(state.yaw)}°`;
    byId('form-pitch-value').value = `${Math.round(state.pitch)}°`;
    root.querySelectorAll('[data-form-view]').forEach(button => {
      const v = views[Number(button.dataset.formView)];
      button.setAttribute('aria-pressed', String(Math.abs(state.yaw - v.yaw) < 0.1 && Math.abs(state.pitch - v.pitch) < 0.1));
    });
    main.setAttribute('aria-label', `Three-dimensional loop. Viewing turn ${Math.round(state.yaw)} degrees, tilt ${Math.round(state.pitch)} degrees. Drag or use arrow keys to change the view. The form stays the same.`);
    makerPreview.setAttribute('aria-label', `Live preview of your form. Turn ${Math.round(state.yaw)} degrees, tilt ${Math.round(state.pitch)} degrees. Uses the same form and angle as the larger view.`);
    byId('form-maker-angle').textContent = `Turn ${Math.round(state.yaw)}° · Tilt ${Math.round(state.pitch)}°`;
    schedule();
  }
  function syncForm() {
    fields.forEach(key => {
      byId(`form-${key}`).value = String(state[key]);
      byId(`form-${key}-value`).value = state[key].toFixed(2);
    });
    source = model.points(state);
    schedule();
  }
  byId('form-reveal').addEventListener('click', () => {
    state.revealed = true;
    byId('form-discovery').hidden = false;
    byId('form-reveal').hidden = true;
    byId('form-first-hint').textContent = 'Three projections of the same form. Each view leaves some information out.';
    byId('form-angle-a').textContent = 'Front'; byId('form-angle-b').textContent = 'Side'; byId('form-angle-c').textContent = 'Above';
    views.forEach(view => view.canvas.setAttribute('aria-label', `${view.label} projection of the same loop. Editing the form updates all views.`));
    byId('form-discovery-title').focus();
    syncView();
  });
  yawInput.addEventListener('input', () => { state.yaw = Number(yawInput.value); syncView(); });
  pitchInput.addEventListener('input', () => { state.pitch = Number(pitchInput.value); syncView(); });
  [yawInput, pitchInput].forEach(input => input.addEventListener('change', () => { status.textContent = 'Your viewpoint changed. The underlying form stayed the same.'; }));
  root.querySelectorAll('[data-form-view]').forEach(button => button.addEventListener('click', () => {
    const view = views[Number(button.dataset.formView)];
    state.yaw = view.yaw; state.pitch = view.pitch; syncView();
    status.textContent = `${view.label} view selected. Compare it with view ${String.fromCharCode(65 + Number(button.dataset.formView))} above.`;
  }));
  fields.forEach(key => {
    const input = byId(`form-${key}`);
    input.addEventListener('input', () => { state[key] = Number(input.value); syncForm(); });
    input.addEventListener('change', () => { status.textContent = key === 'width' ? 'Your line thickness changed. The underlying form stayed the same.' : 'All views now use your new form. Some changes may remain hidden from a particular angle.'; });
  });
  let drag = null;
  main.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, yaw: state.yaw, pitch: state.pitch };
    main.setPointerCapture(event.pointerId); main.focus({ preventScroll: true });
  });
  main.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    state.yaw = wrap(Math.round(drag.yaw + (event.clientX - drag.x) * 0.6));
    state.pitch = clampPitch(Math.round(drag.pitch + (event.clientY - drag.y) * 0.6));
    syncView();
  });
  function endDrag() { if (drag) status.textContent = 'Your viewpoint changed. The underlying form stayed the same.'; drag = null; }
  main.addEventListener('pointerup', endDrag); main.addEventListener('pointercancel', endDrag); main.addEventListener('lostpointercapture', endDrag);
  main.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') { state.yaw = 25; state.pitch = 35; }
    else if (event.key === 'ArrowLeft') state.yaw = wrap(state.yaw - 5);
    else if (event.key === 'ArrowRight') state.yaw = wrap(state.yaw + 5);
    else state.pitch = clampPitch(state.pitch + (event.key === 'ArrowDown' ? 5 : -5));
    syncView(); status.textContent = 'Your viewpoint changed. The underlying form stayed the same.';
  });
  byId('form-reset').addEventListener('click', () => {
    Object.assign(state, model.defaults, { yaw: 25, pitch: 35 }); syncForm(); syncView();
    status.textContent = 'Original form and viewpoint restored. Your notes remain here.';
  });
  function svgPath(projected, cx, cy, scale) {
    return projected.map((p, i) => `${i ? 'L' : 'M'}${(cx + p.x * scale).toFixed(2)},${(cy - p.y * scale).toFixed(2)}`).join(' ') + 'Z';
  }
  byId('form-save').addEventListener('click', () => {
    const panels = [{ yaw: state.yaw, pitch: state.pitch, label: 'My view' }, ...views];
    let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="890" viewBox="0 0 1200 890"><rect width="1200" height="890" fill="#fff8e8"/><g fill="#123d64" font-family="Arial,sans-serif"><text x="60" y="58" font-size="27" font-weight="bold">One Form, Many Views · Creation OG</text><text x="60" y="90" font-size="16">One mathematical form. Four projections. Created through your choices.</text>';
    panels.forEach((panel, index) => {
      const x = 60 + (index % 2) * 560, y = 120 + Math.floor(index / 2) * 340;
      svg += `<rect x="${x}" y="${y}" width="520" height="305" rx="18" fill="${index % 2 ? '#eaf5f2' : '#fff4cd'}" stroke="#d0dbd1"/><text x="${x + 22}" y="${y + 31}" font-size="18" font-weight="bold">${panel.label}</text><path d="${svgPath(model.project(source, panel.yaw, panel.pitch), x + 260, y + 170, 31)}" fill="none" stroke="#123d64" stroke-width="${(state.width * 62).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    });
    svg += `<text x="60" y="825" font-size="15">Bend ${state.bend.toFixed(2)} · Depth ${state.depth.toFixed(2)} · Width ${state.width.toFixed(2)} · Turn ${Math.round(state.yaw)}° · Tilt ${Math.round(state.pitch)}°</text><text x="60" y="854" font-size="15">creationog.com/one-form-many-views/ · Original parametric drawing; no personal notes included.</text></g></svg>`;
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    const link = document.createElement('a'); link.href = url; link.download = 'creation-og-my-form-and-views.svg'; document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    status.textContent = 'Your four-view drawing is ready to download. Your private notes are not included.';
  });
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(schedule); views.forEach(view => observer.observe(view.canvas)); observer.observe(main); observer.observe(makerPreview);
  } else window.addEventListener('resize', schedule);
  window.addEventListener('pagehide', () => { cancelAnimationFrame(pendingFrame); pendingFrame = 0; drag = null; });
  window.addEventListener('pageshow', schedule);
  syncForm(); syncView();
})();
