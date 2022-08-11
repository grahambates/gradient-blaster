import React, { useEffect } from "react";
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

const selectPaletteData = createSelector(selectGradient, gradient =>
  formatData(gradient, { rowSize: 8 })
);

const selectUrl = createSelector(selectPresentData, encodeUrlQuery);

const baseUrl = window.location.href.split("?")[0];

function Output() {
  const paletteData = useSelector(selectPaletteData);
  const query = useSelector(selectUrl);

  useEffect(() => {
    window.history.replaceState({}, null, window.location.pathname + query);
  }, [query]);

  return (
    <div className="Output">
      <pre className="Output__pre">
        ; {baseUrl + query + "\n" + paletteData}
      </pre>
    </div>
  );
}

export default Output;
