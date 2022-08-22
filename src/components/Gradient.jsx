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
import { selectOptions, selectTarget } from "../store/options";
import { selectGradient } from "../store";
import { interlaceGradient } from "../lib/gradient";

function Gradient() {
  const dispatch = useDispatch();
  const { steps } = useSelector(selectOptions);
  const points = useSelector(selectPoints);
  const selected = useSelector(selectSelectedIndex);
  const gradient = useSelector(selectGradient);
  const { depth, interlaced } = useSelector(selectTarget);

  const [scale, setScale] = useState(1);
  const [autoScale, setAutoScale] = useState(true);
  const [previewLace, setPreviewLace] = useState(false);

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
        {interlaced && previewLace ? (
          <CanvasLaced gradient={gradient} scale={scale} depth={depth} />
        ) : (
          <Canvas gradient={gradient} scale={scale} depth={depth} />
        )}
      </div>

      <div className="Gradient__options">
        <div className="Gradient__interlace">
          {interlaced && (
            <label>
              <input
                type="checkbox"
                checked={previewLace}
                onChange={(e) => setPreviewLace(e.target.checked)}
              />
              Preview interlace
            </label>
          )}
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

function CanvasLaced({ gradient, scale, depth }) {
  const width = 512;
  const canvasRefA = useRef(null);
  const canvasRefB = useRef(null);
  const steps = gradient.length;

  useEffect(() => {
    const ctxA = canvasRefA.current?.getContext("2d");
    const ctxB = canvasRefB.current?.getContext("2d");

    const [odd, even] = interlaceGradient(gradient, depth);

    for (let i = 0; i < steps; i++) {
      ctxA.fillStyle = conv.rgbCssProp(odd[i]);
      ctxA.fillRect(0, i * scale, width, scale);
      ctxB.fillStyle = conv.rgbCssProp(even[i]);
      ctxB.fillRect(0, i * scale, width, scale);
    }

    let mounted = true;

    const toggle = () => {
      canvasRefA.current.classList.toggle("hidden");
      canvasRefB.current.classList.toggle("hidden");
      if (mounted) {
        window.requestAnimationFrame(toggle);
      }
    };

    window.requestAnimationFrame(toggle);

    return () => (mounted = false);
  }, [steps, scale, depth, gradient]);

  return (
    <>
      <canvas
        className="Gradient__canvas hidden"
        ref={canvasRefA}
        width={width}
        height={steps * scale}
      />
      <canvas
        className="Gradient__canvas"
        ref={canvasRefB}
        width={width}
        height={steps * scale}
      />
    </>
  );
}

export default Gradient;
