import * as conv from "../lib/colorConvert";

export const formatPaletteAsm = (values, { rowSize, label, depth }) => {
  let output = label ? label + ":\n" : "";
  const items = paletteHexItems(values, depth);
  output += groupRows(items, rowSize)
    .map((row) => "\tdc.w " + row.map((v) => "$" + v).join(","))
    .join("\n");
  return output;
};

function paletteHexItems(values, depth) {
  const items = [];
  for (let col of values) {
    if (depth === 4) {
      const color = conv.rgb8ToRgb4(col);
      items.push(conv.rgb4ToHex(color));
    } else {
      const hex = conv.hexPair(col);
      items.push(hex[0], hex[1]);
    }
  }
  return items;
}

function groupRows(items, rowSize) {
  const out = [];
  let current;
  for (let i in items) {
    if (i % rowSize === 0) {
      if (current) {
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

export const formatPaletteC = (values, { rowSize = 16, varName, depth }) => {
  const items = paletteHexItems(values, depth);
  let output = `unsigned short ${varName}[${items.length}] = {\n`;
  output += groupRows(items, rowSize)
    .map((row) => "\t" + row.map((v) => "0x" + v).join(","))
    .join("\n");
  return output + "\n};";
};

export const gradientToBytes = (gradient, depth) => {
  const bytes = new Uint8Array((gradient.length * depth) / 2);
  let i = 0;
  if (depth === 4) {
    for (const [r, g, b] of gradient.map(conv.rgb8ToRgb4)) {
      bytes[i++] = r;
      bytes[i++] = (g << 4) + b;
    }
  } else {
    for (const rgb of gradient) {
      const rgbPair = conv.hexPair(rgb).map(conv.hexToRgb4);
      for (const [r, g, b] of rgbPair) {
        bytes[i++] = r;
        bytes[i++] = (g << 4) + b;
      }
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
  { startLine = 0x2b, varName, colorIndex, waitStart, endList, depth }
) {
  const colorReg = "$" + (0x180 + colorIndex).toString(16);
  let output = [];
  if (varName) {
    output.push(varName + ":");
  }

  let lastCol;
  let line = startLine;
  for (const col of gradient) {
    if (depth === 4) {
      const hex = conv.rgb4ToHex(conv.rgb8ToRgb4(col));
      if (lastCol !== hex) {
        const l = (line & 0xff).toString(16);
        if (line > startLine || waitStart) {
          output.push(`\tdc.w $${l}07,$fffe`);
        }
        output.push(`\tdc.w ${colorReg},$${hex}`);
      }
      lastCol = hex;
    } else {
      if (!conv.sameColors(lastCol, col)) {
        const l = (line & 0xff).toString(16);
        if (line > startLine || waitStart) {
          output.push(`\tdc.w $${l}07,$fffe`);
        }
        const [hex1, hex2] = conv.hexPair(col);
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
