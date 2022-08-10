import {
  combineReducers,
  configureStore,
  createSelector
} from "@reduxjs/toolkit";
import points, { selectPoints } from "./points";
import options, { selectOptions } from "./options";
import { buildGradient } from "../lib/gradient";
import undoable, { excludeAction } from "redux-undo";

// Grouping logic for undo/redo:

// Group actions of same type that occur within MAX_DELTA ms of each other
// e.g. dragging or scroling

let lastActionType;
let lastActionTime = 0;
const MAX_DELTA = 500; // Max time between grouped actions
let groupNo = 0; // This will be incremented each time we choose not to group with th previous action

const groupBy = action => {
  const now = Date.now();
  const delta = now - lastActionTime;
  if (lastActionType !== action.type || delta > MAX_DELTA) {
    groupNo++;
  }
  lastActionTime = now;
  lastActionType = action.type;
  return groupNo;
};

const data = undoable(
  combineReducers({
    points,
    options
  }),
  {
    groupBy,
    filter: excludeAction([
      "points/selectIndex",
      "points/nextPoint",
      "points/previousPoint"
    ])
  }
);

const store = configureStore({ reducer: { data } });

export const selectGradient = createSelector(
  selectPoints,
  selectOptions,
  (points, options) => {
    return buildGradient(points, options);
  }
);

export default store;
