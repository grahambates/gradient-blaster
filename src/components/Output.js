import React from "react";
import { useSelector } from "react-redux";

import * as conv from "../lib/colorConvert";
import { selectGradient } from "../store";

function Output() {
  const gradient = useSelector(selectGradient);
  return (
    <pre>
      {JSON.stringify(
        gradient.map(n => conv.rgb4ToHex(n)),
        null,
        2
      )}
    </pre>
  );
}

export default Output;
