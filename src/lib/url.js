import qs from "qs";
import { reduceBits } from "./bitDepth";
import { hsvToRgb, rgbToHsv } from "./colorSpace";
import { encodeHex3, encodeHex6, hexToRgb } from "./hex";
import targets from "./targets";

export const encodeUrlQuery = ({ points, options }) => {
  const { steps, blendMode, ditherMode, ditherAmount, shuffleCount, target } =
    options;
  const opts = { steps, blendMode, ditherMode, target };
  if (!["off", "shuffle"].includes(ditherMode)) {
    opts.ditherAmount = ditherAmount;
  }
  if (ditherMode === "shuffle") {
    opts.shuffleCount = shuffleCount;
  }
  const depth = targets[target].depth;
  return `?points=${encodePoints(points, steps, depth)}&${qs.stringify(opts)}`;
};

export const decodeUrlQuery = (query) => {
  if (!query) return {};
  const {
    points,
    steps,
    blendMode,
    ditherMode,
    ditherAmount,
    shuffleCount,
    target,
  } = qs.parse(query.substring(1));
  const options = {
    steps: intVal(steps),
    blendMode,
    ditherMode,
    ditherAmount: intVal(ditherAmount),
    shuffleCount: intVal(shuffleCount),
    target,
  };
  // Remove undefined
  Object.keys(options).forEach((key) => {
    if (options[key] === undefined) {
      delete options[key];
    }
  });
  const depth = target && targets[target].depth;
  return {
    points: points && steps && decodePoints(points, options.steps, depth),
    options,
  };
};

const intVal = (str) => str && parseInt(str);

const encodePoints = (points, steps, depth) =>
  points
    .map((p) => {
      const col =
        depth <= 4
          ? encodeHex3(reduceBits(hsvToRgb(p.color), depth))
          : encodeHex6(hsvToRgb(p.color));
      return col + "@" + Math.round(p.pos * (steps - 1));
    })
    .join(",");

const decodePoints = (encoded, steps, depth) =>
  encoded.split(",").map((n) => {
    const [hex, y] = n.split("@");
    const color = rgbToHsv(hexToRgb(hex, depth));
    const pos = y / (steps - 1);
    return { color, pos };
  });
