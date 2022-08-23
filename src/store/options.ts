import { createSlice } from "@reduxjs/toolkit";
import { decodeUrlQuery } from "../lib/url";
import { reset } from "./actions";
import targets, { Target } from "../lib/targets";
import { Bits, Options } from "../types";
import { RootState } from ".";

const urlState = decodeUrlQuery(window.location.search);

const defaultState: Options = {
  steps: 256,
  blendMode: "oklab",
  ditherMode: "blueNoise",
  ditherAmount: 40,
  shuffleCount: 2,
  target: "amigaOcs",
};

const initialState: Options = {
  ...defaultState,
  ...urlState.options,
};

export const configSlice = createSlice({
  name: "options",
  initialState,
  reducers: {
    setSteps: (state, action) => {
      state.steps = action.payload;
    },
    setBlendMode: (state, action) => {
      state.blendMode = action.payload;
    },
    setDitherMode: (state, action) => {
      state.ditherMode = action.payload;
    },
    setDitherAmount: (state, action) => {
      state.ditherAmount = action.payload;
    },
    setShuffleCount: (state, action) => {
      state.shuffleCount = action.payload;
    },
    setTarget: (state, action) => {
      state.target = action.payload;
    },
  },
  extraReducers: {
    [reset as any]() {
      return defaultState;
    },
  },
});

export const {
  setSteps,
  setBlendMode,
  setDitherMode,
  setDitherAmount,
  setShuffleCount,
  setTarget,
} = configSlice.actions;

export const selectOptions = (state: RootState): Options =>
  state.data.present.options;
export const selectTarget = (state: RootState): Target =>
  targets[state.data.present.options.target];
export const selectDepth = (state: RootState): Bits =>
  selectTarget(state).depth;

export default configSlice.reducer;
