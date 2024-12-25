import {
  encodeHex3,
  encodeHexSte,
  encodeHexPairAga,
  encodeHexFalcon,
  encodeHexFalconTrue,
  decodeHex3,
  encodeHexFalcon24,
} from "./hex";
import { reduceBits } from "./bitDepth";
import { sameColors } from "./utils";
import { Target } from "./targets";
import { RGB } from "../types";

export type FormatKey =
  | "copperList"
  | "copperListC"
  | "tableAsm"
  | "tableC"
  | "tableAmos"
  | "tableStos"
  | "tableBin"
  | "hexList"
  | "imagePng";

export interface Format {
  label: string;
}

export const formats: Record<FormatKey, Format> = {
  copperList: { label: "Copper list: asm" },
  copperListC: { label: "Copper list: C" },
  tableAsm: { label: "Table: asm" },
  tableC: { label: "Table: C" },
  tableAmos: { label: "Table: AMOS" },
  tableStos: { label: "Table: STOS" },
  tableBin: { label: "Table: binary" },
  hexList: { label: "Hex list" },
  imagePng: { label: "PNG Image" },
};

export interface CopperListOptions {
  startLine?: number;
  varName: string;
  colorIndex?: number;
  waitStart?: boolean;
  endList?: boolean;
  target: Target;
  lang: "c" | "asm";
}

export function buildCopperList(
  gradient: RGB[],
  {
    startLine = 0x2b,
    varName,
    colorIndex = 0,
    waitStart = true,
    endList = true,
    target,
    lang,
  }: CopperListOptions,
): string {
  const isC = lang === "c";

  const numberPrefix = isC ? "0x" : "$";
  const linePrefix = isC ? "" : "dc.w ";
  const commentPrefix = isC ? "//" : ";";
  const linePostfix = isC ? "," : "";

  let colorReg = numberPrefix + (0x180 + colorIndex * 2).toString(16);
  let output = [];
  if (varName) {
    if (isC) {
      output.push(`unsigned short ${varName}[] = {`);
    } else {
      output.push(varName + ":");
    }
  }

  let lastCol;
  let line = startLine;
  for (const col of gradient) {
    if (target.id === "amigaOcs" || target.id === "amigaOcsLace") {
      // OCS/ ECS
      const hex = encodeHex3(reduceBits(col, 4));
      if (lastCol !== hex) {
        const l = (line & 0xff).toString(16);
        if (line > startLine || waitStart) {
          output.push(
            `\t${linePrefix}${numberPrefix}${l}07,${numberPrefix}fffe${linePostfix}`,
          );
        }
        output.push(
          `\t${linePrefix}${colorReg},${numberPrefix}${hex}${linePostfix}`,
        );
      }
      lastCol = hex;
    } else {
      // AGA
      if (!sameColors(lastCol as RGB, col)) {
        const l = (line & 0xff).toString(16);
        if (line > startLine || waitStart) {
          output.push(
            `\t${linePrefix}${numberPrefix}${l}07,${numberPrefix}fffe${linePostfix}`,
          );
        }
        const [hex1, hex2] = encodeHexPairAga(col);
        output.push(
          `\t${linePrefix}${colorReg},${numberPrefix}${hex1}${linePostfix}`,
        );
        output.push(
          `\t${linePrefix}${numberPrefix}106,${numberPrefix}200${linePostfix}`,
        );
        output.push(
          `\t${linePrefix}${colorReg},${numberPrefix}${hex2}${linePostfix}`,
        );
        output.push(
          `\t${linePrefix}${numberPrefix}106,${numberPrefix}000${linePostfix}`,
        );
      }
      lastCol = col;
    }
    // PAL fix
    if (line === 0xff) {
      output.push(
        `\t${linePrefix}${numberPrefix}ffdf,${numberPrefix}fffe${linePostfix} ${commentPrefix} PAL fix`,
      );
    }
    line++;
  }
  if (endList) {
    output.push(
      `\t${linePrefix}${numberPrefix}ffff,${numberPrefix}fffe ${commentPrefix} End copper list`,
    );
  }
  if (isC) {
    output.push("};");
  }
  return output.join("\n");
}

export interface TableOptions {
  rowSize: number;
  varName: string;
  target: Target;
}

export const formatTableAsm = (
  values: RGB[],
  { rowSize, varName, target }: TableOptions,
) => {
  let output = varName ? varName + ":\n" : "";
  const items = tableHexItems(values, target);
  const size = items[0]?.length > 4 ? "l" : "w";
  output += groupRows(items, rowSize)
    .map((row) => `\tdc.${size} ` + row.map((v) => "$" + v).join(","))
    .join("\n");
  return output;
};

