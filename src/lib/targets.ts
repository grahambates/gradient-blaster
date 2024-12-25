import { Bits, RGB } from "../types";
import { decodeHex6 } from "./hex";
import { FormatKey } from "./output";

export interface Target {
  id: string;
  label: string;
  depth: Bits;
  interlaced?: boolean;
  outputs: FormatKey[];
  palette?: RGB[];
  paletteRowSize?: number;
}

export type TargetKey =
  | "amigaOcs"
  | "amigaAga"
  | "amigaOcsLace"
  | "atariSt"
  | "atariSte"
  | "atariFalcon"
  | "atariFalcon24"
  | "atariFalconTruecolor"
  | "amstradCpc"
  | "c64"
  | "spectrum"
  | "nes";

const targets: Record<TargetKey, Target> = {
  amigaOcs: {
    id: "amigaOcs",
    label: "Amiga OCS/ECS",
    depth: 4,
    outputs: [
      "copperList",
      "copperListC",
      "tableAsm",
      "tableC",
      "tableAmos",
      "tableBin",
      "hexList",
      "imagePng",
    ],
  },
  amigaOcsLace: {
    id: "amigaOcsLace",
    label: "Amiga OCS/ESC interlace",
    depth: 5,
    interlaced: true,
    outputs: [
      "copperList",
      "copperListC",
      "tableAsm",
      "tableC",
      "tableAmos",
      "tableBin",
      "hexList",
      "imagePng",
    ],
  },
  amigaAga: {
    id: "amigaAga",
    label: "Amiga AGA",
    depth: 8,
    outputs: [
      "copperList",
      "copperListC",
      "tableAsm",
      "tableC",
      "tableAmos",
      "tableBin",
      "hexList",
      "imagePng",
    ],
  },
  atariSt: {
    id: "atariSt",
    label: "Atari ST",
    depth: 3,
    outputs: [
      "tableAsm",
      "tableC",
      "tableStos",
      "tableBin",
      "hexList",
      "imagePng",
    ],
  },
  atariSte: {
    id: "atariSte",
    label: "Atari STe/TT",
    depth: 4,
    outputs: [
      "tableAsm",
      "tableC",
      "tableStos",
      "tableBin",
      "hexList",
      "imagePng",
    ],
  },
  atariFalcon: {
    id: "atariFalcon",
    label: "Atari Falcon",
    depth: 6,
    outputs: [
      "tableAsm",
      "tableC",
      "tableStos",
      "tableBin",
      "hexList",
      "imagePng",
    ],
  },
  atariFalcon24: {
    id: "atariFalcon24",
    label: "Atari Falcon 24bit",
    depth: 8,
    outputs: [
      "tableAsm",
      "tableC",
      "tableStos",
      "tableBin",
      "hexList",
      "imagePng",
    ],
  },
  atariFalconTruecolor: {
    id: "atariFalconTrue",
    label: "Atari Falcon Truecolor",
    depth: [5, 6, 5],
    outputs: [
      "tableAsm",
      "tableC",
      "tableStos",
      "tableBin",
      "hexList",
      "imagePng",
    ],
  },
  amstradCpc: {
    id: "amstradCpc",
    label: "Amstrad CPC",
    depth: 2, // This is used to scale dithering noise functions - doesn't have to be exact
    outputs: ["hexList", "imagePng"],
    palette: [
      "000000",
      "000080",
      "0000ff",
      "800000",
      "800080",
      "8000ff",
      "ff0000",
      "ff0080",
      "ff00ff",
      "008000",
      "008080",
      "0080ff",
      "808000",
      "808080",
      "8080ff",
      "ff8000",
      "ff8080",
      "ff80ff",
      "00ff00",
      "00ff80",
      "00ffff",
      "80ff00",
      "80ff80",
      "80ffff",
      "ffff00",
      "ffff80",
      "ffffff",
    ].map(decodeHex6),
    paletteRowSize: 9,
  },
  c64: {
    id: "c64",
    label: "Commodore 64",
    depth: 2,
    outputs: ["hexList", "imagePng"],
    palette: [
      "000000",
      "626262",
      "898989",
      "adadad",
      "ffffff",
      "9f4e44",
      "cb7e75",
      "6d5412",
      "a1683c",
      "c9d487",
      "9ae29b",
      "5cab5e",
      "6abfc6",
      "887ecb",
      "50459b",
      "a057a3",
    ].map(decodeHex6),
    paletteRowSize: 8,
  },
  spectrum: {
    id: "spectrum",
    label: "ZX Spectrum",
    depth: 2,
    outputs: ["hexList", "imagePng"],
    palette: [
      "000000",
      "0000d8",
      "0000ff",
      "d80000",
      "ff0000",
      "d800d8",
      "ff00ff",
      "00d800",
      "00ff00",
      "00d8d8",
      "00ffff",
      "d8d800",
      "ffff00",
      "d8d8d8",
      "ffffff",
    ].map(decodeHex6),
    paletteRowSize: 5,
  },
  nes: {
    id: "nes",
    label: "NES",
    depth: 4,
    outputs: ["hexList", "imagePng"],
    palette: [
      "000000",
      "fcfcfc",
      "f8f8f8",
      "bcbcbc",
      "7c7c7c",
      "a4e4fc",
      "3cbcfc",
      "0078f8",
      "0000fc",
      "b8b8f8",
      "6888fc",
      "0058f8",
      "0000bc",
      "d8b8f8",
      "9878f8",
      "6844fc",
      "4428bc",
      "f8b8f8",
      "f878f8",
      "d800cc",
      "940084",
      "f8a4c0",
      "f85898",
      "e40058",
      "a80020",
      "f0d0b0",
      "f87858",
      "f83800",
      "a81000",
      "fce0a8",
      "fca044",
      "e45c10",
      "881400",
      "f8d878",
      "f8b800",
      "ac7c00",
      "503000",
      "d8f878",
      "b8f818",
      "00b800",
      "007800",
      "b8f8b8",
      "58d854",
      "00a800",
      "006800",
      "b8f8d8",
      "58f898",
      "00a844",
      "005800",
      "00fcfc",
      "00e8d8",
      "008888",
      "004058",
      "f8d8f8",
      "787878",
    ].map(decodeHex6),
    paletteRowSize: 11,
  },
};

export default targets;
