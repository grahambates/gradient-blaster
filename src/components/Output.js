import React from "react";
import { useSelector } from "react-redux";

import "./Output.css";
import * as conv from "../lib/colorConvert";
import { selectGradient } from "../store";
import { createSelector } from "@reduxjs/toolkit";

const formatData = (values, options = {}) => {
  const opts = {
    rowSize: 16,
    ...options
  };
  let output = [];
  for (let i in values) {
    output += i % opts.rowSize ? "," : `\n  dc.w  `;
    output += "$" + conv.rgb4ToHex(values[i]);
  }
  return output.substring(1);
};

const selectPaletteData = createSelector(selectGradient, gradient =>
  formatData(gradient, { rowSize: 12 })
);

function Output() {
  const data = useSelector(selectPaletteData);
  return <pre className="Output">{data}</pre>;
}

export default Output;
