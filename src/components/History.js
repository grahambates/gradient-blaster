import React, { useEffect } from "react";
import { ActionCreators } from "redux-undo";
import { useDispatch, useSelector } from "react-redux";
import { FaUndo, FaRedo } from "react-icons/fa";
import Button from "./Button";

function History() {
  const dispatch = useDispatch();
  const { past, future } = useSelector(state => state.data);

  // Undo/redo keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = function(e) {
      e.stopImmediatePropagation();
      if (e.key === "z" && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        console.log("redo");
        dispatch(ActionCreators.redo());
      } else if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
        console.log("undo");
        dispatch(ActionCreators.undo());
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  return (
    <div className="History">
      <Button
        dark
        iconRight={<FaUndo />}
        disabled={!past.length}
        onClick={() => dispatch(ActionCreators.undo())}
      >
        Undo
      </Button>{" "}
      <Button
        dark
        iconLeft={<FaRedo />}
        disabled={!future.length}
        onClick={() => dispatch(ActionCreators.redo())}
      >
        Redo
      </Button>
    </div>
  );
}

export default History;
