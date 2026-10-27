/* Small, inspectable vowel-like sound model. No human voice recording. */
(function (scope) {
  'use strict';
  const presets = Object.freeze({
    ah: Object.freeze({ f1: 750, f2: 1200, f3: 2500 }),
    oh: Object.freeze({ f1: 500, f2: 900, f3: 2400 }),
    ee: Object.freeze({ f1: 300, f2: 2300, f3: 3000 })
  });
  const fundamental = 216;
  const clamp = (v, lo, hi, fallback) => Number.isFinite(Number(v)) ? Math.max(lo, Math.min(hi, Number(v))) : fallback;
  function clean(input = {}) {
    const f1 = Math.round(clamp(input.f1, 250, 900, presets.ah.f1));
    return {
      f1,
      f2: Math.round(clamp(input.f2, Math.max(850, f1 + 250), 2800, presets.ah.f2)),
      f3: Math.round(clamp(input.f3, 2200, 3400, presets.ah.f3)),
      volume: clamp(input.volume, 0, 1, 0.7)
    };
  }
  function components(input = {}, sampleRate = 48000) {
    const s = clean(input);
    const count = Math.max(0, Math.floor(Math.min(5000, sampleRate * 0.45) / fundamental));
    const centers = [s.f1, s.f2, s.f3], widths = [110, 150, 220], strengths = [1, 0.8, 0.4];
    const items = Array.from({ length: count }, (_, i) => {
      const n = i + 1, frequency = n * fundamental;
      const emphasis = centers.reduce((total, center, j) => total + strengths[j] * Math.exp(-0.5 * ((frequency - center) / widths[j]) ** 2), 0.08);
      return { frequency, amplitude: emphasis / n ** 0.7 };
    });
    const rms = Math.sqrt(items.reduce((sum, item) => sum + item.amplitude ** 2, 0) / 2);
    const bound = items.reduce((sum, item) => sum + item.amplitude, 0);
    const scale = Math.min(rms ? 0.055 / rms : 0, bound ? 0.3 / bound : 0);
    return items.map(item => ({ frequency: item.frequency, amplitude: item.amplitude * scale }));
  }
  function recipe(input) {
    const s = clean(input);
    return { type: 'creation-og-sound-recipe', version: 1, fundamentalHz: fundamental, resonanceHz: [s.f1, s.f2, s.f3], volume: s.volume };
  }
  function parseRecipe(value) {
    if (!value || value.type !== 'creation-og-sound-recipe' || value.version !== 1 || value.fundamentalHz !== fundamental || !Array.isArray(value.resonanceHz) || value.resonanceHz.length !== 3 || !value.resonanceHz.every(v => typeof v === 'number' && Number.isFinite(v)) || typeof value.volume !== 'number' || !Number.isFinite(value.volume)) throw new Error('Choose a Creation OG sound recipe saved from this experience.');
    const [f1, f2, f3] = value.resonanceHz;
    const s = clean({ f1, f2, f3, volume: value.volume });
    if (s.f1 !== f1 || s.f2 !== f2 || s.f3 !== f3 || s.volume !== value.volume) throw new Error('This recipe has settings outside the supported range.');
    return s;
  }
  const api = Object.freeze({ presets, fundamental, clean, components, recipe, parseRecipe });
  scope.COGVoiceModel = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
