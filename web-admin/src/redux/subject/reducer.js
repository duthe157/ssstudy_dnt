import * as ActionTypes from './type';
const initState = {
	subjects: [],
	total: 0,
	page: 1,
	limit: 20,
	type: 'VIDEO',
	subject: null,
	ids: [],
	checkAll: false,
	redirect: false,
	loading: false,
  	error: null,
};
const reducer = (state = initState, action) => {
	switch (action.type) {
		case ActionTypes.LIST_SUBJECT:
			return {
				...state,
				subjects: action.subjects,
				total: action.total,
				limit: action.limit,
				ids: [],
				checkAll: false,
				redirect: false,
				loading: true,
			};
		case 'PAGING':
			return {
				...state,
				page: action.page,
			};
		case ActionTypes.CREATE_SUBJECT:
			return {
				...state,
				redirect: true,
			};
		case ActionTypes.SHOW_SUBJECT:
			return {
				...state,
				subject: action.subject,
			};
		case ActionTypes.UPDATE_SUBJECT:
			const arr = state.subjects;
			const newArr = arr.filter(ele => ele._id !== action.subject._id);
			newArr.unshift(action.subject);
			return {
				...state,
				subjects: newArr,
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
		case ActionTypes.DELETE_SUBJECT:
			return {
				...state,
				ids: [],
				checkAll: false,
			};
		case ActionTypes.DATA_REMOVE_SUBJECT:
			return {
				...state,
				dataRemoveSubject: action.dataRemoveSubject
			}
		case ActionTypes.CHECK_ALL:
			const subjects = state.subjects;
			var deletesAll = [];
			if (action.status) {
				deletesAll = Object.assign(
					[],
					Array.from(subjects, ele => ele._id),
				);
			} else {
				deletesAll = [];
			}
			return {
				...state,
				checkAll: action.status,
				ids: deletesAll,
			};
		default:
			return state;
	}
};

export default reducer;
