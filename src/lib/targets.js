const targets = {
  amigaOcs: {
    id: "amigaOcs",
    label: "Amiga OCS/ECS",
    depth: 4,
    outputs: [
      "copperList",
      "paletteAsm",
      "paletteC",
      "paletteAmos",
      "paletteBin",
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
      "paletteAsm",
      "paletteC",
      "paletteAmos",
      "paletteBin",
      "imagePng",
    ],
  },
  amigaAga: {
    id: "amigaAga",
    label: "Amiga AGA",
    depth: 8,
    outputs: [
      "copperList",
      "paletteAsm",
      "paletteC",
      "paletteAmos",
      "paletteBin",
      "imagePng",
    ],
  },
  atariSt: {
    id: "atariSt",
    label: "Atari ST",
    depth: 3,
    outputs: [
      "paletteAsm",
      "paletteC",
      "paletteStos",
      "paletteBin",
      "imagePng",
    ],
  },
  atariSte: {
    id: "atariSte",
    label: "Atari STe/TT",
    depth: 4,
    outputs: [
      "paletteAsm",
      "paletteC",
      "paletteStos",
      "paletteBin",
      "imagePng",
    ],
  },
  /*
  atariFalcon: {
    id: "atariFalcon",
    label: "Atari Falcon",
    depth: 6,
    outputs: [
      "paletteAsm",
      "paletteC",
      "paletteStos",
      "paletteBin",
      "imagePng",
    ],
  },
  atariFalconTruecolor: {
    id: "atariFalconTruecolor",
    label: "Atari Falcon Truecolor",
    depth: [5, 6, 5],
    outputs: [
      "paletteAsm",
      "paletteC",
      "paletteStos",
      "paletteBin",
      "imagePng",
    ],
  },
  */
};

export default targets;
