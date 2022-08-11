import React from "react";
import { useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";

import "./Output.css";
import * as conv from "../lib/colorConvert";
import { selectGradient, selectPresentData } from "../store";
import { encodeUrlQuery } from "../lib/url";

const formatData = (values, options = {}) => {
  const opts = {
    rowSize: 16,
    ...options
  };
  let output = [];
  for (let i in values) {
    output += i % opts.rowSize ? "," : `\n\tdc.w `;
    output += "$" + conv.rgb4ToHex(values[i]);
  }
  return output.substring(1);
};

const selectPaletteData = createSelector(selectGradient, gradient =>
  formatData(gradient, { rowSize: 12 })
);

const baseUrl = window.location.href.split("?")[0];

const selectUrl = createSelector(
  selectPresentData,
  data => baseUrl + encodeUrlQuery(data)
);

function Output() {
  const paletteData = useSelector(selectPaletteData);
  const url = useSelector(selectUrl);
  return (
    <div>
      <pre className="Output">; {url + "\n" + paletteData}</pre>
    </div>
  );
}

export default Output;
