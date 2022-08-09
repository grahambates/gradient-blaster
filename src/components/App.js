import React, { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import "./App.css";
import { buildGradient } from "../lib/gradient";
import * as conv from "../lib/colorConvert";
import { addPoint, removePoint, setPos, setColor } from "../store/points";
import Picker from "./Picker";
import Gradient from "./Gradient";
import Options from "./Options";

function App() {
  const dispatch = useDispatch();
  const options = useSelector(state => state.options);
  const points = useSelector(state => state.points);
  const { steps, scale, blendMode, ditherMode, ditherAmount } = options;

  const [selected, setSelected] = useState(0);
  const [gradient, setGradient] = useState();

  const activePoint = points[selected];
  const height = steps * scale;

  const handleMove = useCallback(
    (index, newY) => {
      const maxY = height - scale;
      const pos = Math.min(Math.max(newY, 0), maxY) / maxY;
      dispatch(setPos({ index, pos }));
    },
    [height, scale, dispatch]
  );

  const handleColorChange = useCallback(
    color => dispatch(setColor({ index: selected, color })),
    [selected, dispatch]
  );

  const handleRemove = useCallback(
    index => {
      dispatch(removePoint(index));
      setSelected(Math.max(index - 1, 0));
    },
    [dispatch]
  );

  const handleAdd = useCallback(
    y => {
      const scaledY = Math.round(y / scale);
      const sample = gradient[scaledY];
      const newPoint = {
        pos: y / (height - 1),
        color: conv.rgbToHsv(conv.rgb4ToRgb8(sample))
      };
      dispatch(addPoint(newPoint));
    },
    [scale, height, gradient, dispatch]
  );

  // Select newest when added
  const [count, setCount] = useState(points.length);
  useEffect(() => {
    const newCount = points.length;
    if (newCount > count) {
      const newestId = Math.max(...points.map(p => p.id));
      const newestIndex = points.findIndex(p => p.id === newestId);
      setSelected(newestIndex);
    }
    if (newCount !== count) {
      setCount(newCount);
    }
  }, [points, count]);

  useEffect(() => {
    const newGradient = buildGradient(
      points,
      steps,
      blendMode,
      ditherMode,
      ditherAmount
    );
    setGradient(newGradient);
  }, [points, steps, scale, blendMode, ditherMode, ditherAmount]);

  return (
    <div className="App">
      <div className="App__top">
        <Options />
      </div>

      <div className="App__main">
        <div className="App__left">
          {activePoint && (
            <div className="Detail">
              <div className="Detail__info">
                <div className="Detail__nav">
                  <button
                    onClick={() => setSelected(selected - 1)}
                    disabled={!selected}
                  >
                    &lt;
                  </button>{" "}
                  {selected + 1}/{points.length}{" "}
                  <button
                    onClick={() => setSelected(selected + 1)}
                    disabled={selected >= points.length - 1}
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
                    value={Math.round(activePoint.pos * (steps - 1))}
                    onChange={e => handleMove(selected, e.target.value * scale)}
                  />
                </div>
                <button type="button" onClick={() => handleRemove(selected)}>
                  Remove
                </button>
              </div>
              <Picker hsv={activePoint.color} onChange={handleColorChange} />
            </div>
          )}
        </div>

        <div className="App__middle">
          <Gradient
            height={height}
            scale={scale}
            points={points}
            selected={selected}
            onAdd={handleAdd}
            onMove={handleMove}
            onRemove={handleRemove}
            onSelect={setSelected}
            gradient={gradient}
          />
        </div>

        <div className="App__right">
          {gradient && <Output gradient={gradient} />}
        </div>
      </div>
    </div>
  );
}

function Output({ gradient }) {
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

export default App;
