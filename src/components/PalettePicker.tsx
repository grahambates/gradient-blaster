import React from "react";
import "./Picker.css";
import { rgbCssProp, sameColors } from "../lib/utils";
import { hsvToRgb, rgbToHsv } from "../lib/colorSpace";
import { Color } from "../types";

export interface PalettePickerProps {
  hsv: Color;
  palette: Color[];
  rowSize?: number;
  onChange: (c: Color) => void;
}

const PalettePicker = ({
  hsv,
  palette,
  rowSize = 9,
  onChange,
}: PalettePickerProps) => {
  const selectedRgb = hsvToRgb(hsv);
  const rows: Color[][] = [];
  for (let i = 0; i < palette.length; i += rowSize) {
    rows.push(palette.slice(i, i + rowSize));
  }
  return (
    <div className="Picker">
      <div className="Picker__swatches">
        {rows.map((row, i) => (
          <div key={i} className={"Picker__swatchesRow"}>
            {row.map((rgb) => {
              const isSelected = sameColors(selectedRgb, rgb);
              return (
                <button
                  key={rgb.join(",")}
                  className={
                    "Picker__swatch" + (isSelected ? " is-selected" : "")
                  }
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
};

export default PalettePicker;
