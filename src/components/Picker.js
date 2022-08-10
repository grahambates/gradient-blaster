import React, { useCallback, useEffect, useRef, useState } from "react";
import "./Picker.css";
import * as conv from "../lib/colorConvert";

function Picker({ hsv, onChange }) {
  const rgb4 = conv.rgb8ToRgb4(conv.hsvToRgb(hsv));
  const [r, g, b] = rgb4;
  const [hex, setHex] = useState(conv.rgb4ToHex(rgb4));

  const setRgb4 = newRgb4 => {
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
              background: conv.rgbCssProp(conv.quantize4Bit(conv.hsvToRgb(hsv)))
            }}
          />
          <label htmlFor="Picker-hex">#</label>
          <input
            id="Picker-hex"
            value={hex}
            onChange={e => {
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
              onChange={e => setRgb4([parseInt(e.target.value), g, b])}
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
              onChange={e => setRgb4([r, parseInt(e.target.value), b])}
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
              onChange={e => setRgb4([r, g, parseInt(e.target.value)])}
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
        const s1 = y;
        const v1 = 255 - x;
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
    e => {
      const dragMove = e => {
        e.stopPropagation();
        const y = e.pageY - canvasRef.current.offsetParent.offsetTop;
        const x = e.pageX - canvasRef.current.offsetParent.offsetLeft;
        const s = conv.clamp(x, 0, 255);
        const v = 255 - conv.clamp(y, 0, 255);
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
        style={{ top: 255 - v + "px", left: s + "px" }}
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
      const hue = x;
      const rgb = conv.hsvToRgb([hue, 255, 255]);
      ctx.fillStyle = conv.rgbCssProp(rgb);
      ctx.fillRect(x, 0, 1, height);
    }
  }, []);

  const handleMouseDown = useCallback(
    e => {
      const maxX = width - 1;

      const dragMove = e => {
        e.stopPropagation();
        const x = e.pageX - canvasRef.current.offsetParent.offsetLeft;
        const h1 = conv.clamp(x, 0, 255);
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
      <div style={{ left: h + "px" }} className="HueStrip__selection" />
    </div>
  );
}

export default Picker;
