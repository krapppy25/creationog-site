/* One original parametric form, viewed through orthographic projections. */
(function (root, factory) {
  const model = factory();
  if (typeof module === 'object' && module.exports) module.exports = model;
  else root.OGFormModel = model;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const defaults = Object.freeze({ bend: 0.72, depth: 1.05, width: 0.12 });
  function points(settings = defaults, count = 540) {
    const result = [];
    for (let i = 0; i <= count; i++) {
      const t = i / count * Math.PI * 2;
      const radius = 2 + settings.bend * Math.cos(3 * t);
      result.push({ x: radius * Math.cos(2 * t), y: radius * Math.sin(2 * t), z: settings.depth * Math.sin(3 * t) });
    }
    return result;
  }
  function rotate(point, yaw, pitch) {
    const a = yaw * Math.PI / 180, b = pitch * Math.PI / 180;
    const x = point.x * Math.cos(a) + point.z * Math.sin(a);
    const z = -point.x * Math.sin(a) + point.z * Math.cos(a);
    return { x, y: point.y * Math.cos(b) - z * Math.sin(b), z: point.y * Math.sin(b) + z * Math.cos(b) };
  }
  function project(source, yaw, pitch) { return source.map(point => rotate(point, yaw, pitch)); }
  return Object.freeze({ defaults, points, rotate, project });
});
