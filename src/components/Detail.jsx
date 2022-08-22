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
import { selectOptions, selectDepth } from "../store/options";
import { clamp } from "../lib/colorConvert";
import Picker from "./Picker";
import Button from "./Button";

function Detail() {
  const dispatch = useDispatch();
  const { steps } = useSelector(selectOptions);
  const depth = useSelector(selectDepth);
  const points = useSelector(selectPoints);
  const selectedIndex = useSelector(selectSelectedIndex);

  const selectedPoint = points[selectedIndex];

  const handleMove = (newY) => {
    const maxY = steps - 1;
    const pos = clamp(newY, 0, maxY) / maxY;
    dispatch(setPos(pos));
  };

  const [hex, setHex] = useState("");

  useEffect(() => {
    const rgb = conv.reduceBits(conv.hsvToRgb(selectedPoint.color), depth);
    if (depth <= 4) {
      setHex(conv.encodeHex3(rgb));
    } else {
      setHex(conv.encodeHex6(rgb));
    }
  }, [selectedPoint.color, depth]);

  const rgb = conv.hsvToRgb(selectedPoint.color);
  const color = conv.rgbCssProp(conv.quantize(rgb, depth));
  const light = conv.luminance(rgb) > 128;

  const classes = ["Detail__header"];
  if (light) {
    classes.push("Detail__header--light");
  }

  const handleChangeColor = useCallback(
    (color) => dispatch(setColor(color)),
    [dispatch]
  );

  let hexPattern;
  if (depth === 3) {
    hexPattern = "[0-7]{3}";
  } else if (depth === 4) {
    hexPattern = "[0-9a-f]{3}";
  } else {
    hexPattern = "[0-9a-f]{6}";
  }

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
              maxLength={depth <= 4 ? 3 : 6}
              pattern={hexPattern}
              onChange={(e) => {
                const newHex = e.target.value;
                setHex(newHex);
                if (!newHex || e.target.validity.patternMismatch) {
                  return;
                }
                if (depth <= 4) {
                  const newRgb = conv.decodeHex3(newHex);
                  dispatch(
                    setColor(conv.rgbToHsv(conv.restoreBits(newRgb, depth)))
                  );
                } else {
                  const newRgb = conv.decodeHex6(newHex);
                  dispatch(setColor(conv.rgbToHsv(newRgb)));
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
