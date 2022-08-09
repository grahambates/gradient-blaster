import { configureStore, createSelector } from "@reduxjs/toolkit";
import points, { selectPoints } from "./points";
import options, { selectOptions } from "./options";
import { buildGradient } from "../lib/gradient";

const store = configureStore({
  reducer: {
    points,
    options
  }
});

export const selectGradient = createSelector(
  selectPoints,
  selectOptions,
  (points, options) => {
    const { steps, blendMode, ditherMode, ditherAmount } = options;
    return buildGradient(points, steps, blendMode, ditherMode, ditherAmount);
  }
);

export default store;
