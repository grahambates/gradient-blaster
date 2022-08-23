export function normalizeRgb(rgb) {
  return rgb.map((c) => Math.round(clamp(c, 0, 255)));
}

export function rgbCssProp([r, g, b]) {
  return `rgb(${r}, ${g}, ${b})`;
}

export function fToPercent(val) {
  return Math.round(val * 100) + "%";
}

export function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

export function sameColors(a, b) {
  return a && b && a.join(",") === b.join(",");
}
