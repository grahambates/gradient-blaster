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
    return buildGradient(points, options);
  }
);

export default store;