function tableHexItems(values: RGB[], target: Target) {
  const items = [];
  for (let col of values) {
    if (target.id === "atariSte") {
      const color = reduceBits(col, target.depth);
      items.push(encodeHexSte(color));
    } else if (target.id === "amigaAga") {
      const hex = encodeHexPairAga(col);
      items.push(hex[0], hex[1]);
    } else if (target.id === "atariFalcon") {
      const color = reduceBits(col, target.depth);
      items.push(encodeHexFalcon(color));
    } else if (target.id === "atariFalcon24") {
      items.push(encodeHexFalcon24(col));
    } else if (target.id === "atariFalconTrue") {
      const color = reduceBits(col, target.depth);
      items.push(encodeHexFalconTrue(color));
    } else if (target.id === "amigaOcsLace") {
      const color = reduceBits(col, 4);
      items.push(encodeHex3(color));
    } else {
      const color = reduceBits(col, target.depth);
      items.push(encodeHex3(color));
    }
  }
  return items;
}

function groupRows<T>(items: T[], rowSize: number): T[][] {
  const out = [];
  let current = [];
  for (let i = 0; i < items.length; i++) {
    if (i % rowSize === 0) {
      if (current.length) {
        out.push(current);
      }
      current = [];
    }
    current.push(items[i]);
  }
  if (current.length) {
    out.push(current);
  }
  return out;
}

export const formatTableC = (
  values: RGB[],
  { rowSize = 16, varName, target }: TableOptions,
) => {
  const items = tableHexItems(values, target);
  const size = items[0]?.length > 4 ? "long" : "short";
  let output = `unsigned ${size} ${varName}[${items.length}] = {\n`;
  output += groupRows(items, rowSize)
    .map((row) => "\t" + row.map((v) => "0x" + v).join(","))
    .join(",\n");
  return output + "\n};";
};

export const gradientToBytes = (gradient: RGB[], target: Target) => {
  let bytes;
  let i = 0;

  if (target.id === "amigaAga") {
    bytes = new Uint8Array(gradient.length * 4);
    for (const rgb of gradient) {
      const rgbPair = encodeHexPairAga(rgb).map(decodeHex3);
      for (const [r, g, b] of rgbPair) {
        bytes[i++] = r;
        bytes[i++] = (g << 4) + b;
      }
    }
  } else if (target.id === "atariSte") {
    bytes = new Uint8Array(gradient.length * 2);
    for (const [r, g, b] of gradient.map((c) =>
      decodeHex3(encodeHexSte(reduceBits(c, target.depth))),
    )) {
      bytes[i++] = r;
      bytes[i++] = (g << 4) + b;
    }
  } else if (target.id === "atariFalcon") {
    bytes = new Uint8Array(gradient.length * 4);
    for (const [r, g, b] of gradient.map((c) =>
      reduceBits(c, target.depth).map((c) => c << 2),
    )) {
      bytes[i++] = r;
      bytes[i++] = g;
      bytes[i++] = 0;
      bytes[i++] = b;
    }
  } else if (target.id === "atariFalcon24") {
    bytes = new Uint8Array(gradient.length * 4);
    for (const [r, g, b] of gradient) {
      bytes[i++] = r;
      bytes[i++] = g;
      bytes[i++] = 0;
      bytes[i++] = b;
    }
  } else if (target.id === "atariFalconTrue") {
    bytes = new Uint8Array(gradient.length * 2);
    for (const [a, b, c, d] of gradient.map(
      (c) =>
        decodeHex3(
          encodeHexFalconTrue(reduceBits(c, target.depth)),
        ) as number[],
    )) {
      bytes[i++] = (a << 4) + b;
      bytes[i++] = (c << 4) + d;
    }
  } else if (target.id === "amigaOcsLace") {
    bytes = new Uint8Array(gradient.length * 2);
    for (const [r, g, b] of gradient.map((c) => reduceBits(c, 4))) {
      bytes[i++] = r;
      bytes[i++] = (g << 4) + b;
    }
  } else {
    bytes = new Uint8Array(gradient.length * 2);
    for (const [r, g, b] of gradient.map((c) => reduceBits(c, target.depth))) {
      bytes[i++] = r;
      bytes[i++] = (g << 4) + b;
    }
  }
  return bytes;
};

export const base64Encode = (bytes: Uint8Array) =>
  window.btoa(
    bytes.reduce((data, byte) => data + String.fromCharCode(byte), ""),
  );
