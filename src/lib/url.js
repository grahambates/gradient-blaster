import qs from "qs";
import * as conv from "./colorConvert";

export const encodeUrlQuery = ({ points, options }) => {
  const { steps, blendMode, ditherMode, ditherAmount, shuffleCount } = options;
  const opts = { steps, blendMode, ditherMode };
  if (!["off", "shuffle"].includes(ditherMode)) {
    opts.ditherAmount = ditherAmount;
  }
  if (ditherMode === "shuffle") {
    opts.shuffleCount = shuffleCount;
  }
  return `?points=${encodePoints(points.items, options.steps)}&${qs.stringify(
    opts
  )}`;
};

export const decodeUrlQuery = (query) => {
  if (!query) return {};
  const { points, steps, blendMode, ditherMode, ditherAmount, shuffleCount } =
    qs.parse(query.substring(1));
  const options = {
    steps,
    blendMode,
    ditherMode,
    ditherAmount,
    shuffleCount,
  };
  // Remove undefine
  Object.keys(options).forEach((key) => {
    if (options[key] === undefined) {
      delete options[key];
    }
  });
  return {
    points: points && steps && decodePoints(points, steps),
    options,
  };
};

const encodePoints = (points, steps) =>
  points
    .map(
      (p) =>
        conv.rgb4ToHex(conv.rgb8ToRgb4(conv.hsvToRgb(p.color))) +
        "@" +
        Math.round(p.pos * (steps - 1))
    )
    .join(",");

const decodePoints = (encoded, steps) =>
  encoded.split(",").map((n) => {
    const [hex, y] = n.split("@");
    const color = conv.rgbToHsv(conv.rgb4ToRgb8(conv.hexToRgb4(hex)));
    const pos = y / (steps - 1);
    return { color, pos };
  });
