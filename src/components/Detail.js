import React, { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaTrash, FaChevronLeft, FaChevronRight } from "react-icons/fa";

import * as conv from "../lib/colorConvert";
import "./Detail.css";
import {
  removePoint,
  setPos,
  setColor,
  selectSelectedIndex,
  selectPoints,
  previousPoint,
  nextPoint,
} from "../store/points";
import { selectOptions } from "../store/options";
import { clamp } from "../lib/colorConvert";
import Picker from "./Picker";
import Button from "./Button";

function Detail() {
  const dispatch = useDispatch();
  const { steps, depth } = useSelector(selectOptions);
  const points = useSelector(selectPoints);
  const selectedIndex = useSelector(selectSelectedIndex);

  const selectedPoint = points[selectedIndex];

  const handleMove = (newY) => {
    const maxY = steps - 1;
    const pos = clamp(newY, 0, maxY) / maxY;
    dispatch(setPos(pos));
  };

  const [hex, setHex] = useState();

  const setRgb4 = (newRgb4) => {
    dispatch(setColor(conv.rgbToHsv(conv.rgb4ToRgb8(newRgb4))));
  };
  const setRgb = (newRgb) => {
    dispatch(setColor(conv.rgbToHsv(newRgb)));
  };

  useEffect(() => {
    const rgb = conv.hsvToRgb(selectedPoint.color);
    if (depth === 4) {
      const rgb4 = conv.rgb8ToRgb4(rgb);
      setHex(conv.rgb4ToHex(rgb4));
    } else {
      setHex(conv.rgb8ToHex(rgb));
    }
  }, [selectedPoint.color, depth]);

  const rgb = conv.hsvToRgb(selectedPoint.color);
  const color = conv.rgbCssProp(conv.quantize4Bit(rgb));
  const light = conv.luminance(rgb) > 128;

  const classes = ["Detail__header"];
  if (light) {
    classes.push("Detail__header--light");
  }

  const handleChangeColor = useCallback(
    (color) => dispatch(setColor(color)),
    [dispatch]
  );

  return (
    <section className="Detail">
      <header className={classes.join(" ")} style={{ background: color }}>
        <div className="Detail__nav">
          Point:{" "}
          <Button
            minimal
            onClick={() => dispatch(previousPoint())}
            disabled={!selectedIndex}
          >
            <FaChevronLeft color={light ? "black" : "white"} />
          </Button>{" "}
          {selectedIndex + 1}/{points.length}{" "}
          <Button
            minimal
            onClick={() => dispatch(nextPoint())}
            disabled={selectedIndex >= points.length - 1}
          >
            <FaChevronRight color={light ? "black" : "white"} />
          </Button>
        </div>
        {points.length > 2 && (
          <Button
            iconLeft={<FaTrash />}
            minimal
            onClick={() => dispatch(removePoint())}
          >
            Remove
          </Button>
        )}
      </header>
      <div className="Detail__body">
        <div className="Detail__info">
          <div className="Detail__color">
            <label htmlFor="Detail-hex">Color: $</label>
            <input
              id="Detail-hex"
              type="text"
              className="Detail__hexInput"
              value={hex}
              maxLength={depth === 4 ? 3 : 6}
              onChange={(e) => {
                const newHex = e.target.value;
                setHex(newHex);
                if (depth === 4 && newHex.match(/^[0-9a-f]{3}$/i)) {
                  const newRgb4 = conv.hexToRgb4(newHex);
                  setRgb4(newRgb4);
                }
                if (depth === 8 && newHex.match(/^[0-9a-f]{6}$/i)) {
                  const newRgb = conv.hexToRgb8(newHex);
                  setRgb(newRgb);
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
              onChange={(e) => handleMove(e.target.value)}
            />
          </div>
        </div>
        <Picker
          hsv={selectedPoint.color}
          depth={depth}
          onChange={handleChangeColor}
        />
      </div>
    </section>
  );
}

export default Detail;
