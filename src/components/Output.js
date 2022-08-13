import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import asmatmel from "react-syntax-highlighter/dist/esm/languages/prism/asmatmel";
import c from "react-syntax-highlighter/dist/esm/languages/prism/c";
import { FaCopy, FaDownload } from "react-icons/fa";

import "./Output.css";
import * as conv from "../lib/colorConvert";
import { selectGradient, selectPresentData } from "../store";
import { encodeUrlQuery } from "../lib/url";
import Button from "./Button";

SyntaxHighlighter.registerLanguage("asmatmel", asmatmel);
SyntaxHighlighter.registerLanguage("c", c);

const DEBOUNCE_DELAY = 50;

const baseUrl = window.location.href.split("?")[0];

function Output() {
  const [outputFormat, setOutputFormat] = useState("copperList");
  const present = useSelector(selectPresentData);
  const gradient = useSelector(selectGradient);

  // Delay update to output for performance i.e. dont generate 1000s of times while dragging
  const [debouncedGradient, setDebouncedGradient] = useState(gradient);
  const [debouncedQuery, setDebouncedQuery] = useState(encodeUrlQuery(present));
  const timeout = useRef(0);
  useEffect(() => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      const query = encodeUrlQuery(present);
      setDebouncedQuery(query);
      setDebouncedGradient(gradient);
      // Update URL path
      window.history.replaceState({}, null, window.location.pathname + query);
    }, DEBOUNCE_DELAY);
  }, [present, gradient]);

  return (
    <div className="Output">
      <div className="Output__format">
        <label htmlFor="Output-format">Output format</label>{" "}
        <select
          id="Output-format"
          value={outputFormat}
          onChange={e => setOutputFormat(e.target.value)}
        >
          <option value="copperList">Copper list</option>
          <option value="paletteAsm">Palette: asm</option>
          <option value="paletteC">Palette: C</option>
          <option value="paletteBin">Palette: binary</option>
          <option value="imagePng">PNG Image</option>
        </select>
      </div>
      {outputFormat === "copperList" && (
        <CopperList gradient={debouncedGradient} query={debouncedQuery} />
      )}
      {outputFormat === "paletteAsm" && (
        <PaletteAsm gradient={debouncedGradient} query={debouncedQuery} />
      )}
      {outputFormat === "paletteC" && (
        <PaletteC gradient={debouncedGradient} query={debouncedQuery} />
      )}
      {outputFormat === "paletteBin" && (
        <PaletteBin gradient={debouncedGradient} />
      )}
      {outputFormat === "imagePng" && <ImagePng gradient={gradient} />}
    </div>
  );
}

const formatPaletteAsm = (values, { rowSize = 16, label = "Gradient" }) => {
  let output = label ? label + ":" : "";
  for (let i in values) {
    output += i % rowSize ? "," : `\n\tdc.w `;
    output += "$" + conv.rgb4ToHex(values[i]);
  }
  return output;
};

