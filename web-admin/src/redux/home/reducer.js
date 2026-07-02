import * as ActionTypes from "./type";

const initState = {
	total: 0,
	page: 1,
	limit: 20,
	dashboard: null,
	ids: [],
	checkAll: false,
	redirect: false,
};

const reducer = (state = initState, action) => {
	switch (action.type) {
		case ActionTypes.LIST_DASH_BOARD:
			return {
				...state,
				dashboard: action.dashboard,
				total: action.total,
				limit: action.limit,
			};
		case "PAGING":
			return {
				...state,
				page: action.page
			};
		default:
			return state;
	}
};
export default reducer;
