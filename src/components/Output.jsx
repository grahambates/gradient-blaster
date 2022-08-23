import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { FaCopy, FaDownload } from "react-icons/fa";

import "./Output.css";
import { selectGradient } from "../store";
import { selectOptions, selectTarget } from "../store/options";
import * as conv from "../lib/colorSpace";
import * as output from "../lib/output";
import { encodeUrlQuery } from "../lib/url";
import { interlaceGradient } from "../lib/gradient";
import Button from "./Button";
import Code from "./Code";
import { selectPoints } from "../store/points";

const DEBOUNCE_DELAY = 100;

const baseUrl = window.location.href.split("?")[0];

function Output() {
  const [outputFormat, setOutputFormat] = useState("copperList");
  const options = useSelector(selectOptions);
  const points = useSelector(selectPoints);
  const gradient = useSelector(selectGradient);
  const target = useSelector(selectTarget);

  // Delay update to output for performance i.e. dont generate 1000s of times while dragging
  const [debouncedGradient, setDebouncedGradient] = useState(gradient);
  const [debouncedQuery, setDebouncedQuery] = useState(
    encodeUrlQuery({ points, options })
  );
  const timeout = useRef(0);

  useEffect(() => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      const query = encodeUrlQuery({ points, options });

      setDebouncedQuery(query);
      setDebouncedGradient(gradient);
      // Update URL path
      window.history.replaceState({}, null, window.location.pathname + query);
    }, DEBOUNCE_DELAY);
  }, [points, options, gradient]);

  useEffect(() => {
    if (!target.outputs.includes(outputFormat)) {
      setOutputFormat(target.outputs[0]);
    }
  }, [target, outputFormat]);

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
      {outputFormat === "tableAsm" && (
        <Table
          gradient={debouncedGradient}
          query={debouncedQuery}
          target={target}
          lang="asm"
        />
      )}
      {outputFormat === "tableC" && (
        <Table
          gradient={debouncedGradient}
          query={debouncedQuery}
          target={target}
          lang="c"
        />
      )}
      {(outputFormat === "tableAmos" || outputFormat === "tableStos") && (
        <Table
          gradient={debouncedGradient}
          query={debouncedQuery}
          target={target}
          lang="amos"
        />
      )}
      {outputFormat === "tableBin" && (
        <TableBin gradient={debouncedGradient} target={target} />
      )}
      {outputFormat === "imagePng" && (
        <ImagePng gradient={debouncedGradient} target={target} />
      )}
    </div>
  );
}

