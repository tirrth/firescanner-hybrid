import React from "react";
import ReactDOM from "react-dom";

import "./index.css";
import * as serviceWorker from "./serviceWorker";

import App from "./components/App";
import Firebase, { FirebaseContext } from "./components/Configuration";

import { Plugins } from "@capacitor/core";

// ---------------------------- Redux Setup ---------------------------- //
import store from "./components/redux/store";
import { addCollegeList } from "./components/redux/actions";

window.store = store;
window.addCollegeList = addCollegeList;
// ---------------------------- (EXIT) Redux Setup ---------------------------- //

const { SplashScreen } = Plugins;
SplashScreen.hide();

ReactDOM.render(
  <FirebaseContext.Provider value={new Firebase()}>
    <App />
  </FirebaseContext.Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
