import React, { useEffect, useState } from "react";
import { quantize } from "../lib/bitDepth";
import { hsvToRgb, luminance } from "../lib/colorSpace";
import { rgbCssProp } from "../lib/utils";
import "./Point.css";

const REMOVE_THRESHOLD = 30;

function Point({
  y,
  color,
  selected,
  onMove,
  onClone,
  onSelect,
  onRemove,
  initialDrag,
  depth,
}) {
  const rgb = quantize(hsvToRgb(color), depth);

  const [isDragging, setIsDragging] = useState(initialDrag);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    if (e.altKey) {
      onClone();
    }
    onSelect();
    setIsDragging(true);
  };

  const startDrag = () => {
    let offsetY, offsetX;
    let isRemoving;
    document.body.classList.add("dragging");

    const dragMove = (e) => {
      e.stopPropagation();
      if (offsetX === undefined) {
        offsetY = e.clientY - y;
        offsetX = e.clientX;
      }

      // Indicate that point will be removed on mouseUp if dragged far outside of track region
      isRemoving = Math.abs(e.clientX - offsetX) > REMOVE_THRESHOLD;
      setIsRemoving(isRemoving);
      if (isRemoving) {
        document.body.classList.add("removing");
      } else {
        document.body.classList.remove("removing");
        onMove(e.clientY - offsetY);
      }
    };

    const dragStop = () => {
      document.removeEventListener("mousemove", dragMove);
      document.removeEventListener("mouseup", dragStop);
      document.body.classList.remove("dragging");
      document.body.classList.remove("removing");
      if (isRemoving) {
        onRemove();
      }
      // Might not actually be removed if <= 2 points
      // need to reset state regardless
      setIsRemoving(false);
      setIsDragging(false);
    };

    document.addEventListener("mousemove", dragMove);
    document.addEventListener("mouseup", dragStop);
  };

  useEffect(() => {
    if (isDragging) startDrag();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  // Build class list:
  const classes = ["Point"];
  if (selected) {
    classes.push("selected");
  }
  if (isRemoving) {
    classes.push("removing");
  }
  if (luminance(rgb) > 128) {
    classes.push("light");
  }

  return (
    <div
      className={classes.join(" ")}
      style={{
        top: y + "px",
        color: rgbCssProp(rgb),
      }}
      onMouseDown={handleClick}
    ></div>
  );
}

export default Point;
