import "./App.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { buildGradient } from "./gradient";
import * as conv from "./colorConvert";

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
          <div className="Gradient">
            <Track height={height} onAdd={handleAdd}>
              {points.map((p, i) => (
                <Point
                  index={i}
                  key={p.id}
                  {...p}
                  y={p.pos * height}
                  selected={i === selected}
                  onMove={handleMove}
                  onSelect={setSelected}
                  onRemove={handleRemove}
                />
              ))}
            </Track>
            {gradient && <Preview gradient={gradient} scale={scale} />}
          </div>
        </div>

        <div className="App__right">
          {gradient && <Output gradient={gradient} />}
        </div>
      </div>
    </div>
  );
}

function Track({ height, children, onAdd }) {
  return (
    <div
      className="Track"
      style={{ height: height + "px" }}
      onMouseDown={(e) => {
        return onAdd(e.pageY - e.target.offsetTop);
      }}
    >
      {children}
    </div>
  );
}

function Preview({ gradient, scale }) {
  const width = 512;
  const canvasRef = useRef(null);
  const steps = gradient.length;

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");

    for (let i = 0; i < steps; i++) {
      ctx.fillStyle = conv.rgbCssProp(conv.rgb4ToRgb8(gradient[i]));
      ctx.fillRect(0, i * scale, width, scale);
    }
  }, [steps, scale, gradient]);

  return (
    <canvas
      className="Preview"
      ref={canvasRef}
      width={width}
      height={steps * scale}
    />
  );
}

