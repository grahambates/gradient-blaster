import React from "react";
import { useSelector, useDispatch } from "react-redux";

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

  return (
    <div className="Detail">
      <div className="Detail__info">
        <div className="Detail__nav">
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
        <div className="Detail__position">
          <label htmlFor="position">Pos: </label>
          <input
            id="position"
            type="number"
            min={0}
            max={steps - 1}
            value={Math.round(selectedPoint.pos * (steps - 1))}
            onChange={e => handleMove(e.target.value)}
          />
        </div>
        <button type="button" onClick={() => dispatch(removePoint())}>
          Remove
        </button>
      </div>
      <Picker
        hsv={selectedPoint.color}
        onChange={color => dispatch(setColor(color))}
      />
    </div>
  );
}

export default Detail;
