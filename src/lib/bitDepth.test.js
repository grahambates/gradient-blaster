import * as conv from "./bitDepth";

describe("bitDepth", () => {
  describe("reduceBits()", () => {
    it("converts to 4 bit", () => {
      let result = conv.reduceBits([255, 255, 255], 4);
      expect(result).toEqual([15, 15, 15]);

      result = conv.reduceBits([128, 128, 128], 4);
      expect(result).toEqual([8, 8, 8]);

      result = conv.reduceBits([0, 0, 0], 4);
      expect(result).toEqual([0, 0, 0]);

      result = conv.reduceBits([255, 128, 0], 4);
      expect(result).toEqual([15, 8, 0]);
    });

    it("distributes values evenly within range", () => {
      const values = Array(16).fill(0);
      for (let i = 0; i < 256; i++) {
        let result = conv.reduceBits([i, i, i], 4);
        values[result[0]]++;
      }
      for (let group of values) {
        expect(group).toBe(16);
      }
    });
  });

  describe("restoreBits()", () => {
    it("converts 4 bit back to 8 bit", () => {
      let result = conv.restoreBits([15, 15, 15], 4);
      expect(result).toEqual([255, 255, 255]);

      result = conv.restoreBits([0, 0, 0], 4);
      expect(result).toEqual([0, 0, 0]);
    });
  });

  describe("quantize()", () => {
    it("rounds RGB values to 4 bit resolution", () => {
      let result = conv.quantize([254, 254, 254], 4);
      expect(result).toEqual([255, 255, 255]);
    });
  });
});
