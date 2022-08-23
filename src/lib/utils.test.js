import * as utils from "./utils";

describe("utils", () => {
  describe("normalizeRgb()", () => {
    it("clamps and rounds components", () => {
      const result = utils.normalizeRgb([300, 1.5, -1]);
      expect(result).toEqual([255, 2, 0]);
    });
  });

  describe("rgbCssProp()", () => {
    it("converts to a valid CSS RGB property", () => {
      const result = utils.rgbCssProp([12, 34, 56]);
      expect(result).toBe("rgb(12, 34, 56)");
    });
  });

  describe("fToPercent()", () => {
    it("converts a flat to a percentage string", () => {
      let result = utils.fToPercent(1);
      expect(result).toBe("100%");
      result = utils.fToPercent(0.5);
      expect(result).toBe("50%");

      result = utils.fToPercent(0.25);
      expect(result).toBe("25%");

      result = utils.fToPercent(0);
      expect(result).toBe("0%");
    });
  });

  describe("clamp()", () => {
    it("limits max value", () => {
      let result = utils.clamp(100, 0, 50);
      expect(result).toBe(50);
    });

    it("limits min value", () => {
      let result = utils.clamp(10, 50, 200);
      expect(result).toBe(50);
    });

    it("defaults to 0-1 range", () => {
      let result = utils.clamp(1.5);
      expect(result).toBe(1);

      result = utils.clamp(-1);
      expect(result).toBe(0);
    });
  });

  describe("sameColors()", () => {
    it("returns true for identical RGB values", () => {
      let result = utils.sameColors([1, 2, 3], [1, 2, 3]);
      expect(result).toBe(true);
    });

    it("returns false for identical RGB values", () => {
      let result = utils.sameColors([1, 2, 3], [3, 2, 1]);
      expect(result).toBe(false);
    });
  });
});
