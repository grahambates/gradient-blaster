import { clamp } from "./utils";

export function reduceBits(rgb8, bits) {
  const bitsArr = bitsToArray(bits);
  return rgb8.map((c, i) => {
    const x = 1 << bitsArr[i];
    const max = x - 1;
    const divisor = 256 / x;
    return clamp(Math.floor(c / divisor), 0, max);
  });
}

export function restoreBits(rgb, bits) {
  const bitsArr = bitsToArray(bits);
  return rgb.map((c, i) => {
    const x = 1 << bitsArr[i];
    const max = x - 1;
    const multiplier = 256 / max;
    return clamp(c * multiplier, 0, 255);
  });
}

function bitsToArray(bits) {
  return Array.isArray(bits) ? bits : [bits, bits, bits];
}

export function quantize(rgb8, bits) {
  return restoreBits(reduceBits(rgb8, bits), bits);
}
