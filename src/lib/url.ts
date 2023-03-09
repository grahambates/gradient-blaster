import qs from "qs";
import { Bits, Options, Point } from "../types";
import { reduceBits } from "./bitDepth";
import { hsvToRgb, rgbToHsv } from "./colorSpace";
import { encodeHex3, encodeHex6, hexToRgb } from "./hex";
import targets, { TargetKey } from "./targets";

export type UrlArgs = {
  points: Point[];
  options: Options;
};

export const encodeUrlQuery = ({ points, options }: UrlArgs): string => {
  const { steps, blendMode, ditherMode, ditherAmount, shuffleCount, target, paletteSize } =
    options;
  const opts: Options = { steps, blendMode, ditherMode, target, paletteSize };
  if (!["off", "shuffle"].includes(ditherMode)) {
    opts.ditherAmount = ditherAmount;
  }
  if (ditherMode === "shuffle") {
    opts.shuffleCount = shuffleCount;
  }
  const depth = targets[target].depth;
  return `?points=${encodePoints(points, steps, depth)}&${qs.stringify(opts)}`;
};

export const decodeUrlQuery = (query: string): Partial<UrlArgs> => {
  if (!query) return {};
  const {
    points,
    steps,
    blendMode,
    ditherMode,
    ditherAmount,
    shuffleCount,
    target,
    paletteSize
  } = qs.parse(query.substring(1)) as Record<string, string>;
  const options = {
    steps: intVal(steps),
    blendMode,
    ditherMode,
    ditherAmount: intVal(ditherAmount),
    shuffleCount: intVal(shuffleCount),
    target,
    paletteSize: intVal(paletteSize)
  } as Options;
  // Remove undefined
  Object.keys(options).forEach((key) => {
    if (options[key as keyof Options] === undefined) {
      delete options[key as keyof Options];
    }
  });
  const depth = targets[target as TargetKey].depth ?? 4;
  return {
    points: points && steps ? decodePoints(points, options.steps, depth) : [],
    options,
  };
};

const intVal = (str: string | undefined): number | undefined =>
  str ? parseInt(str) : undefined;

const encodePoints = (points: Point[], steps: number, depth: Bits): string =>
  points
    .map((p) => {
      const col =
        depth <= 4
          ? encodeHex3(reduceBits(hsvToRgb(p.color), depth))
          : encodeHex6(hsvToRgb(p.color));
      return col + "@" + Math.round(p.pos * (steps - 1));
    })
    .join(",");

const decodePoints = (encoded: string, steps: number, depth: Bits): Point[] =>
  encoded.split(",").map((n) => {
    const [hex, y] = n.split("@");
    const color = rgbToHsv(hexToRgb(hex, depth));
    const pos = parseInt(y) / (steps - 1);
    return { color, pos };
  });
