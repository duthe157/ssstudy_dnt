import * as ActionTypes from "./type";
const initialState = {
	user: null,
	isAuthenticated: false,
	token: null
};
const reducer = (state = initialState, action) => {
	switch (action.type) {
		case ActionTypes.LOGIN:
			localStorage.setItem("SSID", action.token);
			localStorage.setItem("user", JSON.stringify(action.user));
			return {
				...state,
				isAuthenticated: true,
				token: action.token,
				user: action.user,
			};

		case ActionTypes.SHOW_PROFILE:
			return {
				...state,
				userInfo: action.userInfo,
			};

		case ActionTypes.UPDATE_PROFILE:
			return {
				...state,
				userInfo: action.payload.data,
			};
		case ActionTypes.CHANGE_PASSWORD:
			return {
				...state,
			};

		case ActionTypes.USER_LOADED:
			return {
				...state,
				isAuthenticated: true,
				token: action.token,
				user: { ...action.user },
			};
		case ActionTypes.LOGOUT:
		case ActionTypes.AUTH_ERROR:
			localStorage.removeItem("SSID");
			localStorage.removeItem("user");
			return {
				...state,
				isAuthenticated: false,
				token: null,
				user: null,
			};
		default:
			return state;
	}
};

export default reducer;
