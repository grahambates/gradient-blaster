import { Bits, Color } from "../types";
import { restoreBits } from "./bitDepth";
import { normalizeRgb } from "./utils";

// Encode

export function encodeHex3(rgb: Color): string {
  return rgb.map((v) => v.toString(16)).join("");
}

export function encodeHex6(rgb: Color): string {
  return normalizeRgb(rgb)
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Hex value for Atari STe/TT
 * LSB is moved to MSB for each nibble
 */
export function encodeHexSte(rgb: Color): string {
  return rgb.map((n) => ((n >> 1) | ((n & 1) << 3)).toString(16)).join("");
}

export function encodeHexFalcon(rgb: Color): string {
  const [r, g, b] = normalizeRgb(rgb).map((v) =>
    (v << 2).toString(16).padStart(2, "0")
  );
  return r + g + "00" + b;
}

export function encodeHexFalconTrue([r, g, b]: Color): string {
  const word = (r << 11) | (g << 5) | b;
  return word.toString(16).padStart(4, "0");
}

/**
 * Pair of hex values for Amiga AGA registers
 * Separate word for upper and lower nibbles
 */
export function encodeHexPairAga(rgb: Color): [string, string] {
  const hex = encodeHex6(rgb);
  return [hex[0] + hex[2] + hex[4], hex[1] + hex[3] + hex[5]];
}

// Decode:

export function hexToRgb(hex: string, depth: Bits = 4): Color {
  return hex.length === 3
    ? restoreBits(decodeHex3(hex), depth)
    : decodeHex6(hex);
}

export function decodeHex3(hex: string): Color {
  return hex.split("").map((v) => parseInt(v, 16)) as Color;
}

export function decodeHex6(hex: string): Color {
  return [hex.substring(0, 2), hex.substring(2, 4), hex.substring(4, 6)].map(
    (v) => parseInt(v, 16)
  ) as Color;
}
