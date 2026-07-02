import * as ActionTypes from './type';

const initState = {
	question: [],
};
const reducer = (state = initState, action) => {
	switch (action.type) {

		case 'PAGING':
			return {
				...state,
				page: action.page,
			};
		case ActionTypes.UPLOAD_BANNER:
			return {
				...state,
				banner_image: action.data ? action.data : ""
			};
		case ActionTypes.UPLOAD_IMAGE_OUTSTANSDING:
			return {
				...state,
				outstanding_image: action.data ? action.data : ""
			};
		case ActionTypes.UPLOAD_IMAGE_AUDITION:
			return {
				...state,
				audition_image: action.data ? action.data : ""
			};
		case ActionTypes.UPLOAD_IMAGE_SCHEDULE:
			return {
				...state,
				schedule_image: action.data ? action.data : ""
			};
		case ActionTypes.UPLOAD_WORD_FILE_SUCCESS:
			return {
				...state,
				questions: action.payload || []
			};
		default:
			return state;
	}
};

export default reducer;
