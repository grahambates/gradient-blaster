import { restoreBits } from "./bitDepth";
import { normalizeRgb } from "./utils";

// Encode

export function encodeHex3(rgb) {
  return rgb.map((v) => v.toString(16)).join("");
}

export function encodeHex6(rgb) {
  return normalizeRgb(rgb)
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Hex value for Atari STe/TT
 * LSB is moved to MSB for each nibble
 */
export function encodeHexSte(rgb) {
  return rgb.map((n) => ((n >> 1) | ((n & 1) << 3)).toString(16)).join("");
}

export function encodeHexFalcon(rgb) {
  const [r, g, b] = normalizeRgb(rgb).map((v) =>
    (v << 2).toString(16).padStart(2, "0")
  );
  return r + g + "00" + b;
}

export function encodeHexFalconTrue([r, g, b]) {
  const word = (r << 11) | (g << 5) | b;
  return word.toString(16).padStart(4, "0");
}

/**
 * Pair of hex values for Amiga AGA registers
 * Separate word for upper and lower nibbles
 */
export function encodeHexPairAga(rgb) {
  const hex = encodeHex6(rgb);
  const pair = [hex[0] + hex[2] + hex[4], hex[1] + hex[3] + hex[5]];
  return pair;
}

// Decode:

export function hexToRgb(hex, depth = 4) {
  return hex.length === 3
    ? restoreBits(decodeHex3(hex), depth)
    : decodeHex6(hex);
}

export function decodeHex3(hex) {
  return hex.split("").map((v) => parseInt(v, 16));
}

export function decodeHex6(hex) {
  return [hex.substring(0, 2), hex.substring(2, 4), hex.substring(4, 6)].map(
    (v) => parseInt(v, 16)
  );
}
