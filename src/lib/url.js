import qs from "qs";
import * as conv from "./colorConvert";

export const encodeUrlQuery = ({ points, options }) => {
  const { steps, blendMode, ditherMode, ditherAmount, shuffleCount, depth } =
    options;
  const opts = { steps, blendMode, depth, ditherMode };
  if (!["off", "shuffle"].includes(ditherMode)) {
    opts.ditherAmount = ditherAmount;
  }
  if (ditherMode === "shuffle") {
    opts.shuffleCount = shuffleCount;
  }
  return `?points=${encodePoints(
    points.items,
    options.steps,
    options.depth
  )}&${qs.stringify(opts)}`;
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
    depth,
  } = qs.parse(query.substring(1));
  const options = {
    steps: intVal(steps),
    blendMode,
    ditherMode,
    ditherAmount: intVal(ditherAmount),
    shuffleCount: intVal(shuffleCount),
    depth: intVal(depth),
  };
  // Remove undefined
  Object.keys(options).forEach((key) => {
    if (options[key] === undefined) {
      delete options[key];
    }
  });
  return {
    points: points && steps && decodePoints(points, options.steps),
    options,
  };
};

const intVal = (str) => str && parseInt(str);

const encodePoints = (points, steps, depth) =>
  points
    .map((p) => {
      const col =
        depth === 4
          ? conv.rgb4ToHex(conv.rgb8ToRgb4(conv.hsvToRgb(p.color)))
          : conv.rgb8ToHex(conv.hsvToRgb(p.color));
      return col + "@" + Math.round(p.pos * (steps - 1));
    })
    .join(",");

const decodePoints = (encoded, steps) =>
  encoded.split(",").map((n) => {
    const [hex, y] = n.split("@");
    const color = conv.rgbToHsv(conv.hexToRgb(hex));
    const pos = y / (steps - 1);
    return { color, pos };
  });
