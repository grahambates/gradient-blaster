import React, { useCallback, useEffect } from "react";
import * as conv from "../lib/colorConvert";
import "./Point.css";

function Point({
  index,
  y,
  color,
  selected,
  onMove,
  onSelect,
  onRemove,
  initialDrag
}) {
  const rgb = conv.quantize4Bit(conv.hsvToRgb(color));

  const handleClick = e => {
    e.stopPropagation();
    onSelect(index);
    startDrag(e);
  };

  const startDrag = useCallback(
    e => {
      let offsetY, offsetX;
      if (e) {
        offsetY = e.clientY - y;
        offsetX = e.clientX;
      }

      const dragMove = e => {
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
        color: conv.rgbCssProp(rgb)
      }}
      onMouseDown={handleClick}
    ></div>
  );
}

export default Point;
