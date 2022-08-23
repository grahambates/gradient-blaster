import * as hex from "./hex";

describe("hex", () => {
  // Encode:

  describe("encodeHex3()", () => {
    it("encodes a 4 bit RGB value", () => {
      let result = hex.encodeHex3([0xf, 0xf, 0xf]);
      expect(result).toBe("fff");

      result = hex.encodeHex3([0x0, 0x0, 0x0]);
      expect(result).toBe("000");

      result = hex.encodeHex3([0xf, 0x8, 0x1]);
      expect(result).toBe("f81");
    });
  });

  describe("encodeHex6()", () => {
    it("encodes an 8 bit RGB value", () => {
      let result = hex.encodeHex6([0xff, 0xff, 0xff]);
      expect(result).toBe("ffffff");

      result = hex.encodeHex6([0x0, 0x0, 0x0]);
      expect(result).toBe("000000");

      result = hex.encodeHex6([0xf1, 0x82, 0x13]);
      expect(result).toBe("f18213");
    });
  });

  describe("encodeHexSte()", () => {
    it("encodes a 4 bit RGB value with LSB rotated", () => {
      let result = hex.encodeHexSte([0xf, 0xf, 0xf]);
      expect(result).toBe("fff");

      result = hex.encodeHexSte([0xe, 0xe, 0xe]);
      expect(result).toBe("777");

      result = hex.encodeHexSte([0x2, 0x2, 0x2]);
      expect(result).toBe("111");

      result = hex.encodeHexSte([0x1, 0x1, 0x1]);
      expect(result).toBe("888");

      result = hex.encodeHexSte([0x0, 0x0, 0x0]);
      expect(result).toBe("000");

      result = hex.encodeHexSte([0xf, 0xe, 0x1]);
      expect(result).toBe("f78");
    });
  });

  describe("encodeHexFalcon()", () => {
    it("encodes a 6 bit RGB value in upper bits of each byte", () => {
      let result = hex.encodeHexFalcon([0x3f, 0x3f, 0x3f]);
      expect(result).toBe("fcfc00fc");

      result = hex.encodeHexFalcon([0x1, 0x1, 0x1]);
      expect(result).toBe("04040004");

      result = hex.encodeHexFalcon([0x3f, 0x11, 0x1]);
      expect(result).toBe("fc440004");
    });
  });

  describe("encodeHexFalconTrue()", () => {
    it("encodes a 5/6/5 bit RGB value in a single word", () => {
      let result = hex.encodeHexFalconTrue([0x1f, 0x3f, 0x1f]);
      expect(result).toBe("ffff");

      result = hex.encodeHexFalconTrue([0x0, 0x0, 0x0]);
      expect(result).toBe("0000");

      result = hex.encodeHexFalconTrue([16, 8, 0]);
      expect(result).toBe("8100");
    });
  });

  describe("encodeHexPairAga()", () => {
    //
    it("encodes an 8 bit RGB value to a pair of words containing upper and lower nibbles", () => {
      let result = hex.encodeHexPairAga([0xf1, 0xe2, 0xd3]);
      expect(result).toEqual(["fed", "123"]);
    });
  });

  // Decode:

  describe("hexToRgb()", () => {
    it("decodes an 8bit hex value", () => {
      let result = hex.hexToRgb("ffeedd");
      expect(result).toEqual([255, 238, 221]);
    });

    it("decodes an 3bit hex value", () => {
      let result = hex.hexToRgb("777", 3);
      expect(result).toEqual([255, 255, 255]);
    });

    it("decodes an 4 bit hex value by default", () => {
      let result = hex.hexToRgb("fff");
      expect(result).toEqual([255, 255, 255]);
    });
  });

  describe("decodeHex3()", () => {
    it("decodes a 4 bit RGB value", () => {
      let result = hex.decodeHex3("fff");
      expect(result).toEqual([0xf, 0xf, 0xf]);

      result = hex.decodeHex3("000");
      expect(result).toEqual([0x0, 0x0, 0x0]);

      result = hex.decodeHex3("f81");
      expect(result).toEqual([0xf, 0x8, 0x1]);
    });
  });

  describe("decodeHex6()", () => {
    it("decodes an 8 bit RGB value", () => {
      let result = hex.decodeHex6("ffffff");
      expect(result).toEqual([0xff, 0xff, 0xff]);

      result = hex.decodeHex6("000000");
      expect(result).toEqual([0x0, 0x0, 0x0]);

      result = hex.decodeHex6("f18213");
      expect(result).toEqual([0xf1, 0x82, 0x13]);
    });
  });
});
