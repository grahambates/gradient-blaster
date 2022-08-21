const targets = {
  amigaOcs: {
    id: "amigaOcs",
    label: "Amiga OCS/ECS",
    depth: 4,
    outputs: [
      "copperList",
      "tableAsm",
      "tableC",
      "tableAmos",
      "tableBin",
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
      "tableAsm",
      "tableC",
      "tableAmos",
      "tableBin",
      "imagePng",
    ],
  },
  amigaAga: {
    id: "amigaAga",
    label: "Amiga AGA",
    depth: 8,
    outputs: [
      "copperList",
      "tableAsm",
      "tableC",
      "tableAmos",
      "tableBin",
      "imagePng",
    ],
  },
  atariSt: {
    id: "atariSt",
    label: "Atari ST",
    depth: 3,
    outputs: ["tableAsm", "tableC", "tableStos", "tableBin", "imagePng"],
  },
  atariSte: {
    id: "atariSte",
    label: "Atari STe/TT",
    depth: 4,
    outputs: ["tableAsm", "tableC", "tableStos", "tableBin", "imagePng"],
  },
  atariFalcon: {
    id: "atariFalcon",
    label: "Atari Falcon",
    depth: 6,
    outputs: ["tableAsm", "tableC", "tableStos", "tableBin", "imagePng"],
  },
  atariFalconTruecolor: {
    id: "atariFalconTrue",
    label: "Atari Falcon Truecolor",
    // depth: 5,
    depth: [5, 6, 5],
    outputs: ["tableAsm", "tableC", "tableStos", "tableBin", "imagePng"],
  },
};

export default targets;
