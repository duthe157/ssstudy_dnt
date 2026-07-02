import * as ActionTypes from "./type";
import axios from "axios";
import { initAPI, responseError, notify } from "../../config/api";

export const logout = (history) => {
	return (dispatch) => {
		dispatch({ type: ActionTypes.LOGOUT });
		// history.push("/login");
	};
};

export function showProfile() {
	initAPI();
	return async (dispatch) => {
		const data = {};
		await axios
			.post(`user/profile`, data)
			.then((res) => {
				notify(res, false);
				if (res.data.code === 200) {
					let userInfo = res.data.data;
					dispatch({ type: ActionTypes.SHOW_PROFILE, userInfo });
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function updateProfile(data) {
	initAPI();
	return async (dispatch) => {
		await axios
			.post(`user/update-profile`, data)
			.then((res) => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({
						type: ActionTypes.UPDATE_PROFILE,
						payload: res.data,
					});
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function changePassword(data) {
	initAPI();
	return async (dispatch) => {
		await axios
			.post(`/user/change-password`, data)
			.then((res) => {
				notify(res);
				if (res.data.code === 200) {
					localStorage.setItem("SSID", res.data.data.token);
					dispatch({ type: ActionTypes.CHANGE_PASSWORD, data });
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function login(data) {
	return async (dispatch) => {
		await initAPI();
		axios
			.post(`/auth/signin`, { ...data , site: 'admin' })
			.then((res) => {
				notify(res);
				if (res.data.code === 200) {
					let token = res.data.data.token;
					let user = res.data.data;
					dispatch({ type: ActionTypes.LOGIN, token, user });
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function loginGoogle(data) {
	return async (dispatch) => {
		await initAPI();
		axios
			.post(`/auth/google-auth`, data)
			.then((res) => {
				notify(res);
				if (res.data.code === 200) {
					let token = res.data.data.token;
					let user = res.data.data;
					dispatch({ type: ActionTypes.LOGIN, token, user });
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export const loadUser = () => async (dispatch) => {
	try {
		if (localStorage.SSID && localStorage.user) {
			dispatch({
				type: ActionTypes.USER_LOADED,
				isAuthenticated: true,
				token: localStorage.SSID,
				user: JSON.parse(localStorage.getItem("user")),
			});
		}
	} catch (err) {
		dispatch({ type: ActionTypes.AUTH_ERROR });
	}
};
