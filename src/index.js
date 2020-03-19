import React from "react";
import ReactDOM from "react-dom";
import 'babel-polyfill'

import App from "./App";

if (module.hot) {
  module.hot.accept(() => {});
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
