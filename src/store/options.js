import { createSlice } from "@reduxjs/toolkit";
import { decodeUrlQuery } from "../lib/url";
import { reset } from "./actions";

const urlState = decodeUrlQuery(window.location.search);

const defaultState = {
  steps: 256,
  blendMode: "oklab",
  ditherMode: "blueNoise",
  ditherAmount: 40,
  shuffleCount: 2
};

const initialState = {
  ...defaultState,
  ...urlState.options
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
    }
  },
  extraReducers: {
    [reset]() {
      return defaultState;
    }
  }
});

export const {
  setSteps,
  setBlendMode,
  setDitherMode,
  setDitherAmount,
  setShuffleCount
} = configSlice.actions;

export const selectOptions = state => state.data.present.options;

export default configSlice.reducer;
