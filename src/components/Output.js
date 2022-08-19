import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import asmatmel from "react-syntax-highlighter/dist/esm/languages/prism/asmatmel";
import c from "react-syntax-highlighter/dist/esm/languages/prism/c";
import vbnet from "react-syntax-highlighter/dist/esm/languages/prism/vbnet";
import { FaCopy, FaDownload } from "react-icons/fa";

import "./Output.css";
import * as conv from "../lib/colorConvert";
import * as output from "../lib/output";
import { selectGradient, selectPresentData } from "../store";
import { selectTarget } from "../store/options";
import { encodeUrlQuery } from "../lib/url";
import Button from "./Button";

SyntaxHighlighter.registerLanguage("asmatmel", asmatmel);
SyntaxHighlighter.registerLanguage("c", c);
SyntaxHighlighter.registerLanguage("vbnet", vbnet);

const DEBOUNCE_DELAY = 300;

const baseUrl = window.location.href.split("?")[0];

function Output() {
  const [outputFormat, setOutputFormat] = useState("copperList");
  const present = useSelector(selectPresentData);
  const gradient = useSelector(selectGradient);
  const target = useSelector(selectTarget);

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

  useEffect(() => {
    setOutputFormat(target.outputs[0]);
  }, [target]);

  return (
    <div className="Output">
      <div className="Output__format">
        <label htmlFor="Output-format">Output: </label>{" "}
        <select
          id="Output-format"
          value={outputFormat}
          onChange={(e) => setOutputFormat(e.target.value)}
        >
          {target.outputs.map((key) => (
            <option value={key} key={key}>
              {output.formats[key].label}
            </option>
          ))}
        </select>
      </div>
      {outputFormat === "copperList" && (
        <CopperList
          gradient={debouncedGradient}
          query={debouncedQuery}
          target={target}
        />
      )}
      {outputFormat === "paletteAsm" && (
        <PaletteAsm
          gradient={debouncedGradient}
          query={debouncedQuery}
          target={target}
        />
      )}
      {outputFormat === "paletteC" && (
        <PaletteC
          gradient={debouncedGradient}
          query={debouncedQuery}
          target={target}
        />
      )}
      {(outputFormat === "paletteAmos" || outputFormat === "paletteStos") && (
        <PaletteAmos
          gradient={debouncedGradient}
          query={debouncedQuery}
          target={target}
        />
      )}
      {outputFormat === "paletteBin" && (
        <PaletteBin gradient={debouncedGradient} target={target} />
      )}
      {outputFormat === "imagePng" && (
        <ImagePng gradient={debouncedGradient} target={target} />
      )}
    </div>
  );
}

const PaletteAsm = React.memo(({ gradient, query, target }) => {
  const defaultLength = target.id === "atariFalcon" ? 4 : 8;
  const [rowSize, setRowSize] = useState(defaultLength);
  const [label, setLabel] = useState("Gradient");
  const formatted = output.formatPaletteAsm(gradient, {
    rowSize,
    target,
    label,
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
          <label htmlFor="Output-rowSize">Values per row: </label>
          <input
            id="Output-rowSize"
            type="number"
            min="1"
            max="1000"
            value={rowSize}
            onChange={(e) => setRowSize(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="Output-label">Label: </label>
          <input
            id="Output-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>
      </div>
    </>
  );
});

const PaletteC = React.memo(({ gradient, query, target }) => {
  const defaultLength = target.id === "atariFalcon" ? 4 : 8;
  const [rowSize, setRowSize] = useState(defaultLength);
  const [varName, setVarName] = useState("gradient");
  const formatted = output.formatPaletteC(gradient, {
    rowSize,
    varName,
    target,
  });
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
            onChange={(e) => setRowSize(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="Output-varName">Variable name: </label>
          <input
            id="Output-varName"
            type="text"
            value={varName}
            onChange={(e) => setVarName(e.target.value)}
          />
        </div>
      </div>
    </>
  );
});

const PaletteAmos = React.memo(({ gradient, query, target }) => {
  const defaultLength = target.id === "atariFalcon" ? 4 : 8;
  const [rowSize, setRowSize] = useState(defaultLength);
  const [label, setLabel] = useState("Gradient");
  const formatted = output
    .formatPaletteAsm(gradient, {
      rowSize,
      label,
      target,
    })
    .replace(/\tdc.w/g, "Data");
  const code = "Rem " + baseUrl + query + "\n" + formatted;

  return (
    <>
      <div className="Output__actions">
        <CopyLink code={code} />
        <DownloadLink data={code} filename="gradient-amos.txt" />
      </div>
      <Code language="vbnet" code={code} />

      <div className="Output__formatOptions">
        <div>
          <label htmlFor="Output-rowSize">Values per row: </label>
          <input
            id="Output-rowSize"
            type="number"
            min="1"
            max="1000"
            value={rowSize}
            onChange={(e) => setRowSize(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="Output-varName">Variable name: </label>
          <input
            id="Output-varName"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>
      </div>
    </>
  );
});

const PaletteBin = React.memo(({ gradient, target }) => {
  const bytes = output.gradientToBytes(gradient, target);
  return (
    <div className="Output__actions">
      <DownloadLink
        data={output.base64Encode(bytes)}
        filename="gradient.bin"
        mimetype="application/octet-stream;base64"
      />
    </div>
  );
});

const CopperList = React.memo(({ gradient, query, target }) => {
  const [startLine, setStartLine] = useState(0x2b);
  const [colorIndex, setColorIndex] = useState(0);
  const [varName, setVarName] = useState("Gradient");
  const [waitStart, setWaitStart] = useState(true);
  const [endList, setEndList] = useState(true);

  const formatted = output.buildCopperList(gradient, {
    varName,
    colorIndex,
    startLine,
    waitStart,
    endList,
    target,
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
            onChange={(e) => setStartLine(parseInt(e.target.value, 16))}
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
            onChange={(e) => setColorIndex(parseInt(e.target.value))}
          />
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={waitStart}
              onChange={(e) => setWaitStart(e.target.checked)}
            />{" "}
            Wait for start
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              checked={endList}
              onChange={(e) => setEndList(e.target.checked)}
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
            onChange={(e) => setVarName(e.target.value)}
          />
        </div>
      </div>
    </>
  );
});

function ImagePng({ gradient, target }) {
  const [width, setWidth] = useState(gradient.length);
  const canvasRef = useRef(null);
  const [data, setData] = useState();

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    for (let i = 0; i < gradient.length; i++) {
      let color = conv.quantize(gradient[i], target.depth);
      ctx.fillStyle = conv.rgbCssProp(color);
      ctx.fillRect(0, i, width, i);
    }
    setData(canvasRef.current.toDataURL());
  }, [gradient, width, target]);

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
            onChange={(e) => setWidth(parseInt(e.target.value))}
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
  mimetype = "text/plain;charset=utf-8",
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
