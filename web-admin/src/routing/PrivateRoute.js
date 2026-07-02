import React from "react";
import { Route, Redirect } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";

const PrivateRoute = ({
	component: Component,
	auth: { isAuthenticated },
	location,
	...rest
}) => {
	return (
		<Route
			{...rest}
			render={(props) =>
				!isAuthenticated &&
				(location.pathname === "/" || location.pathname === "") ? (
					<Redirect
						to={{
							pathname: "/login",
							state: { from: props.location },
						}}
					/>
				) : (
					<Component {...props} />
				)
			}
		/>
	);
};

PrivateRoute.propTypes = {
	auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
	auth: state.auth,
});

export default connect(mapStateToProps, null)(PrivateRoute);