const PaletteAsm = React.memo(({ gradient, query }) => {
  const [rowSize, setRowSize] = useState(8);
  const [varName, setVarName] = useState("Gradient");
  const formatted = formatPaletteAsm(gradient, { rowSize });
  const code = "; " + baseUrl + query + "\n" + formatted;

  return (
    <>
      <div className="Output__actions">
        <CopyLink code={code} />
        <DownloadLink data={code} filename="gradient.s" />
      </div>
      <Code language="asmatmel" code={code} />

      <div className="Output__formatOptions">
        <div>
          <label htmlFor="Output-rowSize">Values per row: </label>
          <input
            id="Output-rowSize"
            type="number"
            min="1"
            max="1000"
            value={rowSize}
            onChange={e => setRowSize(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="Output-varName">Label: </label>
          <input
            id="Output-varName"
            type="text"
            value={varName}
            onChange={e => setVarName(e.target.value)}
          />
        </div>
      </div>
    </>
  );
});

const formatPaletteC = (values, { rowSize = 16, varName = "gradient" }) => {
  let output = `unsigned short ${varName}[${values.length}] = {`;
  for (let i in values) {
    if (!(i % rowSize)) output += "\n\t";
    output += "0x" + conv.rgb4ToHex(values[i]) + ",";
  }
  return output + "\n};";
};

const PaletteC = React.memo(({ gradient, query }) => {
  const [rowSize, setRowSize] = useState(8);
  const [varName, setVarName] = useState("gradient");
  const formatted = formatPaletteC(gradient, { rowSize, varName });
  const code = "// " + baseUrl + query + "\n" + formatted;

  return (
    <>
      <div className="Output__actions">
        <CopyLink code={code} />
        <DownloadLink data={code} filename="gradient.c" />
      </div>
      <Code language="c" code={code} />

      <div className="Output__formatOptions">
        <div>
          <label htmlFor="Output-rowSize">Values per row: </label>
          <input
            id="Output-rowSize"
            type="number"
            min="1"
            max="1000"
            value={rowSize}
            onChange={e => setRowSize(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="Output-varName">Variable name: </label>
          <input
            id="Output-varName"
            type="text"
            value={varName}
            onChange={e => setVarName(e.target.value)}
          />
        </div>
      </div>
    </>
  );
});

const gradientToBytes = gradient => {
  const bytes = new Uint8Array(gradient.length * 2);
  let i = 0;
  for (const [r, g, b] of gradient) {
    bytes[i++] = r;
    bytes[i++] = (g << 4) + b;
  }
  return bytes;
};

const base64Encode = bytes =>
  window.btoa(
    bytes.reduce((data, byte) => data + String.fromCharCode(byte), "")
  );

const PaletteBin = React.memo(({ gradient }) => {
  const bytes = gradientToBytes(gradient);
  return (
    <div className="Output__actions">
      <DownloadLink
        data={base64Encode(bytes)}
        filename="gradient.bin"
        mimetype="application/octet-stream;base64"
      />
    </div>
  );
});

function buildCopperList(
  gradient,
  { startLine = 0x2b, varName, colorIndex, waitStart, endList }
) {
  const hexCodes = gradient.map(conv.rgb4ToHex);
  const colorReg = "$" + (0x180 + colorIndex).toString(16);
  let output = [];
  if (varName) {
    output.push(varName + ":");
  }

  let lastCol;
  let line = startLine;
  for (const hex of hexCodes) {
    if (lastCol !== hex) {
      const l = (line & 0xff).toString(16);
      if (line > startLine || waitStart) {
        output.push(`\tdc.w $${l}07,$fffe`);
      }
      output.push(`\tdc.w ${colorReg},$${hex}`);
    }
    // PAL fix
    if (line === 0xff) {
      output.push(`\tdc.w $ffdf,$fffe ; PAL fix`);
    }
    lastCol = hex;
    line++;
  }
  if (endList) {
    output.push(`\tdc.w $ffff,$fffe ; End copper list`);
  }
  return output.join("\n");
}

const CopperList = React.memo(({ gradient, query }) => {
  const [startLine, setStartLine] = useState(0x2b);
  const [colorIndex, setColorIndex] = useState(0);
  const [varName, setVarName] = useState("Gradient");
  const [waitStart, setWaitStart] = useState(true);
  const [endList, setEndList] = useState(true);

  const formatted = buildCopperList(gradient, {
    varName,
    colorIndex,
    startLine,
    waitStart,
    endList
  });
  const code = "; " + baseUrl + query + "\n" + formatted;

  return (
    <>
      <div className="Output__actions">
        <CopyLink code={code} />
        <DownloadLink data={code} filename="gradient.s" />
      </div>
      <Code language="asmatmel" code={code} />

      <div className="Output__formatOptions">
        <div>
          <label htmlFor="Output-startLine">Start line: </label>
          <input
            id="Output-startLine"
            type="text"
            value={startLine ? startLine.toString(16) : ""}
            onChange={e => setStartLine(parseInt(e.target.value, 16))}
          />
        </div>
        <div>
          <label htmlFor="Output-colorIndex">Color index: </label>
          <input
            id="Output-colorIndex"
            type="number"
            min="0"
            max="31"
            value={colorIndex}
            onChange={e => setColorIndex(parseInt(e.target.value))}
          />
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={waitStart}
              onChange={e => setWaitStart(e.target.checked)}
            />{" "}
            Wait for start
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              checked={endList}
              onChange={e => setEndList(e.target.checked)}
            />{" "}
            End copper list
          </label>
        </div>
        <div>
          <label htmlFor="Output-varName">Label: </label>
          <input
            id="Output-varName"
            type="text"
            value={varName}
            onChange={e => setVarName(e.target.value)}
          />
        </div>
      </div>
    </>
  );
});

function ImagePng({ gradient }) {
  const [width, setWidth] = useState(gradient.length);
  const canvasRef = useRef(null);
  const [data, setData] = useState();

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    for (let i = 0; i < gradient.length; i++) {
      ctx.fillStyle = conv.rgbCssProp(conv.rgb4ToRgb8(gradient[i]));
      ctx.fillRect(0, i, width, i);
    }
    setData(canvasRef.current.toDataURL());
  }, [gradient, width]);

  return (
    <>
      <div className="Output__actions">
        <canvas
          style={{ display: "none" }}
          ref={canvasRef}
          width={width}
          height={gradient.length}
        />
        <Button iconLeft={<FaDownload />} href={data} download="gradient.png">
          Download
        </Button>
        <span>
          <label htmlFor="Output-width">Width: </label>
          <input
            id="Output-width"
            type="number"
            min="1"
            max="3000"
            value={width}
            onChange={e => setWidth(parseInt(e.target.value))}
          />
        </span>
      </div>
    </>
  );
}

function CopyLink({ code }) {
  return (
    <Button
      iconLeft={<FaCopy />}
      onClick={() => {
        navigator.clipboard.writeText(code);
        document.body.classList.add("codeCopied");
        setTimeout(() => {
          document.body.classList.remove("codeCopied");
        }, 1);
      }}
    >
      Copy to clipboard
    </Button>
  );
}

function DownloadLink({
  data,
  filename,
  mimetype = "text/plain;charset=utf-8"
}) {
  const codeHref = `data:${mimetype},` + encodeURIComponent(data);
  return (
    <Button iconLeft={<FaDownload />} href={codeHref} download={filename}>
      Download
    </Button>
  );
}

const Code = ({ language, code }) => {
  return (
    <SyntaxHighlighter
      language={language}
      style={a11yDark}
      wrapLines
      wrapLongLines
    >
      {code}
    </SyntaxHighlighter>
  );
};

export default Output;
