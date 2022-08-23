import { createSlice } from "@reduxjs/toolkit";
import { RootState } from ".";
import * as conv from "../lib/colorSpace";
import { decodeUrlQuery } from "../lib/url";
import { Point } from "../types";
import { reset } from "./actions";

const urlState = decodeUrlQuery(window.location.search);

// Assign unique IDs to points
let id = 0;
const nextId = () => id++;

const defaultPoints: Point[] = [
  { id: nextId(), pos: 0, color: conv.rgbToHsv([255, 255, 0]) },
  { id: nextId(), pos: 1, color: conv.rgbToHsv([0, 0, 255]) },
];

const initialState = {
  selectedIndex: 0,
  items: urlState.points
    ? urlState.points.map((p) => ({ id: nextId(), ...p }))
    : defaultPoints,
};

export const pointsSlice = createSlice({
  name: "points",
  initialState,
  reducers: {
    addPoint: (state, action) => {
      const newPoint = {
        id: nextId(),
        ...action.payload,
      };
      state.items.push(newPoint);
      state.items.sort((a, b) => a.pos - b.pos);
      state.selectedIndex = state.items.findIndex((p) => p === newPoint);
    },
    removePoint: (state) => {
      if (state.items.length > 2) {
        state.items.splice(state.selectedIndex, 1);
        state.selectedIndex = Math.max(state.selectedIndex - 1, 0);
      }
    },
    clonePoint: (state) => {
      const selected = state.items[state.selectedIndex];
      const clonedPoint = {
        ...selected,
        id: nextId(),
      };
      state.items.splice(state.selectedIndex + 1, 0, clonedPoint);
    },
    setPos: (state, action) => {
      const selected = state.items[state.selectedIndex];
      selected.pos = action.payload;
      state.items.sort((a, b) => a.pos - b.pos);
      state.selectedIndex = state.items.findIndex((p) => p === selected);
    },
    setColor: (state, action) => {
      state.items[state.selectedIndex].color = action.payload;
    },
    selectIndex: (state, action) => {
      state.selectedIndex = action.payload;
    },
    previousPoint: (state) => {
      state.selectedIndex -= 1;
    },
    nextPoint: (state) => {
      state.selectedIndex += 1;
    },
  },
  extraReducers: {
    [reset as any]() {
      return {
        selectedIndex: 0,
        items: defaultPoints,
      };
    },
  },
});

export const {
  addPoint,
  removePoint,
  clonePoint,
  setPos,
  setColor,
  selectIndex,
  previousPoint,
  nextPoint,
} = pointsSlice.actions;

export const selectPoints = (state: RootState): Point[] =>
  state.data.present.points.items;
export const selectSelectedIndex = (state: RootState): number =>
  state.data.present.points.selectedIndex;

export default pointsSlice.reducer;
