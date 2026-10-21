(() => {
  'use strict';
  const root = document.getElementById('wave-experience');
  if (!root) return;
  const keys = ['f1', 'a1', 'f2', 'a2', 'phase', 'noise'];
  const inputs = Object.fromEntries(keys.map(key => [key, root.querySelector('#wave-' + key)]));
  const noteFrequency = index => 432 * 2 ** ((index - 24) / 12);
  const noteName = index => {
    const midi = 45 + index;
    return ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'][midi % 12] + (Math.floor(midi / 12) - 1);
  };
  // Pitch controls store semitone indices: A2 (0) through A5 (36).
  const defaults = { f1: 12, a1: 1, f2: 12, a2: 1, phase: 0, noise: 0 };
  const presets = {
    reinforce: { ...defaults },
    cancel: { ...defaults, phase: 180 },
    harmonic: { ...defaults, f2: 19 },
    noise: { ...defaults, phase: 90, noise: .55 }
  };
  const sampleRate = 48000, duration = .025, samples = Math.round(sampleRate * duration) + 1;
  const noiseValues = new Float64Array(samples);
  let seed = 731129;
  for (let i = 0; i < samples; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    noiseValues[i] = seed / 4294967296 * 2 - 1;
  }
  let state = { ...defaults }, source = null, context = null, audioPending = false, audioToken = 0, renderQueued = false;
  const plot = root.querySelector('#wave-plot'), detail = root.querySelector('#wave-detail');
  const play = root.querySelector('#wave-play'), audioStatus = root.querySelector('#wave-audio-status');
  const ns = 'http://www.w3.org/2000/svg';
  const svgElement = (name, attrs = {}, text) => {
    const node = document.createElementNS(ns, name);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
    if (text !== undefined) node.textContent = text;
    return node;
  };
  function signal(time, settings = state) {
    const a = settings.a1 * Math.sin(2 * Math.PI * noteFrequency(settings.f1) * time);
    const b = settings.a2 * Math.sin(2 * Math.PI * noteFrequency(settings.f2) * time + settings.phase * Math.PI / 180);
    return [a, b, a + b];
  }
  function description() {
    if (state.a1 === 0 && state.a2 === 0) return state.noise ? 'Both inputs are silent; only the added noise remains.' : 'Both inputs are silent.';
    if (state.a1 === 0 || state.a2 === 0) return state.noise ? 'One wave remains, with noise added to the signal.' : 'One wave remains; the other has zero amplitude.';
    if (state.f1 === state.f2 && state.a1 === state.a2 && state.phase === 180) return state.noise ? 'The two waves cancel; only the added noise remains.' : 'Equal, opposite waves cancel. Silence is the expected result.';
    if (state.f1 === state.f2 && (state.phase === 0 || state.phase === 360)) return state.noise ? 'Matching waves reinforce each other; noise changes the signal.' : 'Matching waves reinforce each other.';
    if (state.noise) return 'Noise obscures the known combined signal.';
    if (state.f1 !== state.f2) return 'Different pitches create a changing combined shape.';
    return 'Changing phase changes how much the waves reinforce.';
  }
  function stopAudio(message = 'Playback stopped.') {
    audioToken++;
    audioPending = false;
    if (source) {
      const oldSource = source;
      source = null;
      oldSource.onended = null;
      try { oldSource.stop(); } catch (_) { /* An ended source is already silent. */ }
      oldSource.disconnect();
    }
    play.textContent = 'Listen for 3 seconds';
    play.setAttribute('aria-pressed', 'false');
    audioStatus.textContent = message;
  }
  function sync() {
    for (const key of keys) {
      inputs[key].value = String(state[key]);
      const value = key[0] === 'f'
        ? noteName(state[key]) + ' · ' + Number(noteFrequency(state[key]).toFixed(2)) + ' Hz'
        : key === 'phase' ? state[key] + '°' : state[key].toFixed(2);
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
      if (key[0] === 'f') state[key] = Math.round(state[key]);
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
    svg.append(svgElement('title', { id: 'wave-chart-title' }, 'Two waves, their combination and added noise'));
    svg.append(svgElement('desc', { id: 'wave-chart-desc' }, description() + ' The three panels share one relative amplitude scale and show 25 milliseconds.'));
    svg.append(svgElement('text', { x: left, y: 14 }, 'Amplitude · relative units'));
    const defs = svgElement('defs');
    svg.append(defs);
    ['Inputs A and B', 'Combined signal A + B', 'Signal with added noise'].forEach((label, row) => {
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
      arrays[0].push(a); arrays[1].push(b); arrays[2].push(sum); arrays[3].push(sum + state.noise * noiseValues[i]);
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
  play.addEventListener('click', async () => {
    if (source || audioPending) { stopAudio(); return; }
    const token = ++audioToken;
    audioPending = true;
    play.textContent = 'Stop audio';
    play.setAttribute('aria-pressed', 'true');
    audioStatus.textContent = 'Starting audio…';
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) throw new Error('Web Audio unavailable');
      context = context || new Audio();
      await context.resume();
      if (token !== audioToken || document.hidden) return;
      const snapshot = { ...state };
      const buffer = context.createBuffer(1, sampleRate * 3, sampleRate), data = buffer.getChannelData(0);
      let audioSeed = 731129;
      for (let i = 0; i < data.length; i++) {
        audioSeed = (Math.imul(audioSeed, 1664525) + 1013904223) >>> 0;
        const noise = (audioSeed / 4294967296 * 2 - 1) * snapshot.noise;
        const envelope = Math.min(1, i / (sampleRate * .015), (data.length - 1 - i) / (sampleRate * .015));
        data[i] = .08 * (signal(i / sampleRate, snapshot)[2] + noise) * envelope;
      }
      if (token !== audioToken || document.hidden) return;
      const currentSource = context.createBufferSource();
      currentSource.buffer = buffer;
      currentSource.connect(context.destination);
      currentSource.onended = () => {
        currentSource.disconnect();
        if (token !== audioToken || source !== currentSource) return;
        source = null;
        play.textContent = 'Listen for 3 seconds';
        play.setAttribute('aria-pressed', 'false');
        audioStatus.textContent = 'Playback complete.';
      };
      source = currentSource;
      audioPending = false;
      currentSource.start();
      audioStatus.textContent = snapshot.f1 === snapshot.f2 && snapshot.a1 === snapshot.a2 && snapshot.phase === 180 && !snapshot.noise
        ? 'Playing cancellation. Silence is expected.' : 'Playing the combined signal and any added noise.';
    } catch (_) {
      if (token === audioToken) stopAudio('Audio is unavailable here. You can still explore the waves.');
    } finally {
      if (token === audioToken) audioPending = false;
    }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopAudio(); });
  window.addEventListener('pagehide', () => stopAudio());
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(requestDraw).observe(plot);
  else window.addEventListener('resize', requestDraw);
  sync();
})();
