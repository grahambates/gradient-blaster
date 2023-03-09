import { Color, RGB } from "../types";

export function normalizeRgb(rgb: RGB): RGB {
  return rgb.map((c) => Math.round(clamp(c, 0, 255))) as RGB;
}

export function rgbCssProp([r, g, b]: RGB): string {
  return `rgb(${r}, ${g}, ${b})`;
}

export function fToPercent(val: number): string {
  return Math.round(val * 100) + "%";
}

export function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

export function sameColors(a: Color, b: Color) {
  return a && b && a.join(",") === b.join(",");
}
