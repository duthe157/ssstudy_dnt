import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

import "./test.css";
import "./App.css";
import 'katex/dist/contrib/mhchem.js';

// Redux
import { Provider } from "react-redux";
import store from "./store";

import "./plyr.css";
import { BrowserRouter as Router } from "react-router-dom";

ReactDOM.render(
	// <React.StrictMode>
	<Provider store={store}>
		<Router>
			<App />
		</Router>
	</Provider>,
	// </React.StrictMode>
	document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
