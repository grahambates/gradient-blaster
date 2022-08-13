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
  selectSelectedIndex
} from "../store/points";
import { selectOptions } from "../store/options";
import { selectGradient } from "../store";

function Gradient() {
  const dispatch = useDispatch();
  const options = useSelector(selectOptions);
  const points = useSelector(selectPoints);
  const selected = useSelector(selectSelectedIndex);
  const gradient = useSelector(selectGradient);

  const { steps, scale } = options;
  const height = steps * scale;

  const [isDragging, setIsDragging] = useState(false);

  const handleAdd = y => {
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
        color: conv.rgbToHsv(conv.rgb4ToRgb8(sample))
      })
    );
  };

  const handleMove = newY => {
    const maxY = steps * scale - scale;
    const pos = conv.clamp(newY, 0, maxY) / maxY;
    dispatch(setPos(pos));
  };

  return (
    <div className="Gradient">
      <div
        className="Gradient__track"
        style={{ height: height + "px" }}
        onMouseDown={e => {
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
            selected={i === selected}
            onMove={handleMove}
            onClone={() => dispatch(clonePoint())}
            onSelect={() => dispatch(selectIndex(i))}
            onRemove={() => dispatch(removePoint())}
          />
        ))}
      </div>
      <Canvas gradient={gradient} scale={scale} />
    </div>
  );
}

function Canvas({ gradient, scale }) {
  const width = 512;
  const canvasRef = useRef(null);
  const steps = gradient.length;

  useEffect(() => {
    /** @type CanvasRenderingContext2D */
    const ctx = canvasRef.current?.getContext("2d");

    for (let i = 0; i < steps; i++) {
      ctx.fillStyle = conv.rgbCssProp(conv.rgb4ToRgb8(gradient[i]));
      ctx.fillRect(0, i * scale, width, scale);
    }
  }, [steps, scale, gradient]);

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
