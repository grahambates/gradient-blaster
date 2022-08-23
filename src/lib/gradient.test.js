import { rgbToHsv } from "./colorSpace";
import { buildGradient, interlaceGradient } from "./gradient";

describe("gradient", () => {
  describe("buildGradient()", () => {
    const points = [
      { color: rgbToHsv([0, 0, 0]), pos: 0 },
      { color: rgbToHsv([255, 255, 255]), pos: 1 },
    ];
    const steps = 16;

    const result = buildGradient(points, {
      steps,
      blendMode: "oklab",
      ditherMode: "blueNoise",
      ditherAmount: 30,
      target: "amigaOcs",
    });

    it("contains the correct number of steps", () => {
      expect(result).toHaveLength(steps);
    });

    it("starts on the first point color", () => {
      expect(result[0]).toEqual([0, 0, 0]);
    });

    it("ends on the last point color", () => {
      expect(result[steps - 1]).toEqual([255, 255, 255]);
    });
  });

  describe("interlaceGradient()", () => {
    const points = [
      { color: rgbToHsv([0, 0, 0]), pos: 0 },
      { color: rgbToHsv([255, 255, 255]), pos: 1 },
    ];
    const steps = 16;

    const gradient = buildGradient(points, {
      steps,
      blendMode: "oklab",
      ditherMode: "blueNoise",
      ditherAmount: 30,
      target: "amigaOcs",
    });

    const result = interlaceGradient(gradient, 5);

    it("outputs two gradients", () => {
      expect(result).toHaveLength(2);
    });

    it("contains the correct number of steps in each", () => {
      expect(result[0]).toHaveLength(steps);
      expect(result[1]).toHaveLength(steps);
    });
  });
});
