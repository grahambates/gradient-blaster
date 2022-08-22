import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";
import store from "../store";
import { Provider } from "react-redux";

test("renders learn react link", () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  const stepsLabel = screen.getByText(/Steps:/i);
  expect(stepsLabel).toBeInTheDocument();
});
