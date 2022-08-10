import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  steps: 256,
  scale: 2,
  blendMode: "perceptual",
  ditherMode: "blueNoise",
  ditherAmount: 50
};

export const configSlice = createSlice({
  name: "options",
  initialState,
  reducers: {
    setSteps: (state, action) => {
      state.steps = action.payload;
    },
    setScale: (state, action) => {
      state.scale = action.payload;
    },
    setBlendMode: (state, action) => {
      state.blendMode = action.payload;
    },
    setDitherMode: (state, action) => {
      state.ditherMode = action.payload;
    },
    setDitherAmount: (state, action) => {
      state.ditherAmount = action.payload;
    }
  }
});

export const {
  setSteps,
  setScale,
  setBlendMode,
  setDitherMode,
  setDitherAmount
} = configSlice.actions;

export const selectOptions = state => state.data.present.options;

export default configSlice.reducer;
