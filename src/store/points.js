import { createSlice } from "@reduxjs/toolkit";
import * as conv from "../lib/colorConvert";

// Assign unique IDs to points
let id = 0;
const pointId = () => id++;

const initialState = {
  selectedIndex: 0,
  items: [
    { id: pointId(), pos: 0, color: conv.rgbToHsv([255, 255, 0]) },
    { id: pointId(), pos: 1, color: conv.rgbToHsv([0, 0, 255]) }
  ]
};

export const pointsSlice = createSlice({
  name: "points",
  initialState,
  reducers: {
    addPoint: (state, action) => {
      const newPoint = {
        id: pointId(),
        initialDrag: true,
        ...action.payload
      };
      state.items.push(newPoint);
      state.items.sort((a, b) => a.pos - b.pos);
      state.selectedIndex = state.items.findIndex(p => p === newPoint);
    },
    removePoint: (state, action) => {
      state.items.splice(action.payload, 1);
      state.selectedIndex = Math.max(action.payload - 1, 0);
    },
    setPos: (state, action) => {
      const { index, pos } = action.payload;
      state.items[index].pos = pos;
    },
    setColor: (state, action) => {
      const { index, color } = action.payload;
      state.items[index].color = color;
    },
    selectIndex: (state, action) => {
      state.selectedIndex = action.payload;
    },
    previousPoint: state => {
      state.selectedIndex -= 1;
    },
    nextPoint: state => {
      state.selectedIndex += 1;
    }
  }
});

export const {
  addPoint,
  removePoint,
  setPos,
  setColor,
  selectIndex,
  previousPoint,
  nextPoint
} = pointsSlice.actions;

export const selectPoints = state => state.points.items;
export const selectSelectedIndex = state => state.points.selectedIndex;

export default pointsSlice.reducer;
