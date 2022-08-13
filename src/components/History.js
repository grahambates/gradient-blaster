import React, { useEffect } from "react";
import { ActionCreators } from "redux-undo";
import { useDispatch, useSelector } from "react-redux";
import { FaUndo, FaRedo } from "react-icons/fa";
import { MdCreate } from "react-icons/md";
import "./History.css";

import Button from "./Button";
import { reset } from "../store/actions";

function History() {
  const dispatch = useDispatch();
  const { past, future } = useSelector(state => state.data);

  // Undo/redo keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = function(e) {
      e.stopImmediatePropagation();
      if (e.key === "z" && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        dispatch(ActionCreators.redo());
      } else if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
        dispatch(ActionCreators.undo());
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  return (
    <div className="History">
      <Button dark iconLeft={<MdCreate />} onClick={() => dispatch(reset())}>
        Reset
      </Button>
      <div className="History__group">
        <Button
          dark
          iconRight={<FaUndo />}
          disabled={!past.length}
          onClick={() => dispatch(ActionCreators.undo())}
        >
          Undo
        </Button>
        <Button
          dark
          iconLeft={<FaRedo />}
          disabled={!future.length}
          onClick={() => dispatch(ActionCreators.redo())}
        >
          Redo
        </Button>
      </div>
    </div>
  );
}

export default History;
