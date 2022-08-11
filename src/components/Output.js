import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import asmatmel from "react-syntax-highlighter/dist/esm/languages/prism/asmatmel";

import "./Output.css";
import * as conv from "../lib/colorConvert";
import { selectGradient, selectPresentData } from "../store";
import { encodeUrlQuery } from "../lib/url";

SyntaxHighlighter.registerLanguage("asmatmel", asmatmel);

const DEBOUNCE_DELAY = 100;

const formatData = (values, { rowSize = 16 }) => {
  let output = "";
  for (let i in values) {
    output += i % rowSize ? "," : `\n\tdc.w `;
    output += "$" + conv.rgb4ToHex(values[i]);
  }
  return output.substring(1);
};

const baseUrl = window.location.href.split("?")[0];

const selectUrl = createSelector(selectPresentData, encodeUrlQuery);

const selectPaletteData = createSelector(
  selectGradient,
  selectUrl,
  (gradient, query) => {
    const formatted = formatData(gradient, { rowSize: 8 });
    return "; " + baseUrl + query + "\n" + formatted;
  }
);
const selectPaletteDataHref = createSelector(
  selectPaletteData,
  output => "data:text/plain;charset=utf-8," + encodeURIComponent(output)
);

let timeout;

function Output() {
  const code = useSelector(selectPaletteData);
  const codeHref = useSelector(selectPaletteDataHref);
  const query = useSelector(selectUrl);

  useEffect(() => {
    window.history.replaceState({}, null, window.location.pathname + query);
  }, [query]);

  const [debouncedCode, setDebouncedCode] = useState(code);

  useEffect(() => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      setDebouncedCode(code);
    }, DEBOUNCE_DELAY);
  }, [code, setDebouncedCode]);

  return (
    <div className="Output">
      <div className="Output__header">
        <button onClick={() => navigator.clipboard.writeText(code)}>
          Copy to clipboard
        </button>{" "}
        <a href={codeHref} download="gradient.s">
          Download source
        </a>
      </div>
      <SyntaxHighlighter
        language="asmatmel"
        style={a11yDark}
        wrapLines
        wrapLongLines
      >
        {debouncedCode}
      </SyntaxHighlighter>
    </div>
  );
}

export default Output;