const Table = React.memo(({ gradient, query, target, lang }) => {
  let commentPrefix, fn, ext;
  switch (lang) {
    case "c":
      commentPrefix = "// ";
      fn = output.formatTableC;
      ext = "c";
      break;
    case "asm":
      commentPrefix = "; ";
      fn = output.formatTableAsm;
      ext = "s";
      break;
    case "amos":
      commentPrefix = "Rem ";
      fn = (gradient, opts) =>
        output.formatTableAsm(gradient, opts).replace(/\tdc.w/g, "Data");
      ext = "txt";
      break;
    default:
  }

  const defaultLength = target.id === "atariFalcon" ? 4 : 8;
  const [rowSize, setRowSize] = useState(defaultLength);
  const [varName, setVarName] = useState("Gradient");
  const [varNameA, setVarNameA] = useState("GradientOdd");
  const [varNameB, setVarNameB] = useState("GradientEven");

  useEffect(() => {
    setRowSize(defaultLength);
  }, [defaultLength, setRowSize]);

  let code = commentPrefix + baseUrl + query + "\n";
  if (target.interlaced) {
    const [odd, even] = interlaceGradient(gradient, target.depth);
    code += fn(odd, {
      rowSize,
      varName: varNameA,
      target,
    });
    code += "\n";
    code += fn(even, {
      rowSize,
      varName: varNameB,
      target,
    });
  } else {
    code += fn(gradient, {
      rowSize,
      varName,
      target,
    });
  }

  return (
    <>
      <div className="Output__actions">
        <CopyLink code={code} />
        <DownloadLink data={code} filename={"gradient." + ext} />
      </div>
      <Code code={code} />

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
        {target.interlaced ? (
          <div className="Output__labels">
            <div>
              <label htmlFor="Output-varNameA">Label (odd):</label>
              <input
                id="Output-varNameA"
                type="text"
                value={varNameA}
                onChange={(e) => setVarNameA(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="Output-varNameB">Label (even):</label>
              <input
                id="Output-varNameB"
                type="text"
                value={varNameB}
                onChange={(e) => setVarNameB(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div>
            <label htmlFor="Output-varName">Label: </label>
            <input
              id="Output-varName"
              type="text"
              value={varName}
              onChange={(e) => setVarName(e.target.value)}
            />
          </div>
        )}
      </div>
    </>
  );
});

const TableBin = React.memo(({ gradient, target }) => {
  if (target.interlaced) {
    const [odd, even] = interlaceGradient(gradient, target.depth);
    const oddBytes = output.gradientToBytes(odd, target);
    const evenBytes = output.gradientToBytes(even, target);
    return (
      <div className="Output__actions">
        <DownloadLink
          data={output.base64Encode(oddBytes)}
          filename="gradientOdd.bin"
          mimetype="application/octet-stream;base64"
          label="Download (odd)"
        />
        <DownloadLink
          data={output.base64Encode(evenBytes)}
          filename="gradientEven.bin"
          mimetype="application/octet-stream;base64"
          label="Download (even)"
        />
      </div>
    );
  } else {
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
  }
});

const CopperList = React.memo(({ gradient, query, target }) => {
  const [startLine, setStartLine] = useState(0x2b);
  const [colorIndex, setColorIndex] = useState(0);
  const [varName, setVarName] = useState("Gradient");
  const [varNameA, setVarNameA] = useState("GradientOdd");
  const [varNameB, setVarNameB] = useState("GradientEven");
  const [waitStart, setWaitStart] = useState(true);
  const [endList, setEndList] = useState(true);

  let code = "; " + baseUrl + query + "\n";
  if (target.interlaced) {
    const [odd, even] = interlaceGradient(gradient, target.depth);
    code += output.buildCopperList(odd, {
      varName: varNameA,
      colorIndex,
      startLine,
      waitStart,
      endList,
      target,
    });
    code += "\n";
    code += output.buildCopperList(even, {
      varName: varNameB,
      colorIndex,
      startLine,
      waitStart,
      endList,
      target,
    });
  } else {
    code += output.buildCopperList(gradient, {
      varName,
      colorIndex,
      startLine,
      waitStart,
      endList,
      target,
    });
  }

  return (
    <>
      <div className="Output__actions">
        <CopyLink code={code} />
        <DownloadLink data={code} filename="gradient.s" />
      </div>
      <Code code={code} />

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
        {target.interlaced ? (
          <div className="Output__labels">
            <div>
              <label htmlFor="Output-varNameA">Label (odd):</label>
              <input
                id="Output-varNameA"
                type="text"
                value={varNameA}
                onChange={(e) => setVarNameA(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="Output-varNameB">Label (even):</label>
              <input
                id="Output-varNameB"
                type="text"
                value={varNameB}
                onChange={(e) => setVarNameB(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div>
            <label htmlFor="Output-varName">Label: </label>
            <input
              id="Output-varName"
              type="text"
              value={varName}
              onChange={(e) => setVarName(e.target.value)}
            />
          </div>
        )}
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
  label = "Download",
}) {
  const codeHref = `data:${mimetype},` + encodeURIComponent(data);
  return (
    <Button iconLeft={<FaDownload />} href={codeHref} download={filename}>
      {label}
    </Button>
  );
}

export default Output;
