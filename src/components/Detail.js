import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as conv from "../lib/colorConvert";

import "./Detail.css";
import {
  removePoint,
  setPos,
  setColor,
  selectSelectedIndex,
  selectPoints,
  previousPoint,
  nextPoint
} from "../store/points";
import { selectOptions } from "../store/options";

import Picker from "./Picker";
import { clamp } from "../lib/colorConvert";

function Detail() {
  const dispatch = useDispatch();
  const { steps } = useSelector(selectOptions);
  const points = useSelector(selectPoints);
  const selectedIndex = useSelector(selectSelectedIndex);

  const selectedPoint = points[selectedIndex];

  const handleMove = newY => {
    const maxY = steps - 1;
    const pos = clamp(newY, 0, maxY) / maxY;
    dispatch(setPos(pos));
  };

  const [hex, setHex] = useState();

  const setRgb4 = newRgb4 => {
    dispatch(setColor(conv.rgbToHsv(conv.rgb4ToRgb8(newRgb4))));
  };

  useEffect(() => {
    const rgb4 = conv.rgb8ToRgb4(conv.hsvToRgb(selectedPoint.color));
    setHex(conv.rgb4ToHex(rgb4));
  }, [selectedPoint.color]);

  const rgb = conv.hsvToRgb(selectedPoint.color);
  const color = conv.rgbCssProp(conv.quantize4Bit(rgb));
  const light = conv.luminance(rgb) > 128;

  return (
    <section className="Detail">
      <header
        className="Detail__header"
        style={{ background: color, color: light ? "inherit" : "white" }}
      >
        <div className="Detail__nav">
          Point:{" "}
          <button
            onClick={() => dispatch(previousPoint())}
            disabled={!selectedIndex}
          >
            &lt;
          </button>{" "}
          {selectedIndex + 1}/{points.length}{" "}
          <button
            onClick={() => dispatch(nextPoint())}
            disabled={selectedIndex >= points.length - 1}
          >
            &gt;
          </button>
        </div>
        <button
          type="button"
          disabled={points.length < 3}
          onClick={() => dispatch(removePoint())}
        >
          Remove
        </button>
      </header>
      <div className="Detail__body">
        <div className="Detail__info">
          <div className="Detail__color">
            <label htmlFor="Detail-hex">Color: $</label>
            <input
              id="Detail-hex"
              className="Detail__hexInput"
              value={hex}
              onChange={e => {
                const newHex = e.target.value;
                setHex(newHex);
                if (newHex.match(/^[0-9a-f]{3}$/i)) {
                  const newRgb4 = conv.hexToRgb4(newHex);
                  setRgb4(newRgb4);
                }
              }}
            />
          </div>
          <div className="Detail__position">
            <label htmlFor="position">Position: </label>
            <input
              id="position"
              type="number"
              min={0}
              max={steps - 1}
              value={Math.round(selectedPoint.pos * (steps - 1))}
              onChange={e => handleMove(e.target.value)}
            />
          </div>
        </div>
        <Picker
          hsv={selectedPoint.color}
          onChange={color => dispatch(setColor(color))}
        />
      </div>
    </section>
  );
}

export default Detail;
