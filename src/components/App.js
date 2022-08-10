import React from "react";

import "./App.css";
import Gradient from "./Gradient";
import Options from "./Options";
import Detail from "./Detail";
import Output from "./Output";
import History from "./History";

function App() {
  return (
    <div className="App">
      <div className="App__top">
        <Options />
        <History />
      </div>

      <div className="App__main">
        <div className="App__left">
          <Detail />
        </div>

        <div className="App__middle">
          <Gradient />
        </div>

        <div className="App__right">
          <Output />
        </div>
      </div>
    </div>
  );
}

export default App;
