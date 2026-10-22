(() => {
  'use strict';
  const root = document.getElementById('wave-experience');
  if (!root) return;
  const keys = ['f1', 'a1', 'f2', 'a2', 'phase', 'interference', 'fluctuation'];
  const inputs = Object.fromEntries(keys.map(key => [key, root.querySelector('#wave-' + key)]));
  const noteFrequency = index => 432 * 2 ** ((index - 24) / 12);
  const noteName = index => {
    const midi = 45 + index;
    return ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'][midi % 12] + (Math.floor(midi / 12) - 1);
  };
  // Pitch controls store semitone indices: A2 (0) through A5 (36).
  const defaults = { f1: 12, a1: 1, f2: 12, a2: 1, phase: 0, interference: 0, fluctuation: 0 };
  const presets = {
    reinforce: { ...defaults },
    cancel: { ...defaults, phase: 180 },
    harmonic: { ...defaults, f2: 19 },
    interference: { ...defaults, interference: .65 },
    shifting: { ...defaults, fluctuation: 1 }
  };
  const sampleRate = 48000, duration = .025, samples = Math.round(sampleRate * duration) + 1;
  const interferenceValues = new Float64Array(samples);
  let seed = 731129;
  for (let i = 0; i < samples; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    interferenceValues[i] = seed / 4294967296 * 2 - 1;
  }
  let state = { ...defaults }, source = null, audioPending = false, audioToken = 0, renderQueued = false;
  const plot = root.querySelector('#wave-plot'), detail = root.querySelector('#wave-detail');
  const play = root.querySelector('#wave-play'), audioStatus = root.querySelector('#wave-audio-status');
  const ns = 'http://www.w3.org/2000/svg';
  const svgElement = (name, attrs = {}, text) => {
    const node = document.createElementNS(ns, name);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
    if (text !== undefined) node.textContent = text;
    return node;
  };
  // Repeatable, smoothly interpolated phase targets every 4 ms. The plot and
  // audio use the same function; this changes phase stability, not the tuning reference.
  function varyingPhase(time) {
    const position = time * 250, index = Math.floor(position), fraction = position - index;
    const target = n => {
      if (n === 0) return 0;
      let hash = Math.imul(n ^ 731129, 0x45d9f3b);
      hash = Math.imul(hash ^ (hash >>> 16), 0x45d9f3b);
      return (((hash ^ (hash >>> 16)) >>> 0) / 4294967296 * 2 - 1) * Math.PI;
    };
    const smooth = fraction * fraction * (3 - 2 * fraction);
    return target(index) * (1 - smooth) + target(index + 1) * smooth;
  }
  function signal(time, settings = state) {
    const a = settings.a1 * Math.sin(2 * Math.PI * noteFrequency(settings.f1) * time);
    const b = settings.a2 * Math.sin(2 * Math.PI * noteFrequency(settings.f2) * time + settings.phase * Math.PI / 180 + settings.fluctuation * varyingPhase(time));
    return [a, b, a + b];
  }
  function description() {
    if (state.a1 === 0 && state.a2 === 0) return state.interference ? 'Both inputs are silent; only the added interference remains.' : 'Both inputs are silent.';
    if (state.a1 === 0 || state.a2 === 0) return state.interference ? 'One wave remains, with interference added to the signal.' : 'One wave remains; the other has zero amplitude.';
    if (state.fluctuation) return 'B’s phase fluctuates over time, modeling reduced coherence. Compare with Reinforce.' + (state.interference ? ' Random interference is also added.' : '');
    if (state.f1 === state.f2 && state.a1 === state.a2 && state.phase === 180) return state.interference ? 'The two waves cancel; only the added interference remains.' : 'Equal, opposite waves cancel. Their stable phase relationship is coherent; silence is expected.';
    if (state.f1 === state.f2 && (state.phase === 0 || state.phase === 360)) return state.interference ? 'The coherent inputs stay unchanged; added random interference obscures their combined signal.' : 'Matching waves reinforce each other. Their stable phase relationship is coherent.';
    if (state.interference) return 'Interference obscures the known combined signal.';
    if (state.f1 !== state.f2) return 'Different pitches create a changing combined shape.';
    return 'Changing phase changes how much the waves reinforce.';
  }
  function stopAudio(message = 'Playback stopped.') {
    audioToken++;
    audioPending = false;
    if (source) {
      const oldSource = source;
      source = null;
      clearTimeout(oldSource.timer);
      const element = oldSource.element;
      element.onplaying = element.onended = element.onerror = null;
      element.pause();
      element.removeAttribute('src');
      element.load();
      URL.revokeObjectURL(oldSource.url);
    }
    play.textContent = 'Listen for 3 seconds';
    play.setAttribute('aria-pressed', 'false');
    audioStatus.textContent = message;
  }
  function sync() {
    for (const key of keys) {
      inputs[key].value = String(state[key]);
      const value = (key === 'f1' || key === 'f2')
        ? noteName(state[key]) + ' · ' + Number(noteFrequency(state[key]).toFixed(2)) + ' Hz'
        : key === 'phase' ? state[key] + '°' : key === 'fluctuation' ? Math.round(state[key] * 100) + '%' : state[key].toFixed(2);
      root.querySelector('#wave-' + key + '-value').textContent = value;
      inputs[key].setAttribute('aria-valuetext', value);
    }
    root.querySelectorAll('[data-example]').forEach(button => {
      button.setAttribute('aria-pressed', String(keys.every(key => state[key] === presets[button.dataset.example][key])));
    });
    detail.textContent = description();
    requestDraw();
  }
  function change(next) {
    const wasPlaying = source || audioPending;
    stopAudio(wasPlaying ? 'Settings changed. Listen again to hear them.' : 'Sound starts when you choose. Begin at a low volume.');
    for (const key of keys) {
      const value = Number(next[key]);
      state[key] = Number.isFinite(value) ? Math.min(Number(inputs[key].max), Math.max(Number(inputs[key].min), value)) : defaults[key];
      if ((key === 'f1' || key === 'f2')) state[key] = Math.round(state[key]);
    }
    sync();
  }
  function requestDraw() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => { renderQueued = false; draw(); });
  }
  function draw() {
    const width = Math.max(220, plot.getBoundingClientRect().width), left = 40, right = 10;
    const top = 43, lane = 126, frameHeight = 79, height = 419, frameWidth = width - left - right;
    // Fixed shared scale keeps changes in amplitude comparable across presets.
    const amplitudeBound = 2.75;
    const x = time => left + time / duration * frameWidth;
    const y = (value, row) => top + row * lane + frameHeight / 2 - value / amplitudeBound * (frameHeight / 2 - 4);
    const svg = svgElement('svg', { class: 'wave-chart', viewBox: `0 0 ${width} ${height}`, role: 'img', 'aria-labelledby': 'wave-chart-title wave-chart-desc' });
    svg.append(svgElement('title', { id: 'wave-chart-title' }, 'Two waves, their combination and added interference'));
    svg.append(svgElement('desc', { id: 'wave-chart-desc' }, description() + ' The three panels share one relative amplitude scale and show 25 milliseconds.'));
    svg.append(svgElement('text', { x: left, y: 14 }, 'Amplitude · relative units'));
    const defs = svgElement('defs');
    svg.append(defs);
    ['Inputs A and B', 'Combined signal A + B', 'Signal + interference'].forEach((label, row) => {
      const panelTop = top + row * lane;
      svg.append(svgElement('text', { x: left, y: panelTop - 8, class: 'wave-panel-title' }, label));
      const clip = svgElement('clipPath', { id: 'wave-clip-' + row });
      clip.append(svgElement('rect', { x: left, y: panelTop, width: frameWidth, height: frameHeight }));
      defs.append(clip);
      svg.append(svgElement('rect', { x: left, y: panelTop, width: frameWidth, height: frameHeight, fill: 'none', stroke: '#d6ddd6' }));
      for (const value of [-2, 0, 2]) {
        const yy = y(value, row);
        svg.append(svgElement('line', { x1: left, y1: yy, x2: width - right, y2: yy, stroke: '#d6ddd6', 'stroke-width': 1 }));
        svg.append(svgElement('text', { x: left - 9, y: yy + 4, 'text-anchor': 'end' }, value));
      }
      const ticks = width < 430 ? [0, 10, 20, 25] : [0, 5, 10, 15, 20, 25];
      ticks.forEach(ms => {
        const xx = x(ms / 1000);
        svg.append(svgElement('line', { x1: xx, y1: panelTop + frameHeight, x2: xx, y2: panelTop + frameHeight + 4, stroke: '#a5b4b8' }));
        if (row === 2) svg.append(svgElement('text', { x: xx, y: panelTop + frameHeight + 19, 'text-anchor': ms === 0 ? 'start' : ms === 25 ? 'end' : 'middle' }, ms));
      });
    });
    const arrays = [[], [], [], []];
    for (let i = 0; i < samples; i++) {
      const [a, b, sum] = signal(i / sampleRate);
      arrays[0].push(a); arrays[1].push(b); arrays[2].push(sum); arrays[3].push(sum + state.interference * interferenceValues[i]);
    }
    const path = (values, row, color, dash = '', weight = 1.8) => {
      let d = '';
      for (let i = 0; i < samples; i++) d += (i ? 'L' : 'M') + x(i / sampleRate).toFixed(2) + ',' + y(values[i], row).toFixed(2);
      svg.append(svgElement('path', { d, stroke: color, 'stroke-width': weight, 'stroke-dasharray': dash, 'clip-path': `url(#wave-clip-${row})` }));
    };
    path(arrays[0], 0, '#075e9e'); path(arrays[1], 0, '#b24810', '5 3');
    path(arrays[2], 1, '#08776d', '', 2);
    path(arrays[3], 2, '#7650a5', '', 1.2); path(arrays[2], 2, '#08776d', '5 3');
    svg.append(svgElement('text', { x: left + frameWidth / 2, y: height - 5, 'text-anchor': 'middle' }, 'Time (milliseconds)'));
    plot.replaceChildren(svg);
    root.dataset.sumPeak = String(Math.max(...arrays[2].map(Math.abs)));
    root.dataset.measurementDifference = String(Math.max(...arrays[3].map((value, index) => Math.abs(value - arrays[2][index]))));
  }
  for (const key of keys) inputs[key].addEventListener('input', () => change({ ...state, [key]: Number(inputs[key].value) }));
  root.querySelectorAll('[data-example]').forEach(button => button.addEventListener('click', () => change(presets[button.dataset.example])));
  play.setAttribute('aria-pressed', 'false');
  function audioFile(settings) {
    // PCM WAV keeps the generated sample on ordinary media playback. On iPhone,
    // a bare Web Audio context can follow the ringer/silent channel instead.
    const count = sampleRate * 3, bytes = new ArrayBuffer(44 + count * 2);
    const view = new DataView(bytes);
    const writeText = (offset, text) => {
      for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
    };
    writeText(0, 'RIFF'); view.setUint32(4, bytes.byteLength - 8, true);
    writeText(8, 'WAVE'); writeText(12, 'fmt '); view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true); view.setUint16(34, 16, true);
    writeText(36, 'data'); view.setUint32(40, count * 2, true);
    let audioSeed = 731129;
    for (let i = 0; i < count; i++) {
      audioSeed = (Math.imul(audioSeed, 1664525) + 1013904223) >>> 0;
      const interference = (audioSeed / 4294967296 * 2 - 1) * settings.interference;
      const envelope = Math.min(1, i / (sampleRate * .015), (count - 1 - i) / (sampleRate * .015));
      const sample = .08 * (signal(i / sampleRate, settings)[2] + interference) * envelope;
      view.setInt16(44 + i * 2, Math.round(Math.max(-1, Math.min(1, sample)) * 32767), true);
    }
    return new Blob([bytes], { type: 'audio/wav' });
  }
  play.addEventListener('click', () => {
    if (source || audioPending) { stopAudio(); return; }
    if (document.hidden) return;
    const token = ++audioToken;
    audioPending = true;
    play.textContent = 'Stop audio';
    play.setAttribute('aria-pressed', 'true');
    audioStatus.textContent = 'Starting audio…';
    try {
      const snapshot = { ...state };
      const element = new window.Audio();
      element.preload = 'auto';
      element.setAttribute('playsinline', '');
      const currentSource = { element, url: URL.createObjectURL(audioFile(snapshot)), timer: null };
      source = currentSource;
      const isCurrent = () => token === audioToken && source === currentSource;
      const fail = () => {
        if (isCurrent()) stopAudio('Audio could not start. Tap Listen to retry, and check your media volume and sound output.');
      };
      element.onplaying = () => {
        if (!isCurrent()) return;
        clearTimeout(currentSource.timer);
        audioPending = false;
        audioStatus.textContent = snapshot.f1 === snapshot.f2 && snapshot.a1 === snapshot.a2 && snapshot.phase === 180 && !snapshot.interference && !snapshot.fluctuation
          ? 'Playing cancellation. Silence is expected.' : 'Playing the combined signal and any added interference.';
      };
      element.onended = () => { if (isCurrent()) stopAudio('Playback complete.'); };
      element.onerror = fail;
      element.src = currentSource.url;
      currentSource.timer = setTimeout(() => { if (audioPending) fail(); }, 8000);
      // Call play inside the tap/click handler, before any await or media event.
      // Some iPhone versions require this direct user-gesture connection.
      const playback = element.play();
      if (playback && typeof playback.catch === 'function') playback.catch(fail);
    } catch (_) {
      if (token === audioToken) stopAudio('Audio could not start. Tap Listen to retry, and check your media volume and sound output.');
    }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopAudio(); });
  window.addEventListener('pagehide', () => stopAudio());
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(requestDraw).observe(plot);
  else window.addEventListener('resize', requestDraw);
  sync();
})();
