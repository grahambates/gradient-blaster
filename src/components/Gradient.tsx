import React, { useEffect, useRef, useState } from "react";
import "./Gradient.css";
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
import { adjustColor, interlaceGradient } from "../lib/gradient";
import { rgbToHsv } from "../lib/colorSpace";
import { clamp, rgbCssProp } from "../lib/utils";
import { RGB } from "../types";
import targets, { TargetKey } from "../lib/targets";

function Gradient() {
  const dispatch = useDispatch();
  const { steps, target } = useSelector(selectOptions);
  const points = useSelector(selectPoints);
  const selected = useSelector(selectSelectedIndex);
  const gradient = useSelector(selectGradient);
  const { interlaced } = useSelector(selectTarget);

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

  const handleAdd = (y: number) => {
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
        color: rgbToHsv(sample),
      }),
    );
  };

  const handleMove = (newY: number) => {
    const maxY = steps * scale - scale;
    const pos = clamp(newY, 0, maxY) / maxY;
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
            handleAdd(e.pageY - e.currentTarget.offsetTop);
          }}
        >
          {points.map((p, i) => (
            <Point
              key={p.id}
              {...p}
              initialDrag={i === selected && isDragging}
              y={p.pos * height}
              target={target}
              selected={i === selected}
              onMove={handleMove}
              onClone={() => dispatch(clonePoint())}
              onSelect={() => dispatch(selectIndex(i))}
              onRemove={() => dispatch(removePoint())}
            />
          ))}
        </div>
        {interlaced && previewLace ? (
          <CanvasLaced gradient={gradient} scale={scale} target={target} />
        ) : (
          <Canvas gradient={gradient} scale={scale} target={target} />
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

interface CanvasProps {
  gradient: RGB[];
  scale: number;
  target: TargetKey;
}

function Canvas({ gradient, scale, target }: CanvasProps) {
  const width = 512;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const steps = gradient.length;

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      for (let i = 0; i < steps; i++) {
        let col = gradient[i];
        col = adjustColor(col, target);
        ctx.fillStyle = rgbCssProp(col);
        ctx.fillRect(0, i * scale, width, scale);
      }
    }
  }, [steps, scale, target, gradient]);

  return (
    <canvas
      className="Gradient__canvas"
      ref={canvasRef}
      width={width}
      height={steps * scale}
    />
  );
}

function CanvasLaced({ gradient, scale, target }: CanvasProps) {
  const width = 512;
  const canvasRefA = useRef<HTMLCanvasElement>(null);
  const canvasRefB = useRef<HTMLCanvasElement>(null);
  const steps = gradient.length;
  const depth = targets[target].depth;

  useEffect(() => {
    const canvasA = canvasRefA.current;
    const canvasB = canvasRefB.current;
    const ctxA = canvasA?.getContext("2d");
    const ctxB = canvasB?.getContext("2d");

    if (!canvasA || !canvasB || !ctxA || !ctxB) {
      return;
    }

    const [odd, even] = interlaceGradient(gradient, depth);

    for (let i = 0; i < steps; i++) {
      ctxA.fillStyle = rgbCssProp(odd[i]);
      ctxA.fillRect(0, i * scale, width, scale);
      ctxB.fillStyle = rgbCssProp(even[i]);
      ctxB.fillRect(0, i * scale, width, scale);
    }

    let mounted = true;

    const toggle = () => {
      canvasA.classList.toggle("hidden");
      canvasB.classList.toggle("hidden");
      if (mounted) {
        window.requestAnimationFrame(toggle);
      }
    };

    window.requestAnimationFrame(toggle);

    return () => {
      mounted = false;
    };
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
