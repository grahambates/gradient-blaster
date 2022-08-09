import React, { useEffect, useRef } from "react";
import "./Gradient.css";
import * as conv from "../lib/colorConvert";
import Point from "./Point";

function Gradient({
  height,
  scale,
  points,
  selected,
  onAdd,
  onMove,
  onSelect,
  onRemove,
  gradient
}) {
  return (
    <div className="Gradient">
      <Track height={height} onAdd={onAdd}>
        {points.map((p, i) => (
          <Point
            index={i}
            key={p.id}
            {...p}
            y={p.pos * height}
            selected={i === selected}
            onMove={onMove}
            onSelect={onSelect}
            onRemove={onRemove}
          />
        ))}
      </Track>
      {gradient && <Preview gradient={gradient} scale={scale} />}
    </div>
  );
}

function Track({ height, children, onAdd }) {
  return (
    <div
      className="Track"
      style={{ height: height + "px" }}
      onMouseDown={e => {
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
    /** @type CanvasRenderingContext2D */
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

export default Gradient;
