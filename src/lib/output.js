import * as conv from "../lib/colorConvert";

export const formats = {
  copperList: { label: "Copper list" },
  tableAsm: { label: "Table: asm" },
  tableC: { label: "Table: C" },
  tableAmos: { label: "Table: AMOS" },
  tableStos: { label: "Table: STOS" },
  tableBin: { label: "Table: binary" },
  imagePng: { label: "PNG Image" },
};

export const formatTableAsm = (values, { rowSize, varName, target }) => {
  let output = varName ? varName + ":\n" : "";
  const items = tableHexItems(values, target);
  const size = items[0]?.length > 4 ? "l" : "w";
  output += groupRows(items, rowSize)
    .map((row) => `\tdc.${size} ` + row.map((v) => "$" + v).join(","))
    .join("\n");
  return output;
};

function tableHexItems(values, target) {
  const items = [];
  for (let col of values) {
    if (target.id === "atariSte") {
      const color = conv.reduceBits(col, target.depth);
      items.push(conv.encodeHexSte(color));
    } else if (target.id === "amigaAga") {
      const hex = conv.encodeHexPairAga(col);
      items.push(hex[0], hex[1]);
    } else if (target.id === "atariFalcon") {
      const color = conv.reduceBits(col, target.depth);
      items.push(conv.encodeHexFalcon(color));
    } else if (target.id === "atariFalconTrue") {
      const color = conv.reduceBits(col, target.depth);
      items.push(conv.encodeHexFalconTrue(color));
    } else {
      const color = conv.reduceBits(col, 4);
      items.push(conv.encodeHex3(color));
    }
  }
  return items;
}

function groupRows(items, rowSize) {
  const out = [];
  let current = [];
  for (let i in items) {
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

export const formatTableC = (values, { rowSize = 16, varName, target }) => {
  const items = tableHexItems(values, target);
  const size = items[0]?.length > 4 ? "long" : "short";
  let output = `unsigned ${size} ${varName}[${items.length}] = {\n`;
  output += groupRows(items, rowSize)
    .map((row) => "\t" + row.map((v) => "0x" + v).join(","))
    .join("\n");
  return output + "\n};";
};

export const gradientToBytes = (gradient, target) => {
  let bytes;
  let i = 0;

  if (target.id === "amigaAga") {
    bytes = new Uint8Array(gradient.length * 4);
    for (const rgb of gradient) {
      const rgbPair = conv.encodeHexPairAga(rgb).map(conv.decodeHex3);
      for (const [r, g, b] of rgbPair) {
        bytes[i++] = r;
        bytes[i++] = (g << 4) + b;
      }
    }
  } else if (target.id === "atariSte") {
    bytes = new Uint8Array(gradient.length * 2);
    for (const [r, g, b] of gradient.map((c) =>
      conv.decodeHex3(conv.encodeHexSte(conv.reduceBits(c, target.depth)))
    )) {
      bytes[i++] = r;
      bytes[i++] = (g << 4) + b;
    }
  } else if (target.id === "atariFalcon") {
    bytes = new Uint8Array(gradient.length * 4);
    for (const [r, g, b] of gradient.map((c) =>
      conv.reduceBits(c, target.depth).map((c) => c << 2)
    )) {
      bytes[i++] = r;
      bytes[i++] = g;
      bytes[i++] = 0;
      bytes[i++] = b;
    }
  } else if (target.id === "atariFalconTrue") {
    bytes = new Uint8Array(gradient.length * 2);
    for (const [a, b, c, d] of gradient.map((c) =>
      conv.decodeHex3(
        conv.encodeHexFalconTrue(conv.reduceBits(c, target.depth))
      )
    )) {
      bytes[i++] = (a << 4) + b;
      bytes[i++] = (c << 4) + d;
    }
  } else {
    bytes = new Uint8Array(gradient.length * 2);
    for (const [r, g, b] of gradient.map((c) => conv.reduceBits(c, 4))) {
      bytes[i++] = r;
      bytes[i++] = (g << 4) + b;
    }
  }
  return bytes;
};

export const base64Encode = (bytes) =>
  window.btoa(
    bytes.reduce((data, byte) => data + String.fromCharCode(byte), "")
  );

export function buildCopperList(
  gradient,
  { startLine = 0x2b, varName, colorIndex, waitStart, endList, target }
) {
  const colorReg = "$" + (0x180 + colorIndex).toString(16);
  let output = [];
  if (varName) {
    output.push(varName + ":");
  }

  let lastCol;
  let line = startLine;
  for (const col of gradient) {
    if (target.id === "amigaOcs" || target.id === "amigaOcsLace") {
      // OCS/ ECS
      const hex = conv.encodeHex3(conv.reduceBits(col, 4));
      if (lastCol !== hex) {
        const l = (line & 0xff).toString(16);
        if (line > startLine || waitStart) {
          output.push(`\tdc.w $${l}07,$fffe`);
        }
        output.push(`\tdc.w ${colorReg},$${hex}`);
      }
      lastCol = hex;
    } else {
      // AGA
      if (!conv.sameColors(lastCol, col)) {
        const l = (line & 0xff).toString(16);
        if (line > startLine || waitStart) {
          output.push(`\tdc.w $${l}07,$fffe`);
        }
        const [hex1, hex2] = conv.encodeHexPairAga(col);
        output.push(`\tdc.w ${colorReg},$${hex1}`);
        output.push(`\tdc.w $106,$200`);
        output.push(`\tdc.w ${colorReg},$${hex2}`);
        output.push(`\tdc.w $106,$000`);
      }
      lastCol = col;
    }
    // PAL fix
    if (line === 0xff) {
      output.push(`\tdc.w $ffdf,$fffe ; PAL fix`);
    }
    line++;
  }
  if (endList) {
    output.push(`\tdc.w $ffff,$fffe ; End copper list`);
  }
  return output.join("\n");
}