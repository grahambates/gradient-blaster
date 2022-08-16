import React from "react";
import { useSelector, useDispatch } from "react-redux";
import "./Options.css";

import {
  setSteps,
  setBlendMode,
  setDitherMode,
  setDitherAmount,
  selectOptions
} from "../store/options";

function Options() {
  const dispatch = useDispatch();
  const options = useSelector(selectOptions);
  const { steps, blendMode, ditherMode, ditherAmount } = options;

  return (
    <div className="Options">
      <div>
        <label htmlFor="steps">Steps: </label>
        <input
          id="steps"
          type="number"
          min={2}
          max={2000}
          value={steps}
          onChange={e => dispatch(setSteps(parseInt(e.target.value)))}
        />
      </div>

      <div>
        <label htmlFor="blendMode">Blend mode: </label>
        <select
          id="blendMode"
          value={blendMode}
          onChange={e => dispatch(setBlendMode(e.target.value))}
        >
          <option value="perceptual">Perceptual</option>
          <option value="lab">LAB</option>
          <option value="linear">Linear RGB</option>
        </select>
      </div>

      <div>
        <label htmlFor="ditherMode">Dither mode: </label>
        <select
          id="ditherMode"
          value={ditherMode}
          onChange={e => dispatch(setDitherMode(e.target.value))}
        >
          <option value="off">Off</option>
          <option value="shuffle">Shuffle</option>
          <option value="errorDiffusion">Error diffusion</option>
          <option value="blueNoise">Blue noise</option>
          <option value="blueNoiseMono">Blue noise mono</option>
          <option value="goldenRatio">Golden ratio</option>
          <option value="goldenRatioMono">Golden ratio mono</option>
          <option value="whiteNoise">White noise</option>
          <option value="whiteNoiseMono">White noise mono</option>
          <option value="ordered">Ordered</option>
          <option value="orderedMono">Ordered mono</option>
        </select>
      </div>

      {!["off", "shuffle"].includes(ditherMode) && (
        <div className="Options__ditherAmount">
          <label htmlFor="ditherAmount">Dither amount: </label>
          <input
            type="range"
            className="Options__ditherAmountRange"
            min={0}
            max={100}
            value={ditherAmount}
            onChange={e => dispatch(setDitherAmount(parseInt(e.target.value)))}
          />
          <input
            id="ditherAmount"
            className="Options__ditherAmountInput"
            type="number"
            min={0}
            max={100}
            value={ditherAmount}
            onChange={e => dispatch(setDitherAmount(parseInt(e.target.value)))}
          />{" "}
          %
        </div>
      )}
    </div>
  );
}

export default Options;
