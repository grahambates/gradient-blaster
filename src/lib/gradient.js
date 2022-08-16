import * as conv from "./colorConvert";

const GOLDEN_RATIO = 1.61803399;

export function buildGradient(points, options) {
  const { steps, blendMode, ditherMode, ditherAmount } = options;
  const mappedPoints = [...points].map((p) => ({
    color: conv.quantize4Bit(conv.hsvToRgb(p.color)),
    y: Math.round(p.pos * (steps - 1)),
  }));

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
    values = dither(values, ditherMode, ditherAmount);
  }

  return values.map(conv.rgb8ToRgb4);
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

function dither(values, ditherMode, ditherAmount) {
  let swappedLast = false;
  const amount = ditherAmount / 100;

  if (ditherMode === "errorDiffusion") {
    const hsvValues = values.map(conv.rgbToLab);
    for (let i = 0; i < hsvValues.length; i++) {
      const col = hsvValues[i];
      const quantised = conv.rgbToLab(conv.quantize4Bit(conv.labToRgb(col)));
      const errH = col[0] - quantised[0];
      const errS = col[1] - quantised[1];
      const errV = col[2] - quantised[2];
      if (hsvValues[i + 1]) {
        hsvValues[i + 1][0] += errH * amount;
        hsvValues[i + 1][1] += errS * amount;
        hsvValues[i + 1][2] += errV * amount;
      }
    }
    return hsvValues.map(conv.labToRgb);
  }

  for (let i = 0; i < values.length; i++) {
    switch (ditherMode) {
      case "shuffle": {
        if (i > 0) {
          const prev = values[i - 1];
          if (
            !swappedLast &&
            !conv.sameColors(conv.rgb8ToRgb4(prev), conv.rgb8ToRgb4(values[i]))
          ) {
            values[i - 1] = values[i];
            values[i] = prev;
            swappedLast = true;
          } else {
            swappedLast = false;
          }
        }
        break;
      }
      case "ordered":
        values[i][0] += ((bayer16[i % 16] - 128) / 17) * amount;
        values[i][1] += ((bayer16[(i % 16) + 16] - 128) / 17) * amount;
        values[i][2] += ((bayer16[(i % 16) + 32] - 128) / 17) * amount;
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
      case "whiteNoiseMono":
        const ofs = (Math.random() - 0.5) * 17 * amount;
        values[i][0] += ofs;
        values[i][1] += ofs;
        values[i][2] += ofs;
        break;
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

function err4bit(val) {
  let err = val % 17;
  if (err > 8.5) {
    err -= 8.5;
  }
  return err;
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

const bayer16 = [
  0, 191, 48, 239, 12, 203, 60, 251, 3, 194, 51, 242, 15, 206, 63, 254, 127, 64,
  175, 112, 139, 76, 187, 124, 130, 67, 178, 115, 142, 79, 190, 127, 32, 223,
  16, 207, 44, 235, 28, 219, 35, 226, 19, 210, 47, 238, 31, 222, 159, 96, 143,
  80, 171, 108, 155, 92, 162, 99, 146, 83, 174, 111, 158, 95, 8, 199, 56, 247,
  4, 195, 52, 243, 11, 202, 59, 250, 7, 198, 55, 246, 135, 72, 183, 120, 131,
  68, 179, 116, 138, 75, 186, 123, 134, 71, 182, 119, 40, 231, 24, 215, 36, 227,
  20, 211, 43, 234, 27, 218, 39, 230, 23, 214, 167, 104, 151, 88, 163, 100, 147,
  84, 170, 107, 154, 91, 166, 103, 150, 87, 2, 193, 50, 241, 14, 205, 62, 253,
  1, 192, 49, 240, 13, 204, 61, 252, 129, 66, 177, 114, 141, 78, 189, 126, 128,
  65, 176, 113, 140, 77, 188, 125, 34, 225, 18, 209, 46, 237, 30, 221, 33, 224,
  17, 208, 45, 236, 29, 220, 161, 98, 145, 82, 173, 110, 157, 94, 160, 97, 144,
  81, 172, 109, 156, 93, 10, 201, 58, 249, 6, 197, 54, 245, 9, 200, 57, 248, 5,
  196, 53, 244, 137, 74, 185, 122, 133, 70, 181, 118, 136, 73, 184, 121, 132,
  69, 180, 117, 42, 233, 26, 217, 38, 229, 22, 213, 41, 232, 25, 216, 37, 228,
  21, 212, 169, 106, 153, 90, 165, 102, 149, 86, 168, 105, 152, 89, 164, 101,
  148, 85,
];
