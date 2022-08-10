import React from "react";
import { useSelector } from "react-redux";

import "./Output.css";
import * as conv from "../lib/colorConvert";
import { selectGradient } from "../store";

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

function Output() {
  const gradient = useSelector(selectGradient);
  return <pre className="Output">{formatData(gradient, { rowSize: 12 })}</pre>;
}

export default Output;
