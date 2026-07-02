import React, {Component} from 'react';
import {
	BrowserRouter as Router,
	Route,
	Redirect,
	withRouter,
} from 'react-router-dom';
import Login from './Login';
import Master from './Master';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {login} from '../redux/auth/action';
import {Switch} from 'antd';

class Auth extends Component {
	constructor(props) {
		super();
	}
	render() {
		const ssid = localStorage.getItem('SSID');

		const authCheck = {
			// ssid: ssid,
			token: ssid,
		};
		return (
			<div>
				<AuthRoute
					exact
					path="/login"
					component={Login}
					token={authCheck.token}
				/>
				<PrivateRoute
					path="/"
					component={Master}
					token={authCheck.token}
				/>
			</div>
		);
	}
}

function AuthRoute({component: Component, ...rest}) {
	return (
		<Route
			{...rest}
			render={props =>
				rest.token !== null ? (
					<Redirect
						to={{
							pathname: '/',
						}}
					/>
				) : (
					<Component {...props} />
				)
			}
		/>
	);
}

function PrivateRoute({component: Component, ...rest}) {
	return (
		<Route
			{...rest}
			render={props =>
				rest.token !== null ? (
					<Component {...props} />
				) : (
					<Redirect
						to={{
							pathname: '/login',
						}}
					/>
				)
			}
		/>
	);
}

function mapStateToProps(state) {
	return {
		token: state.auth.token,
	};
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({login}, dispatch);
}

let AuthContainer = withRouter(
	connect(mapStateToProps, mapDispatchToProps)(Auth),
);

export default AuthContainer;
