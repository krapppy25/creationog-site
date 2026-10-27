(() => {
  'use strict';
  const root = document.getElementById('cog-shape-sound'), model = window.COGVoiceModel;
  if (!root || !model) return;
  const $ = id => root.querySelector('#sound-' + id);
  const canvas = $('spectrum'), painter = canvas.getContext('2d');
  const play = $('play'), stopButton = $('stop'), micButton = $('mic-start'), micStop = $('mic-stop');
  const createPlay = $('create-play'), createStop = $('create-stop'), createStatus = $('create-status');
  const status = $('status'), caption = $('spectrum-note'), chartTitle = $('spectrum-title');
  const controls = { f1: $('f1'), f2: $('f2'), volume: $('volume') };
  let state = model.clean(model.presets.ah), chosen = 'ah';
  let generation = 0, session = null, finishTimer = 0, frame = 0, lastDraw = 0, mode = 'idle';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  const colors = { ink: '#123d64', teal: '#08776d', navy: '#075e9e', line: '#ccddd6', paper: '#f1f8f4', orange: '#b24810' };

  function setMode(next) {
    mode = next;
    play.disabled = createPlay.disabled = !AudioCtor || next === 'starting';
    stopButton.disabled = createStop.disabled = next === 'idle';
    micStop.disabled = next !== 'mic' && next !== 'mic-pending';
    micButton.disabled = next === 'mic-pending';
    play.textContent = next === 'synth' ? 'Restart · 9 seconds' : 'Listen · 9 seconds';
    createPlay.textContent = next === 'synth' ? 'Restart my sound · 9 seconds' : 'Listen to my sound · 9 seconds';
    createStatus.textContent = !AudioCtor ? 'Audio is unavailable in this browser. You can still shape and save the model.' : next === 'synth' ? 'Playing. Move either slider to change your sound.' : next === 'starting' ? 'Starting your sound…' : next === 'mic' || next === 'mic-pending' ? 'Microphone mode. Listening here switches to your model.' : 'Sound is off. Listen, then move either slider.';
    if (next === 'mic' || next === 'mic-pending') {
      chartTitle.textContent = 'Your microphone’s sound';
      caption.textContent = 'Live microphone spectrum. Rooms, microphones, and device processing affect this graph. Nothing is recorded or uploaded.';
      canvas.setAttribute('aria-label', 'Live frequency spectrum of sound entering the microphone.');
    } else if (next === 'synth') {
      chartTitle.textContent = 'Listen & see';
      caption.textContent = 'Live spectrum of the synthesized audio signal. The graph shows relative strength across frequencies, not a physical picture of the sound.';
      canvas.setAttribute('aria-label', 'Live frequency spectrum of the synthesized vowel-like sound.');
    } else {
      chartTitle.textContent = 'Your sound’s ingredients';
      caption.textContent = 'Calculated components of the model, before playback. Taller bars mean stronger components. This is a graph of sound, not a picture of a mouth.';
      canvas.setAttribute('aria-label', 'Calculated frequency components of the selected synthesized sound.');
    }
    root.dataset.soundMode = next;
  }

  function stop(message = 'Stopped. Sound and microphone are off.') {
    generation++;
    clearTimeout(finishTimer); finishTimer = 0;
    cancelAnimationFrame(frame); frame = 0;
    const old = session; session = null;
    if (old) {
      if (old.stream) old.stream.getTracks().forEach(track => track.stop());
      (old.oscillators || []).forEach(osc => { try { osc.stop(); } catch (_) {} try { osc.disconnect(); } catch (_) {} });
      (old.gains || []).forEach(gain => { try { gain.disconnect(); } catch (_) {} });
      if (old.input) { try { old.input.disconnect(); } catch (_) {} }
      if (old.master) { try { old.master.disconnect(); } catch (_) {} }
      if (old.analyser) { try { old.analyser.disconnect(); } catch (_) {} }
      if (old.context && old.context.state !== 'closed') old.context.close().catch(() => {});
    }
    setMode('idle');
    status.textContent = message;
    draw();
  }

  function sync() {
    controls.f1.value = state.f1;
    controls.f2.min = Math.max(850, state.f1 + 250);
    controls.f2.value = state.f2;
    controls.volume.value = state.volume;
    ['f1', 'f2'].forEach(key => {
      const value = state[key] + ' Hz';
      $(key + '-value').textContent = value;
      controls[key].setAttribute('aria-valuetext', value);
    });
    const volumeText = Math.round(state.volume * 100) + '%';
    $('volume-value').textContent = volumeText;
    controls.volume.setAttribute('aria-valuetext', volumeText);
    root.querySelectorAll('[data-sound-preset]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.soundPreset === chosen)));
    $('current').textContent = (chosen || 'Your sound') + ' · base note 216 Hz';
    root.dataset.soundPreset = chosen || 'custom';
    if (mode === 'synth' && session) updateAudio();
    if (mode === 'idle') draw();
  }

  function setState(value, preset = null) {
    state = model.clean(value); chosen = preset;
    sync();
  }

  function updateAudio() {
    if (!session || mode !== 'synth') return;
    const now = session.context.currentTime;
    const parts = model.components(state, session.context.sampleRate);
    session.gains.forEach((gain, i) => {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setTargetAtTime(parts[i].amplitude, now, 0.025);
    });
    const gain = session.master.gain;
    gain.cancelScheduledValues(now);
    gain.setTargetAtTime(state.volume, now, 0.025);
    if (session.end > now + 0.08) {
      gain.setValueAtTime(state.volume, session.end - 0.04);
      gain.linearRampToValueAtTime(0, session.end);
    }
  }

  function contextSession() {
    if (!AudioCtor) throw new Error('Audio is unavailable in this browser. The model remains available to explore.');
    const context = new AudioCtor();
    const analyser = context.createAnalyser();
    analyser.fftSize = 8192;
    analyser.minDecibels = -100;
    analyser.maxDecibels = -10;
    analyser.smoothingTimeConstant = 0.65;
    const master = context.createGain();
    master.gain.value = 0;
    return { context, analyser, master, values: new Float32Array(analyser.frequencyBinCount), oscillators: [], gains: [], stream: null, input: null };
  }

  async function startSound() {
    stop('Starting your sound…');
    const run = generation;
    setMode('starting');
    document.dispatchEvent(new CustomEvent('cog:audio-start', { detail: { source: 'shape-your-sound' } }));
    try {
      const current = contextSession(); session = current;
      await current.context.resume();
      if (run !== generation) return;
      if (current.context.state !== 'running') throw new Error('Audio could not start. Choose Listen again.');
      const now = current.context.currentTime;
      current.end = now + 9;
      current.master.connect(current.analyser); current.analyser.connect(current.context.destination);
      model.components(state, current.context.sampleRate).forEach(part => {
        const osc = current.context.createOscillator(), gain = current.context.createGain();
        osc.type = 'sine'; osc.frequency.value = part.frequency;
        gain.gain.value = part.amplitude;
        osc.connect(gain); gain.connect(current.master);
        current.oscillators.push(osc); current.gains.push(gain);
        osc.start(now); osc.stop(current.end + 0.01);
      });
      current.master.gain.setValueAtTime(0, now);
      current.master.gain.linearRampToValueAtTime(state.volume, now + 0.04);
      current.master.gain.setValueAtTime(state.volume, current.end - 0.04);
      current.master.gain.linearRampToValueAtTime(0, current.end);
      setMode('synth');
      status.textContent = 'Playing for 9 seconds. You can shape the sound as it plays.';
      finishTimer = setTimeout(() => { if (run === generation) stop('Playback complete. Change one thing, then listen again.'); }, 9100);
      animate();
    } catch (error) {
      if (run === generation) stop(error.message || 'Audio could not start. You can still explore the model.');
    }
  }

  async function startMic() {
    stop('Waiting for microphone permission…');
    const run = generation;
    setMode('mic-pending');
    document.dispatchEvent(new CustomEvent('cog:audio-start', { detail: { source: 'shape-your-sound' } }));
    try {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) throw new Error('Microphone access is unavailable here. The sound examples still work.');
      const current = contextSession(); session = current;
      const ready = current.context.resume().catch(() => {});
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }, video: false });
      if (run !== generation) { stream.getTracks().forEach(track => track.stop()); return; }
      current.stream = stream;
      await ready;
      if (run !== generation) return;
      if (current.context.state !== 'running') throw new Error('Microphone analysis could not start. Choose Use microphone again.');
      current.input = current.context.createMediaStreamSource(stream);
      current.input.connect(current.analyser); current.analyser.connect(current.master);
      current.master.gain.value = 0; current.master.connect(current.context.destination);
      setMode('mic');
      status.textContent = 'Microphone on for 30 seconds. Gently try “ah” toward “ee.” No sound is played back.';
      stream.getAudioTracks().forEach(track => track.addEventListener('ended', () => { if (run === generation) stop('Microphone disconnected. You can use the sound examples.'); }, { once: true }));
      finishTimer = setTimeout(() => { if (run === generation) stop('Microphone session complete. Microphone is off.'); }, 30000);
      animate();
    } catch (error) {
      if (run !== generation) return;
      const message = error.name === 'NotAllowedError' ? 'Microphone permission was not granted. You can use every sound example without it.' : error.name === 'NotFoundError' ? 'No microphone was found. You can use the sound examples.' : error.message || 'The microphone could not start. The sound examples still work.';
      stop(message);
    }
  }

  function draw() {
    if (!painter) return;
    const bounds = canvas.getBoundingClientRect(), width = Math.max(240, bounds.width), height = Math.max(180, bounds.height);
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    }
    painter.setTransform(ratio, 0, 0, ratio, 0, 0);
    painter.clearRect(0, 0, width, height);
    const left = width < 400 ? 40 : 48, right = 14, top = 30, bottom = height - 37;
    const plotWidth = width - left - right, plotHeight = bottom - top;
    const x = frequency => left + Math.min(5000, frequency) / 5000 * plotWidth;
    const y = db => bottom - Math.max(0, Math.min(1, (db + 90) / 80)) * plotHeight;
    painter.font = '11px "Trebuchet MS", Arial, sans-serif';
    painter.lineWidth = 1;
    [-90, -70, -50, -30, -10].forEach(db => {
      const cy = y(db); painter.strokeStyle = colors.line;
      painter.beginPath(); painter.moveTo(left, cy); painter.lineTo(width - right, cy); painter.stroke();
      painter.fillStyle = colors.ink; painter.textAlign = 'right'; painter.fillText(String(db), left - 8, cy + 4);
    });
    const ticks = width < 450 ? [0, 1000, 3000, 5000] : [0, 1000, 2000, 3000, 4000, 5000];
    ticks.forEach(f => { painter.fillStyle = colors.ink; painter.textAlign = f === 0 ? 'left' : f === 5000 ? 'right' : 'center'; painter.fillText(f ? (f / 1000) + 'k' : '0', x(f), bottom + 18); });
    painter.textAlign = 'left'; painter.fillStyle = colors.ink; painter.fillText('Level (dB)', 8, 16);
    painter.textAlign = 'right'; painter.fillText('Frequency (Hz)', width - right, height - 6);
    if (session && (mode === 'synth' || mode === 'mic')) {
      session.analyser.getFloatFrequencyData(session.values);
      const hzPerBin = session.context.sampleRate / session.analyser.fftSize;
      painter.beginPath(); painter.moveTo(left, bottom);
      for (let px = 0; px <= plotWidth; px++) {
        const low = Math.floor(px / plotWidth * 5000 / hzPerBin);
        const high = Math.min(session.values.length - 1, Math.max(low, Math.ceil((px + 1) / plotWidth * 5000 / hzPerBin)));
        let strongest = -100;
        for (let i = low; i <= high; i++) strongest = Math.max(strongest, session.values[i]);
        painter.lineTo(left + px, y(strongest));
      }
      painter.lineTo(width - right, bottom); painter.closePath();
      painter.fillStyle = mode === 'mic' ? '#b2481022' : '#08776d25'; painter.fill();
      painter.strokeStyle = mode === 'mic' ? colors.orange : colors.teal; painter.lineWidth = 1.5; painter.stroke();
    } else {
      const parts = model.components(state);
      const barWidth = Math.max(2, Math.min(9, plotWidth / parts.length / 3));
      parts.forEach((part, i) => {
        const db = part.amplitude * state.volume > 0 ? 20 * Math.log10(part.amplitude * state.volume) : -100;
        const cy = y(db);
        painter.fillStyle = i === 0 ? colors.orange : colors.teal;
        painter.fillRect(x(part.frequency) - barWidth / 2, cy, barWidth, bottom - cy);
      });
    }
  }

  function animate(time = 0) {
    if (!session || (mode !== 'synth' && mode !== 'mic')) return;
    if (time - lastDraw > (reduced ? 250 : 60) || time === 0) { draw(); lastDraw = time; }
    frame = requestAnimationFrame(animate);
  }

  root.querySelectorAll('[data-sound-preset]').forEach(button => button.addEventListener('click', () => {
    if (mode === 'mic' || mode === 'mic-pending') stop('Microphone off. Choose Listen to hear this example.');
    const name = button.dataset.soundPreset;
    setState({ ...model.presets[name], volume: state.volume }, name);
    if (mode === 'idle') status.textContent = name + ' selected. Choose Listen to hear it.';
  }));
  Object.entries(controls).forEach(([key, input]) => input.addEventListener('input', () => {
    if (key !== 'volume' && (mode === 'mic' || mode === 'mic-pending')) stop('Microphone off. Your model is ready to shape.');
    setState({ ...state, [key]: Number(input.value) }, key === 'volume' ? chosen : null);
  }));
  play.addEventListener('click', startSound);
  createPlay.addEventListener('click', startSound);
  stopButton.addEventListener('click', () => stop());
  createStop.addEventListener('click', () => stop());
  micButton.addEventListener('click', startMic);
  micStop.addEventListener('click', () => stop('Microphone is off.'));
  $('reset').addEventListener('click', () => { stop('Reset to ah. Choose Listen when you are ready.'); setState({ ...model.presets.ah, volume: state.volume }, 'ah'); });
  $('save').addEventListener('click', () => {
    const data = JSON.stringify(model.recipe(state), null, 2);
    const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'creation-og-sound-recipe.json';
    root.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    $('recipe-status').textContent = 'Recipe download requested. Keep this file to recreate your settings with Load a recipe.';
  });
  $('load').addEventListener('click', () => $('file').click());
  $('file').addEventListener('change', async event => {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    try {
      if (file.size > 8192) throw new Error('This file is too large for a sound recipe. Choose the small JSON file saved here.');
      const imported = model.parseRecipe(JSON.parse(await file.text()));
      stop('Recipe loaded. Choose Listen when you are ready.'); setState(imported);
      $('recipe-status').textContent = 'Your sound recipe is loaded. Its settings are shown above.';
    } catch (error) { $('recipe-status').textContent = error instanceof SyntaxError ? 'That file is not valid JSON. Choose a saved Creation OG sound recipe.' : error.message; }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop('Paused. Sound and microphone are off.'); });
  window.addEventListener('pagehide', () => stop());
  document.addEventListener('cog:audio-start', event => { if (event.detail?.source !== 'shape-your-sound') stop(); });
  if ('ResizeObserver' in window) new ResizeObserver(draw).observe(canvas);
  else window.addEventListener('resize', draw);
  if (!AudioCtor) {
    play.disabled = createPlay.disabled = true; micButton.disabled = true;
    status.textContent = 'Audio is unavailable in this browser. You can still shape and save the model.';
    createStatus.textContent = status.textContent;
  }
  sync();
})();
