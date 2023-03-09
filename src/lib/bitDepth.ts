import { Bits, RGB } from "../types";
import { clamp } from "./utils";

export function reduceBits(rgb8: RGB, bits: Bits): RGB {
  const bitsArr = bitsToArray(bits);
  return rgb8.map((c, i) => {
    const x = 1 << bitsArr[i];
    const max = x - 1;
    const divisor = 256 / x;
    return clamp(Math.floor(c / divisor), 0, max);
  }) as RGB;
}

export function restoreBits(rgb: RGB, bits: Bits): RGB {
  const bitsArr = bitsToArray(bits);
  return rgb.map((c, i) => {
    const x = 1 << bitsArr[i];
    const max = x - 1;
    const multiplier = 256 / max;
    return clamp(c * multiplier, 0, 255);
  }) as RGB;
}

function bitsToArray(bits: Bits): [number, number, number] {
  return Array.isArray(bits) ? bits : [bits, bits, bits];
}

export function quantize(rgb8: RGB, bits: Bits): RGB {
  return restoreBits(reduceBits(rgb8, bits), bits);
}
