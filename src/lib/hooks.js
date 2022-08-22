import { useEffect, useRef } from "react";
import * as conv from "../lib/colorConvert";

export function useCanvasGradient(depth, gradient, scale = 1) {
    const canvasRef = useRef(null);
    useEffect(() => {
      /** @type CanvasRenderingContext2D */
      const ctx = canvasRef.current?.getContext("2d");
      const width = canvasRef.current.width;
  
      for (let i = 0; i < gradient.length; i++) {
        let col = gradient[i];
        col = conv.quantize(col, depth);
        ctx.fillStyle = conv.rgbCssProp(col);
        ctx.fillRect(0, i * scale, width, scale);
      }
    }, [scale, depth, gradient]);
    return canvasRef;
  }