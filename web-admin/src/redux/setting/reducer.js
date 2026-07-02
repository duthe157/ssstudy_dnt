import * as ActionTypes from './type';

const initState = {
	questions: [],
	total: 0,
	page: 1,
	limit: 20,
	question: null,
	ids: [],
	examQuestions: [],
	checkAll: false,
	redirect: false,
	image: null,
	data: null,
};

const reducer = (state = initState, action) => {
	switch (action.type) {
		case 'UPLOAD_IMAGE':
			return {
				...state,
				image: action.data[0],
			};
		case ActionTypes.UPDATE_SETTING:
			return {
				...state,
				redirect: true,
			};
		case ActionTypes.SETTING_WEBSITE:
			return {
				...state,
				data: action.data,
			};
		case ActionTypes.PAGE_UPDATE:
			return {
				...state,
				data: action.data,
			};
		case ActionTypes.PAGE_DETAIL:
			return {
				...state,
				contentConfigs: action.data ? action.data : [],
			};
		case ActionTypes.ABOUT_DETAIL:
			return {
				...state,
				about: action.data ? action.data : {},
			};
		case ActionTypes.ABOUT_UPDATE:
			return {
				...state,
				data: action.data,
			};
		default:
			return state;
	}
};
export default reducer;
