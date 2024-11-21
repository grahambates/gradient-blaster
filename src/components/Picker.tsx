import React, { useCallback, useEffect, useRef } from "react";
import "./Picker.css";
import { decodeHex3 } from "../lib/hex";
import { quantize, restoreBits } from "../lib/bitDepth";
import { clamp, fToPercent, rgbCssProp } from "../lib/utils";
import { hsvToRgb, luminance, rgbToHsv } from "../lib/colorSpace";
import { Bits, HSV } from "../types";

// Standard palette swatches, divided into rows
const swatches = [
  [
    "444",
    "999",
    "fff",
    "f43",
    "f90",
    "fd0",
    "dd0",
    "ad0",
    "6cc",
    "7df",
    "aaf",
    "faf",
  ],
  [
    "333",
    "888",
    "ccc",
    "d31",
    "e70",
    "fc0",
    "bb0",
    "6b0",
    "1aa",
    "09e",
    "76f",
    "f2f",
  ],
  [
    "000",
    "666",
    "bbb",
    "900",
    "c50",
    "f90",
    "880",
    "143",
    "077",
    "06b",
    "639",
    "a19",
  ],
].map((row) => row.map(decodeHex3).map((c) => restoreBits(c, 4)));

export interface PickerProps {
  hsv: HSV;
  depth: Bits;
  onChange: (c: HSV) => void;
}

const Picker = React.memo(({ hsv, depth, onChange }: PickerProps) => {
  return (
    <div className="Picker">
      <PickerSquare hsv={hsv} depth={depth} onChange={onChange} />
      <HueStrip hsv={hsv} onChange={onChange} />
      <div className="Picker__swatches">
        {swatches.map((row, i) => (
          <div key={i} className="Picker__swatchesRow">
            {row.map((rgb) => {
              return (
                <button
                  key={rgb.join(",")}
                  className="Picker__swatch"
                  style={{ background: rgbCssProp(rgb) }}
                  onClick={() => onChange(rgbToHsv(rgb))}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
});

const PickerSquare = ({ hsv, depth, onChange }: PickerProps) => {
  const width = 256;
  const height = 256;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [h, s, v] = hsv;

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!canvasRef.current || !ctx) {
      return;
    }
    const imageData = ctx.createImageData(width, height);
    let i = 0;
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const s1 = y / (height - 1);
        const v1 = 1 - x / (width - 1);
        let color = hsvToRgb([h, s1, v1]);
        color = quantize(color, depth);
        const [r, g, b] = color;

        imageData.data[i++] = r;
        imageData.data[i++] = g;
        imageData.data[i++] = b;
        imageData.data[i++] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [h, depth]);

  const handleMouseDown: React.MouseEventHandler<HTMLCanvasElement> =
    useCallback(
      (e) => {
        const maxX = width - 1;
        const maxY = height - 1;

        const dragMove = (e: MouseEvent) => {
          e.stopPropagation();
          const parent = canvasRef.current?.offsetParent as HTMLDivElement;
          const y = e.pageY - parent.offsetTop;
          const x = e.pageX - parent.offsetLeft;
          const s = clamp(x / maxX);
          const v = 1 - clamp(y / maxY);
          onChange([h, s, v]);
        };

        const dragStop = () => {
          document.removeEventListener("mousemove", dragMove);
          document.removeEventListener("mouseup", dragStop);
        };

        document.addEventListener("mousemove", dragMove);
        document.addEventListener("mouseup", dragStop);

        dragMove(e as any);
      },
      [h, onChange],
    );

  const classes = ["PickerSquare__selection"];
  if (luminance(hsvToRgb(hsv)) > 128) {
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
        style={{ top: fToPercent(1 - v), left: fToPercent(s) }}
        className={classes.join(" ")}
      />
    </div>
  );
};

interface HueStripProps {
  hsv: HSV;
  onChange: (c: HSV) => void;
}

const HueStrip = ({ hsv, onChange }: HueStripProps) => {
  const width = 256;
  const height = 14;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [h, s, v] = hsv;

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) {
      return;
    }
    for (let x = 0; x < width; x++) {
      const hue = x / (width - 1);
      const rgb = hsvToRgb([hue, 1, 1]);
      ctx.fillStyle = rgbCssProp(rgb);
      ctx.fillRect(x, 0, 1, height);
    }
  }, []);

  const handleMouseDown: React.MouseEventHandler<HTMLCanvasElement> =
    useCallback(
      (e) => {
        const maxX = width - 1;

        const dragMove = (e: MouseEvent) => {
          e.stopPropagation();
          const parent = canvasRef.current?.offsetParent as HTMLDivElement;
          const x = e.pageX - parent.offsetLeft;
          const h1 = clamp(x / maxX);
          onChange([h1, s, v]);
        };

        const dragStop = () => {
          document.removeEventListener("mousemove", dragMove);
          document.removeEventListener("mouseup", dragStop);
        };

        document.addEventListener("mousemove", dragMove);
        document.addEventListener("mouseup", dragStop);

        dragMove(e as any);
      },
      [s, v, onChange],
    );

  return (
    <div className="HueStrip" style={{ width: width + "px" }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
      />
      <div style={{ left: fToPercent(h) }} className="HueStrip__selection" />
    </div>
  );
};

export default Picker;
