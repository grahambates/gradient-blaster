import qs from "qs";
import * as conv from "./colorConvert";
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
  return `?points=${encodePoints(points.items, steps, depth)}&${qs.stringify(
    opts
  )}`;
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
  const depth = targets[target].depth;
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
          ? conv.encodeHex3(conv.reduceBits(conv.hsvToRgb(p.color), depth))
          : conv.encodeHex6(conv.hsvToRgb(p.color));
      return col + "@" + Math.round(p.pos * (steps - 1));
    })
    .join(",");

const decodePoints = (encoded, steps, depth) =>
  encoded.split(",").map((n) => {
    const [hex, y] = n.split("@");
    const color = conv.rgbToHsv(conv.hexToRgb(hex, depth));
    const pos = y / (steps - 1);
    return { color, pos };
  });
