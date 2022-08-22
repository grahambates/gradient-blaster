import * as conv from "./colorConvert";
import targets from "./targets";

const GOLDEN_RATIO = 1.61803399;

export function buildGradient(points, options) {
  const { steps, blendMode, ditherMode, target } = options;
  const depth = targets[target].depth;
  const mappedPoints = [...points].map((p) => {
    let color = conv.hsvToRgb(p.color);
    color = conv.quantize(color, depth);
    const y = Math.round(p.pos * (steps - 1));
    return { y, color };
  });

  let values = [];
  let pointIndex = 0;

  for (let i = 0; i < steps; i++) {
    const current = mappedPoints[pointIndex];
    let next = mappedPoints[pointIndex + 1];

    const firstPoint = current.y >= i;
    const lastPoint = !next;

    if (firstPoint || lastPoint) {
      // Use exact color value
      values.push(current.color);
    } else if (next.y === i) {
      const col = next.color;
      // Reached next point
      while (next && next.y === i) {
        pointIndex++;
        next = mappedPoints[pointIndex + 1];
      }
      values.push(col);
    } else {
      // Mix intermediate step:
      const pos = (i - current.y) / (next.y - current.y);
      const from = current.color;
      const to = next.color;
      let mixed;
      switch (blendMode) {
        case "lab":
          mixed = conv.labToRgb(
            lerpTuple(conv.rgbToLab(from), conv.rgbToLab(to), pos)
          );
          break;
        // https://bottosson.github.io/posts/oklab/#blending-colors
        case "oklab":
          mixed = conv.oklabToRgb(
            lerpTuple(conv.rgbToOklab(from), conv.rgbToOklab(to), pos)
          );
          break;
        case "perceptual":
          mixed = perceptualMix(from, to, pos);
          break;
        default:
          mixed = lerpTuple(from, to, pos);
      }
      values.push(mixed);
    }
  }

  if (ditherMode !== "off") {
    values = dither(values, options);
  }

  return values.map(conv.normalizeRgb);
}

// https://stackoverflow.com/questions/22607043/color-gradient-algorithm
function perceptualMix(color1, color2, pos) {
  const from = color1.map(conv.srgbToLinear);
  const to = color2.map(conv.srgbToLinear);
  const mixed = [
    from[0] + (to[0] - from[0]) * pos,
    from[1] + (to[1] - from[1]) * pos,
    from[2] + (to[2] - from[2]) * pos,
  ];

  // Compute a measure of brightness of the two colors using empirically determined gamma
  const gamma = 0.43;
  const fromBrightness = Math.pow(from[0] + from[1] + from[2], gamma);
  const toBrightness = Math.pow(to[0] + to[1] + to[2], gamma);

  // Interpolate a new brightness value, and convert back to linear light
  const brightness = fromBrightness + (toBrightness - fromBrightness) * pos;
  const intensity = Math.pow(brightness, 1 / gamma);

  // Apply adjustment factor to each rgb value based
  const sum = mixed[0] + mixed[1] + mixed[2];
  if (sum > 0) {
    const factor = intensity / sum;
    mixed[0] *= factor;
    mixed[1] *= factor;
    mixed[2] *= factor;
  }

  return mixed.map(conv.linearToSrgb);
}

