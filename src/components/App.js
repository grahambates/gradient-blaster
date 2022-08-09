import "./App.css";
import { useCallback, useEffect, useState } from "react";
import { buildGradient } from "../lib/gradient";
import * as conv from "../lib/colorConvert";
import Picker from "./Picker";
import Gradient from "./Gradient";

// Assign unique IDs to points
let id = 0;
const pointId = () => id++;

const initialPoints = [
  { id: pointId(), pos: 0, color: conv.rgbToHsv([255, 255, 0]) },
  { id: pointId(), pos: 1, color: conv.rgbToHsv([0, 0, 255]) },
];

function App() {
  const [steps, setSteps] = useState(256);
  const [scale, setScale] = useState(2);
  const [blendMode, setBlendMode] = useState("perceptual");
  const [ditherMode, setDitherMode] = useState("blueNoise");
  const [ditherAmount, setDitherAmount] = useState(50);
  const [points, setPoints] = useState(initialPoints);

  const [selected, setSelected] = useState(0);
  const [gradient, setGradient] = useState();

  const activePoint = points[selected];
  const height = steps * scale;

  const handleMove = useCallback(
    (index, newY) => {
      const maxY = height - scale;
      const pos = Math.min(Math.max(newY, 0), maxY) / maxY;
      setPoints((points) => {
        const newPoints = [...points];
        newPoints[index] = {
          ...points[index],
          pos,
        };
        return newPoints;
      });
    },
    [height, scale]
  );

  const handleColorChange = useCallback(
    (color) => {
      setPoints((points) => {
        const newPoints = [...points];
        newPoints[selected] = {
          ...points[selected],
          color,
        };
        return newPoints;
      });
    },
    [selected]
  );

  const handleRemove = useCallback((index) => {
    setPoints((points) => {
      const newPoints = [...points];
      newPoints.splice(index, 1);
      return newPoints;
    });
    setSelected(Math.max(index - 1, 0));
  }, []);

  const handleAdd = useCallback(
    (y) => {
      setPoints((points) => {
        const scaledY = Math.round(y / scale);
        const gradient = buildGradient(points, steps, blendMode);
        const sample = gradient[scaledY];
        const newPoint = {
          id: pointId(),
          pos: y / (height - 1),
          initialDrag: true,
          color: conv.rgbToHsv(conv.rgb4ToRgb8(sample)),
        };

        const newPoints = [...points, newPoint].sort((a, b) => a.pos - b.pos);
        setSelected(newPoints.findIndex((p) => p === newPoint));
        return newPoints;
      });
    },
    [scale, steps, blendMode, height]
  );

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
        <div className="Options">
          <div>
            <label htmlFor="steps">Steps: </label>
            <input
              id="steps"
              type="number"
              min={0}
              max={2000}
              value={steps}
              onChange={(e) => setSteps(parseInt(e.target.value))}
            />
          </div>

          <div>
            <label htmlFor="steps">Preview scale: </label>
            <input
              id="scale"
              type="number"
              min={1}
              max={20}
              value={scale}
              onChange={(e) => setScale(parseInt(e.target.value))}
            />
          </div>

          <div>
            <label htmlFor="blendMode">Blend mode: </label>
            <select
              id="blendMode"
              value={blendMode}
              onChange={(e) => setBlendMode(e.target.value)}
            >
              <option value="perceptual">Perceptual</option>
              <option value="lab">LAB</option>
              <option value="linear">Linear RGB</option>
            </select>
          </div>

          <div>
            <label htmlFor="ditherMode">Dither mode: </label>
            <select
              id="ditherMode"
              value={ditherMode}
              onChange={(e) => setDitherMode(e.target.value)}
            >
              <option value="off">Off</option>
              <option value="shuffle">Shuffle</option>
              <option value="errorDiffusion">Error diffusion</option>
              <option value="blueNoise">Blue noise</option>
              <option value="blueNoiseMono">Blue noise mono</option>
              <option value="goldenRatio">Golden ratio</option>
              <option value="goldenRatioMono">Golden ratio mono</option>
              <option value="whiteNoise">White noise</option>
              <option value="whiteNoiseMono">White noise mono</option>
              <option value="ordered">Ordered</option>
              <option value="orderedMono">Ordered mono</option>
            </select>
          </div>

          {!["off", "shuffle"].includes(ditherMode) && (
            <div>
              <label htmlFor="ditherAmount">Dither amount: </label>
              <input
                type="range"
                min={0}
                max={100}
                value={ditherAmount}
                onChange={(e) => setDitherAmount(parseInt(e.target.value))}
              />
              <input
                id="ditherAmount"
                type="number"
                min={0}
                max={100}
                value={ditherAmount}
                onChange={(e) => setDitherAmount(parseInt(e.target.value))}
              />
            </div>
          )}
        </div>
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
                    onChange={(e) =>
                      handleMove(selected, e.target.value * scale)
                    }
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
        gradient.map((n) => conv.rgb4ToHex(n)),
        null,
        2
      )}
    </pre>
  );
}

export default App;
