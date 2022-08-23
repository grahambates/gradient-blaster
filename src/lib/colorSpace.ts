import { Color } from "../types";

// HSV:

export function rgbToHsv([r, g, b]: Color): Color {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  let h = 0;

  if (max === min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
    }

    h /= 6;
  }

  return [h, s, v];
}

export function hsvToRgb([h, s, v]: Color): Color {
  let r, g, b;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    default:
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }

  return [r * 255, g * 255, b * 255];
}

// LAB:

export function rgbToLab(rgb: Color): Color {
  let r = rgb[0] / 255,
    g = rgb[1] / 255,
    b = rgb[2] / 255,
    x,
    y,
    z;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.0;
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

  x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
  y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
  z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

export function labToRgb(lab: Color): Color {
  let y = (lab[0] + 16) / 116,
    x = lab[1] / 500 + y,
    z = y - lab[2] / 200,
    r,
    g,
    b;

  x = 0.95047 * (x * x * x > 0.008856 ? x * x * x : (x - 16 / 116) / 7.787);
  y = 1.0 * (y * y * y > 0.008856 ? y * y * y : (y - 16 / 116) / 7.787);
  z = 1.08883 * (z * z * z > 0.008856 ? z * z * z : (z - 16 / 116) / 7.787);

  r = x * 3.2406 + y * -1.5372 + z * -0.4986;
  g = x * -0.9689 + y * 1.8758 + z * 0.0415;
  b = x * 0.0557 + y * -0.204 + z * 1.057;

  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
  b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;

  return [
    Math.max(0, Math.min(1, r)) * 255,
    Math.max(0, Math.min(1, g)) * 255,
    Math.max(0, Math.min(1, b)) * 255,
  ];
}

// OKLAB:

export function rgbToOklab(col: Color): Color {
  const [r, g, b] = rgbToLrgb(col);

  let L = Math.cbrt(
    0.41222147079999993 * r + 0.5363325363 * g + 0.0514459929 * b
  );
  let M = Math.cbrt(
    0.2119034981999999 * r + 0.6806995450999999 * g + 0.1073969566 * b
  );
  let S = Math.cbrt(
    0.08830246189999998 * r + 0.2817188376 * g + 0.6299787005000002 * b
  );

  return [
    0.2104542553 * L + 0.793617785 * M - 0.0040720468 * S,
    1.9779984951 * L - 2.428592205 * M + 0.4505937099 * S,
    0.0259040371 * L + 0.7827717662 * M - 0.808675766 * S,
  ];
}

export function oklabToRgb([l, a, b]: Color): Color {
  let L = Math.pow(
    l * 0.9999999984505198 + 0.3963377921737679 * a + 0.2158037580607588 * b,
    3
  );
  let M = Math.pow(
    l * 1.000000008881761 - 0.105561342323656 * a - 0.0638541747717059 * b,
    3
  );
  let S = Math.pow(
    l * 1.000000054672411 - 0.0894841820949658 * a - 1.291485537864092 * b,
    3
  );

  return lrgbToRgb([
    +4.076741661347994 * L - 3.307711590408193 * M + 0.230969928729428 * S,
    -1.2684380040921763 * L + 2.6097574006633715 * M - 0.3413193963102197 * S,
    -0.004196086541837188 * L - 0.7034186144594493 * M + 1.7076147009309444 * S,
  ]);
}

// Linear RGB

export const rgbToLrgb = (col: Color): Color => {
  return col.map((c) => {
    const abs = Math.abs(c);
    if (abs < 0.04045) {
      return c / 12.92;
    }
    return (Math.sign(c) || 1) * Math.pow((abs + 0.055) / 1.055, 2.4);
  }) as Color;
};

export const lrgbToRgb = (col: Color): Color => {
  return col.map((c) => {
    const abs = Math.abs(c);
    if (abs > 0.0031308) {
      return (Math.sign(c) || 1) * (1.055 * Math.pow(abs, 1 / 2.4) - 0.055);
    }
    return c * 12.92;
  }) as Color;
};

// Linear sRGB components

export function linearToSrgb(x: number): number {
  const y = x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
  return y * 255;
}

export function srgbToLinear(x: number): number {
  x /= 255.0;
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
}

// Luminance:

export function luminance([r, g, b]: Color): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}
