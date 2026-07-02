import React, { useEffect, Fragment } from "react";

import { Switch, Route, withRouter } from "react-router-dom";

// Redux
import store from "./store";

// component
import Login from "./components/Login";
import PrivateRoute from "./routing/PrivateRoute";
import Master from "./components/Master";
import Starfield from "./components/Starfield";

import ScrollToTop from "./components/ScrollToTop";

//actions
import { loadUser } from "./redux/auth/action";
import LoginIframe from "./components/iframe/LoginIframe";
import {setLoader} from "./components/LoadingContext";

// var loader = document.querySelector(".preloader");
// const showLoader = () => {
// 	loader.classList.remove("loader-hide")
// 	loader.classList.add("preloader")
// };
// const hideLoader = () => {
// 	loader.classList.remove("preloader")
// 	loader.classList.add("loader-hide")
// };

// const setLoader = (status) => {
// 	console.log('start setLoader');
// 	if (status === true) {
// 		loader.classList.add('loader-visible');
// 		loader.classList.remove('loader-hidden');
// 	} else {
// 		loader.classList.add('loader-hidden');
// 		loader.classList.remove('loader-visible');
// 	}
// 	console.log('end setLoader');
// };

const App = ({ isAuthenticated, location }) => {
	useEffect(() => {
		setLoader(true);
		store.dispatch(loadUser());
		setLoader(false);
	}, []);
	
	return (
		<Fragment>
			<Starfield />
			<ScrollToTop />
	           <Switch>
	               <Route exact path='/login'>
	                   <Login />
	               </Route>

	               <Route exact path='/loginIframe'>
	                   <LoginIframe />
	               </Route>

	               <PrivateRoute path='/'>
	                   <Master />
	               </PrivateRoute>
	           </Switch>
		</Fragment>
	);
};

export default withRouter(App);
