import * as conv from "./colorSpace";

describe("colorSpace", () => {
  // HSV:

  describe("rgbToHsv()", () => {
    it("converts RGB to HSV", () => {
      let result = conv.rgbToHsv([255, 127.5, 0]);
      expect(result).toEqual([0.08333333333333333, 1, 1]);
    });
  });

  describe("hsvToRgb()", () => {
    it("converts RGB to HSV", () => {
      let result = conv.hsvToRgb([0.08333333333333333, 1, 1]);
      expect(result).toEqual([255, 127.5, 0]);
    });
  });

  // LAB:

  describe("rgbToLab()", () => {
    it("converts RGB to LAB", () => {
      let result = conv.rgbToLab([255, 127, 0]);
      expect(result).toEqual([
        66.853804382266, 43.32394349110946, 73.90977076096983,
      ]);
    });
  });

  describe("labToRgb()", () => {
    it("converts LAB to RGB", () => {
      let result = conv
        .labToRgb([66.853804382266, 43.32394349110946, 73.90977076096983])
        .map(Math.round);
      expect(result).toEqual([255, 127, 0]);
    });
  });

  // OKLAB

  describe("rgbToOklab()", () => {
    it("converts RGB to OKLAB", () => {
      let result = conv.rgbToOklab([255, 127, 0]);
      expect(result).toEqual([
        58.09001263044044, 9.955384839640125, 11.763332051857013,
      ]);
    });
  });

  describe("oklabToRgb()", () => {
    it("converts LAB to RGB", () => {
      let result = conv
        .oklabToRgb([58.09001263044044, 9.955384839640125, 11.763332051857013])
        .map(Math.round)
        .map(Math.abs);
      expect(result).toEqual([255, 127, 0]);
    });
  });

  // Linear RGB:

  describe("rgbToLrgb()", () => {
    it("converts RGB to OKLAB", () => {
      let result = conv.rgbToLrgb([255, 127, 0]);
      expect(result).toEqual([524946.8293388885, 98576.71060759352, 0]);
    });
  });

  describe("lrgbToRgb()", () => {
    it("converts LAB to RGB", () => {
      let result = conv
        .lrgbToRgb([524946.8293388885, 98576.71060759352, 0])
        .map(Math.round);
      expect(result).toEqual([255, 127, 0]);
    });
  });

  // Linear sRGB components:

  describe("srgbToLinear()", () => {
    it("converts SRGB to linear", () => {
      let result = conv.srgbToLinear(127.5);
      expect(result).toEqual(0.21404114048223255);
    });
  });

  describe("linearToSrgb()", () => {
    it("converts linear to SRGB", () => {
      let result = conv.linearToSrgb(0.21404114048223255);
      expect(result).toEqual(127.5);
    });
  });

  // Luminance:

  describe("luminance()", () => {
    it("returns max value for white", () => {
      let result = conv.luminance([255, 255, 255]);
      expect(result).toBe(255);
    });

    it("returns min value for blue", () => {
      let result = conv.luminance([0, 0, 0]);
      expect(result).toBe(0);
    });

    it("considers red brighter than blue", () => {
      let red = conv.luminance([255, 0, 0]);
      let blue = conv.luminance([0, 0, 255]);
      expect(red).toBeGreaterThan(blue);
    });
  });
});
