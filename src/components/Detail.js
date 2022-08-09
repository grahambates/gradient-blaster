import React, { useCallback } from "react";
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

function Detail() {
  const dispatch = useDispatch();
  const { steps } = useSelector(selectOptions);
  const points = useSelector(selectPoints);
  const selectedIndex = useSelector(selectSelectedIndex);

  const selectedPoint = points[selectedIndex];

  const handleMove = useCallback(
    (index, newY) => {
      const maxY = steps - 1;
      const pos = Math.min(Math.max(newY, 0), maxY) / maxY;
      dispatch(setPos({ index, pos }));
    },
    [steps, dispatch]
  );

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
            onChange={e => handleMove(selectedIndex, e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={() => dispatch(removePoint(selectedIndex))}
        >
          Remove
        </button>
      </div>
      <Picker
        hsv={selectedPoint.color}
        onChange={color => dispatch(setColor({ index: selectedIndex, color }))}
      />
    </div>
  );
}

export default Detail;
