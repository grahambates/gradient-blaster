import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";

import "./Output.css";
import * as conv from "../lib/colorConvert";
import { selectGradient, selectPresentData } from "../store";
import { encodeUrlQuery } from "../lib/url";

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

function Output() {
  const paletteData = useSelector(selectPaletteData);
  const paletteDataHref = useSelector(selectPaletteDataHref);
  const query = useSelector(selectUrl);

  useEffect(() => {
    window.history.replaceState({}, null, window.location.pathname + query);
  }, [query]);

  const codeRef = useRef(null);

  const handleCopy = () => {
    const copyText = codeRef.current;
    copyText.select();
    navigator.clipboard.writeText(copyText.value);
  };

  return (
    <div className="Output">
      <div className="Output__header">
        <button onClick={handleCopy}>Copy to clipboard</button>{" "}
        <a href={paletteDataHref} download="gradient.s">
          Download source
        </a>
      </div>
      <textarea
        ref={codeRef}
        className="Output__code"
        value={paletteData}
        onFocus={e => e.target.select()}
      />
    </div>
  );
}

export default Output;
