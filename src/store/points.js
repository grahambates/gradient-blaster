import { createSlice } from "@reduxjs/toolkit";
import * as conv from "../lib/colorConvert";

// Assign unique IDs to points
let id = 0;
const pointId = () => id++;

const initialState = [
  { id: pointId(), pos: 0, color: conv.rgbToHsv([255, 255, 0]) },
  { id: pointId(), pos: 1, color: conv.rgbToHsv([0, 0, 255]) }
];

export const pointsSlice = createSlice({
  name: "points",
  initialState,
  reducers: {
    addPoint: (state, action) => {
      state.push({
        id: pointId(),
        initialDrag: true,
        ...action.payload
      });
      state.sort((a, b) => a.pos - b.pos);
    },
    removePoint: (state, action) => {
      state.splice(action.payload, 1);
    },
    setPos: (state, action) => {
      const { index, pos } = action.payload;
      state[index].pos = pos;
    },
    setColor: (state, action) => {
      const { index, color } = action.payload;
      state[index].color = color;
    }
  }
});

export const { addPoint, removePoint, setPos, setColor } = pointsSlice.actions;

export const selectPoints = state => state.points;

export default pointsSlice.reducer;
