import { Options } from "../types";
import { rgbToHsv } from "./colorSpace";
import * as url from "./url";

const points = [
  { color: rgbToHsv([0, 0, 0]), pos: 0 },
  { color: rgbToHsv([255, 255, 255]), pos: 1 },
];
const options: Options = {
  steps: 16,
  blendMode: "oklab",
  ditherMode: "blueNoise",
  ditherAmount: 30,
  target: "amigaOcs",
};
const agaOptions: Options = {
  ...options,
  target: "amigaAga",
};

describe("url", () => {
  describe("encodeUrlQuery", () => {
    it("encodes points and options for amigaOcs", () => {
      const result = url.encodeUrlQuery({ points, options });
      expect(result).toBe(
        "?points=000@0,fff@15&steps=16&blendMode=oklab&ditherMode=blueNoise&target=amigaOcs&ditherAmount=30",
      );
    });

    it("uses long hex values for > 4 bits", () => {
      const result = url.encodeUrlQuery({
        points,
        options: agaOptions,
      });
      expect(result).toBe(
        "?points=000000@0,ffffff@15&steps=16&blendMode=oklab&ditherMode=blueNoise&target=amigaAga&ditherAmount=30",
      );
    });
  });

  describe("decodeUrlQuery())", () => {
    it("decodes a query", () => {
      const result = url.decodeUrlQuery(
        "?points=000@0,fff@15&steps=16&blendMode=oklab&ditherMode=blueNoise&target=amigaOcs&ditherAmount=30",
      );
      expect(result.points).toEqual(points);
      expect(result.options).toEqual(options);
    });

    it("decodes a query with long hex values", () => {
      const result = url.decodeUrlQuery(
        "?points=000000@0,ffffff@15&steps=16&blendMode=oklab&ditherMode=blueNoise&target=amigaAga&ditherAmount=30",
      );
      expect(result.points).toEqual(points);
      expect(result.options).toEqual(agaOptions);
    });
  });
});
