import * as ActionTypes from "./type";

const initState = {
	data: [],
	page: 1,
	limit: 20,
	id: [],
	checkAll: false,
	fastgifts: [],
	fastgift: null,
	redirect: false,
};

const reducer = (state = initState, action) => {
	switch (action.type) {
		case ActionTypes.LIST_GIFT:
			return {
				...state,
				fastgifts: action.fastgifts
			};
		case ActionTypes.DETAIL_GIFT:
			return {
				...state,
				fastgift: action.fastgift
			};
		case ActionTypes.CREATE_GIFT:
			return {
				...state,
				redirect: action.redirect
			};
		case ActionTypes.UPDATE_GIFT:
			return {
				...state,
				redirect: action.redirect
			};
		default:
			return state;
	}
};

export default reducer; 