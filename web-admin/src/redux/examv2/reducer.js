import * as ActionTypes from "./type";
import {UPDATE_SECTION} from "./type";

const initState = {
	exams: [],
	total: 0,
	page: 1,
	limit: 20,
	exam: null,
	ids: [],
	checkAll: false,
	redirect: false,
	classList: [],
	reportClass: null
};

const reducer = (state = initState, action) => {
	switch (action.type) {
		case "PAGING":
			return {
				...state,
				page: action.page
			};
		case ActionTypes.CREATE_EXAM:
			return {
				...state,
				exam: action.exam
			};
		case ActionTypes.UPDATE_EXAM:
			return {
				...state
			};
		case ActionTypes.CREATE_SECTION:
			return {
				...state,
				section: action.section
			};
		case ActionTypes.UPDATE_SECTION:
			return {
				...state,
			};
		case ActionTypes.UPDATE_GROUP:
			return {
				...state,
			};
		case ActionTypes.CREATE_QUESTION:
			return {
				...state,
				question: action.question
			};
		case ActionTypes.UPDATE_QUESTION:
			return {
				...state,
				question: action.question
			};
		case ActionTypes.DETAIL_EXAM:
			return {
				...state,
				detail: action.detail
			};
		case ActionTypes.DELETE_QUESTION:
			return {
				...state
			};
		case ActionTypes.DELETE_GROUP:
			return {
				...state
			};
		case ActionTypes.DELETE_SECTION:
			return {
				...state
			};
		default:
			return state;
	}
};
export default reducer;