function Point({
  index,
  y,
  color,
  selected,
  onMove,
  onSelect,
  onRemove,
  initialDrag,
}) {
  const rgb = conv.quantize4Bit(conv.hsvToRgb(color));

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(index);
    startDrag(e);
  };

  const startDrag = useCallback(
    (e) => {
      let offsetY, offsetX;
      if (e) {
        offsetY = e.clientY - y;
        offsetX = e.clientX;
      }

      const dragMove = (e) => {
        e.stopPropagation();
        if (offsetX === undefined) {
          offsetY = e.clientY - y;
          offsetX = e.clientX;
        }
        if (Math.abs(e.clientX - offsetX) > 30) {
          onRemove(index);
          dragStop();
        } else {
          onMove(index, e.clientY - offsetY);
        }
      };

      const dragStop = () => {
        document.removeEventListener("mousemove", dragMove);
        document.removeEventListener("mouseup", dragStop);
      };

      document.addEventListener("mousemove", dragMove);
      document.addEventListener("mouseup", dragStop);

      return dragStop;
    },
    [index, onMove, onRemove, y]
  );

  // Allow point to start in dragging state when added
  useEffect(() => {
    if (initialDrag) {
      return startDrag();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build class list:
  const classes = ["Point"];
  if (selected) {
    classes.push("selected");
  }
  if (conv.luminance(rgb) > 128) {
    classes.push("light");
  }

  return (
    <div
      className={classes.join(" ")}
      style={{
        top: y + "px",
        color: conv.rgbCssProp(rgb),
      }}
      onMouseDown={handleClick}
    ></div>
  );
}

function Picker({ hsv, onChange }) {
  const rgb4 = conv.rgb8ToRgb4(conv.hsvToRgb(hsv));
  const [r, g, b] = rgb4;
  const [hex, setHex] = useState(conv.rgb4ToHex(rgb4));

  const setRgb4 = (newRgb4) => {
    onChange(conv.rgbToHsv(conv.rgb4ToRgb8(newRgb4)));
  };

  useEffect(() => {
    setHex(conv.rgb4ToHex([r, g, b]));
  }, [r, g, b]);

  return (
    <div className="Picker">
      <PickerSquare hsv={hsv} onChange={onChange} />
      <HueStrip hsv={hsv} onChange={onChange} />
      <div className="Picker__info">
        <div className="Picker__infoLeft">
          <div
            className="Picker__swatch"
            style={{
              background: conv.rgbCssProp(
                conv.quantize4Bit(conv.hsvToRgb(hsv))
              ),
            }}
          />
          <label htmlFor="Picker-hex">#</label>
          <input
            id="Picker-hex"
            value={hex}
            onChange={(e) => {
              const newHex = e.target.value;
              setHex(newHex);
              if (newHex.match(/^[0-9a-f]{3}$/i)) {
                const newRgb4 = conv.hexToRgb4(newHex);
                setRgb4(newRgb4);
              }
            }}
          />
        </div>
        <div className="Picker__rgb">
          <div>
            <label htmlFor="Picker-r">R: </label>
            <input
              id="Picker-r"
              value={r}
              type="number"
              min={0}
              max={15}
              onChange={(e) => setRgb4([parseInt(e.target.value), g, b])}
            />
          </div>
          <div>
            <label htmlFor="Picker-g">G: </label>
            <input
              id="Picker-g"
              value={g}
              type="number"
              min={0}
              max={15}
              onChange={(e) => setRgb4([r, parseInt(e.target.value), b])}
            />
          </div>
          <div>
            <label htmlFor="Picker-b">B: </label>
            <input
              id="Picker-b"
              value={b}
              type="number"
              min={0}
              max={15}
              onChange={(e) => setRgb4([r, g, parseInt(e.target.value)])}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PickerSquare({ hsv, onChange }) {
  const width = 256;
  const height = 256;
  const canvasRef = useRef(null);

  const [h, s, v] = hsv;

  useEffect(() => {
    /** @type CanvasRenderingContext2D */
    const ctx = canvasRef.current.getContext("2d");
    const imageData = ctx.createImageData(width, height);
    let i = 0;
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const s1 = y / (height - 1);
        const v1 = 1 - x / (width - 1);
        let color = conv.hsvToRgb([h, s1, v1]);
        color = conv.quantize4Bit(color);
        const [r, g, b] = color;

        imageData.data[i++] = r;
        imageData.data[i++] = g;
        imageData.data[i++] = b;
        imageData.data[i++] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [h]);

  const handleMouseDown = useCallback(
    (e) => {
      const maxX = width - 1;
      const maxY = height - 1;

      const dragMove = (e) => {
        e.stopPropagation();
        const y = e.pageY - canvasRef.current.offsetParent.offsetTop;
        const x = e.pageX - canvasRef.current.offsetParent.offsetLeft;
        const s = conv.clamp(x / maxX);
        const v = 1 - conv.clamp(y / maxY);
        onChange([h, s, v]);
      };

      const dragStop = () => {
        document.removeEventListener("mousemove", dragMove);
        document.removeEventListener("mouseup", dragStop);
      };

      document.addEventListener("mousemove", dragMove);
      document.addEventListener("mouseup", dragStop);

      dragMove(e);
    },
    [h, onChange]
  );

  const classes = ["PickerSquare__selection"];
  if (conv.luminance(conv.hsvToRgb(hsv)) > 128) {
    classes.push("light");
  }

  return (
    <div
      className="PickerSquare"
      style={{ width: width + "px", height: height + "px" }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
      />
      <div
        style={{ top: conv.fToPercent(1 - v), left: conv.fToPercent(s) }}
        className={classes.join(" ")}
      />
    </div>
  );
}

function HueStrip({ hsv, onChange }) {
  const width = 256;
  const height = 14;
  const canvasRef = useRef(null);

  const [h, s, v] = hsv;

  useEffect(() => {
    /** @type CanvasRenderingContext2D */
    const ctx = canvasRef.current.getContext("2d");
    for (let x = 0; x < width; x++) {
      const hue = x / (width - 1);
      const rgb = conv.hsvToRgb([hue, 1, 1]);
      ctx.fillStyle = conv.rgbCssProp(rgb);
      ctx.fillRect(x, 0, 1, height);
    }
  }, []);

  const handleMouseDown = useCallback(
    (e) => {
      const maxX = width - 1;

      const dragMove = (e) => {
        e.stopPropagation();
        const x = e.pageX - canvasRef.current.offsetParent.offsetLeft;
        const h1 = conv.clamp(x / maxX);
        onChange([h1, s, v]);
      };

      const dragStop = () => {
        document.removeEventListener("mousemove", dragMove);
        document.removeEventListener("mouseup", dragStop);
      };

      document.addEventListener("mousemove", dragMove);
      document.addEventListener("mouseup", dragStop);

      dragMove(e);
    },
    [s, v, onChange]
  );

  return (
    <div className="HueStrip" style={{ width: width + "px" }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
      />
      <div
        style={{ left: conv.fToPercent(h) }}
        className="HueStrip__selection"
      />
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