function dither(values, { ditherMode, ditherAmount, shuffleCount, target }) {
  if (ditherMode === "off") {
    return values;
  }

  const depth = targets[target].depth;

  let amount = ditherAmount / 100;

  if (ditherMode === "errorDiffusion") {
    const labValues = values.map(conv.rgbToLab);
    for (let i = 0; i < labValues.length; i++) {
      const col = labValues[i];
      const quantised = conv.rgbToLab(conv.quantize(conv.labToRgb(col), depth));
      const errL = col[0] - quantised[0];
      const errA = col[1] - quantised[1];
      const errB = col[2] - quantised[2];
      if (labValues[i + 1]) {
        labValues[i + 1][0] += errL * amount;
        labValues[i + 1][1] += errA * amount;
        labValues[i + 1][2] += errB * amount;
      }
    }
    return labValues.map(conv.labToRgb);
  }

  const depthInt = Array.isArray(depth) ? depth[0] : depth;

  // Scale noise functions to color depth
  amount *= 4 / depthInt;

  const sameOutput = (a, b) =>
    conv.sameColors(conv.quantize(a, depth), conv.quantize(b, depth));

  for (let i = 0; i < values.length; i++) {
    switch (ditherMode) {
      case "shuffle": {
        if (i > 0) {
          const prev = values[i - 1];
          const current = values[i];
          if (!sameOutput(prev, current)) {
            // First shuffle
            values[i - 1] = values[i];
            values[i] = prev;
            i++;

            // Additional shuffles
            for (let j = 0; j < shuffleCount - 1; j++) {
              let n = (j + 1) * 4;
              if (
                values[i + 1] &&
                sameOutput(current, values[i + 1]) &&
                values[i - n] &&
                sameOutput(prev, values[i - n])
              ) {
                values[i - n] = current;
                values[i + 1] = prev;
                i += 2;
              }
            }
          }
        }
        break;
      }
      case "ordered":
        values[i][0] += (i % 2 ? 4 : -4) * amount;
        values[i][1] += (i % 2 ? -4 : 4) * amount;
        values[i][2] += (i % 2 ? 4 : -4) * amount;
        break;
      case "orderedMono": {
        const offset = (i % 2 ? 4 : -4) * amount;
        values[i][0] += offset;
        values[i][1] += offset;
        values[i][2] += offset;
        break;
      }
      case "blueNoise": {
        values[i][0] += blueNoise[i % 64] * 17 * amount;
        values[i][1] += blueNoise[(i + 16) % 64] * 17 * amount;
        values[i][2] += blueNoise[(i + 32) % 64] * 17 * amount;
        break;
      }
      case "blueNoiseMono": {
        const ofs = blueNoise[i % 64] * 17 * amount;
        values[i][0] += ofs;
        values[i][1] += ofs;
        values[i][2] += ofs;
        break;
      }
      case "whiteNoise":
        values[i][0] += (Math.random() * 17 - 8.5) * amount;
        values[i][1] += (Math.random() * 17 - 8.5) * amount;
        values[i][2] += (Math.random() * 17 - 8.5) * amount;
        break;
      case "whiteNoiseMono": {
        const ofs = (Math.random() - 0.5) * 17 * amount;
        values[i][0] += ofs;
        values[i][1] += ofs;
        values[i][2] += ofs;
        break;
      }
      // https://bartwronski.com/2016/10/30/dithering-part-two-golden-ratio-sequence-blue-noise-and-highpass-and-remap/comment-page-1/
      case "goldenRatio": {
        values[i][0] += (((i * GOLDEN_RATIO) % 1) - 0.5) * 17 * amount;
        values[i][1] += ((((i + 1) * GOLDEN_RATIO) % 1) - 0.5) * 17 * amount;
        values[i][2] += ((((i + 3) * GOLDEN_RATIO) % 1) - 0.5) * 17 * amount;
        break;
      }
      case "goldenRatioMono": {
        const ofs = (((i * GOLDEN_RATIO) % 1) - 0.5) * 17 * amount;
        values[i][0] += ofs;
        values[i][1] += ofs;
        values[i][2] += ofs;
        break;
      }
      default:
    }
  }
  return values;
}

function lerpTuple(from, to, pos) {
  const ret = [
    Math.round(from[0] + (to[0] - from[0]) * pos),
    Math.round(from[1] + (to[1] - from[1]) * pos),
    Math.round(from[2] + (to[2] - from[2]) * pos),
  ];
  return ret;
}

const blueNoise = [
  18, 59, 10, 35, 49, 22, 6, 53, 27, 41, 13, 63, 20, 37, 1, 48, 25, 57, 9, 34,
  44, 16, 51, 4, 31, 62, 19, 39, 11, 47, 23, 56, 0, 32, 45, 14, 60, 28, 7, 50,
  38, 15, 29, 54, 2, 42, 24, 61, 12, 36, 21, 52, 5, 40, 26, 58, 8, 33, 46, 17,
  55, 3, 30, 43,
].map((n) => n / 64 - 0.5);

export function interlaceGradient(gradient, depth) {
  const out = [[], []];

  const x = 1 << depth;
  const divisor = 256 / x;
  const inc = divisor / 2;

  for (let col of gradient) {
    let odd = conv.quantize(col, depth).map((c) => c - inc);
    odd = conv.quantize(odd, depth - 1);
    out[0].push(odd);

    let even = conv.quantize(col, depth).map((c) => c + inc);
    even = conv.quantize(even, depth - 1);
    out[1].push(even);
  }

  return out;
}
