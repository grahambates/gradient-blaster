import { configureStore } from "@reduxjs/toolkit";
import points from "./points";
import options from "./options";

const store = configureStore({
  reducer: {
    points,
    options
  }
});

export default store;
