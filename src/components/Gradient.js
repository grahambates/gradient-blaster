import React, { useEffect, useRef, useState } from "react";
import "./Gradient.css";
import * as conv from "../lib/colorConvert";
import Point from "./Point";
import { useDispatch, useSelector } from "react-redux";
import {
  addPoint,
  removePoint,
  clonePoint,
  setPos,
  selectIndex,
  selectPoints,
  selectSelectedIndex,
} from "../store/points";
import { selectOptions, selectDepth } from "../store/options";
import { selectGradient } from "../store";

function Gradient() {
  const dispatch = useDispatch();
  const { steps } = useSelector(selectOptions);
  const points = useSelector(selectPoints);
  const selected = useSelector(selectSelectedIndex);
  const gradient = useSelector(selectGradient);
  const depth = useSelector(selectDepth);

  const [scale, setScale] = useState(1);
  const [autoScale, setAutoScale] = useState(true);

  useEffect(() => {
    if (autoScale) {
      setScale(Math.floor(512 / steps) || 1);
    }
  }, [steps, autoScale]);

  const height = steps * scale;

  const [isDragging, setIsDragging] = useState(false);

  const handleAdd = (y) => {
    const scaledY = Math.round(y / scale);
    const sample = gradient[scaledY];

    // Start new point in dragging state as mouse is currently down
    setIsDragging(true);
    // Cancel drag on mouse up
    const stopDrag = () => {
      setIsDragging(false);
      window.removeEventListener("mouseup", stopDrag);
    };
    window.addEventListener("mouseup", stopDrag);

    dispatch(
      addPoint({
        pos: y / (height - 1),
        color: conv.rgbToHsv(sample),
      })
    );
  };

  const handleMove = (newY) => {
    const maxY = steps * scale - scale;
    const pos = conv.clamp(newY, 0, maxY) / maxY;
    dispatch(setPos(pos));
  };

  return (
    <>
      <div className="Gradient">
        <div
          className="Gradient__track"
          style={{ height: height + "px" }}
          onMouseDown={(e) => {
            e.preventDefault();
            handleAdd(e.pageY - e.target.offsetTop);
          }}
        >
          {points.map((p, i) => (
            <Point
              key={p.id}
              {...p}
              initialDrag={i === selected && isDragging}
              y={p.pos * height}
              depth={depth}
              selected={i === selected}
              onMove={handleMove}
              onClone={() => dispatch(clonePoint())}
              onSelect={() => dispatch(selectIndex(i))}
              onRemove={() => dispatch(removePoint())}
            />
          ))}
        </div>
        <Canvas gradient={gradient} scale={scale} depth={depth} />
      </div>
      <div className="Gradient__zoom">
        <label htmlFor="steps">Zoom </label>&times;{" "}
        <input
          id="scale"
          type="number"
          min={1}
          max={20}
          value={scale}
          disabled={autoScale}
          onChange={(e) => setScale(parseInt(e.target.value))}
        />{" "}
        <label>
          <input
            type="checkbox"
            checked={autoScale}
            onChange={(e) => setAutoScale(e.target.checked)}
          />
          auto
        </label>
      </div>
    </>
  );
}

function Canvas({ gradient, scale, depth }) {
  const width = 512;
  const canvasRef = useRef(null);
  const steps = gradient.length;

  useEffect(() => {
    /** @type CanvasRenderingContext2D */
    const ctx = canvasRef.current?.getContext("2d");

    for (let i = 0; i < steps; i++) {
      let col = gradient[i];
      col = conv.quantize(col, depth);
      ctx.fillStyle = conv.rgbCssProp(col);
      ctx.fillRect(0, i * scale, width, scale);
    }
  }, [steps, scale, depth, gradient]);

  return (
    <canvas
      className="Gradient__canvas"
      ref={canvasRef}
      width={width}
      height={steps * scale}
    />
  );
}

export default Gradient;
