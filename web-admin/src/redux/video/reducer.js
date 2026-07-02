import * as ActionTypes from './type';

const initState = {
	videos: [],
	video: null,
	total: 0,
	page: 1,
	limit: 20,
	ids: [],
	checkAll: false,
	redirect: false,
	classrooms: [],
	classList: [],
};
const reducer = (state = initState, action) => {
	switch (action.type) {
		case ActionTypes.LIST_VIDEO:
			return {
				...state,
				videos: action.videos,
				total: action.total,
				limit: action.limit,
				ids: [],
				redirect: false,
				checkAll: false,
			};
		case 'PAGING':
			return {
				...state,
				page: action.page,
			};
		case ActionTypes.CREATE_VIDEO:
			return {
				...state,
				video: action.video,
				redirect: true,
			};
		case ActionTypes.SHOW_VIDEO:
			return {
				...state,
				video: action.video,
			};
		case ActionTypes.UPDATE_VIDEO:
			const arr = state.videos;
			const newArr = arr.filter(ele => ele._id !== action.video._id);
			newArr.unshift(action.video);
			return {
				...state,
				videos: newArr,
				redirect: action.redirect,
			};
		case ActionTypes.ADD_DELETE:
			var arrDelete = [];
			var deletes = [];
			arrDelete.push(action.id);
			if (action.mode === 'add') {
				deletes = state.ids.concat(arrDelete);
			} else if (action.mode === 'remove') {
				deletes = state.ids.filter(ele => ele !== action.id);
			} else {
				deletes = arrDelete;
			}
			return {
				...state,
				ids: deletes,
			};
		case ActionTypes.DELETE_VIDEO:
			// const array = state.videos;
			// const newArray = array.filter((ele) => ele._id !== action.id);
			return {
				...state,
				// videos: newArray,
				// total: parseFloat(state.total) - 1,
				ids: [],
				checkAll: false,
			};
		case ActionTypes.CHECK_ALL:
			const videos = state.videos;
			var deletesAll = [];
			if (action.status) {
				deletesAll = Object.assign(
					[],
					Array.from(videos, ele => ele._id),
				);
			} else {
				deletesAll = [];
			}
			return {
				...state,
				checkAll: action.status,
				ids: deletesAll,
			};
		case ActionTypes.ADD_CLASSROOM:
			return {
				...state,
			};
		case ActionTypes.REMOVE_CLASSROOM:
			return {
				...state,
			};
		case ActionTypes.LIST_CLASS:
			return {
				...state,
				classList: action.data,
			};
		default:
			return state;
	}
};

export default reducer;
