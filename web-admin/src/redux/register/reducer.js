import * as ActionTypes from './type';

const initState = {
	registrations: [],
	registration: null,
	total: 0,
	page: 1,
	limit: 20,
	ids: [],
	checkAll: false,
	redirect: false,
};
const reducer = (state = initState, action) => {
	switch (action.type) {
		case ActionTypes.LIST_REGISTATION:
			return {
				...state,
				registrations: action.registrations,
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
		case ActionTypes.CREATE_REGISTATION:
			return {
				...state,
				redirect: true,
			};
		case ActionTypes.SHOW_REGISTATION:
			return {
				...state,
				registration: action.registration,
			};
		case ActionTypes.UPDATE_REGISTATION:
			const arr = state.registrations;
			const newArr = arr.filter(
				ele => ele._id !== action.registration._id,
			);
			newArr.unshift(action.registration);
			return {
				...state,
				registrations: newArr,
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
		case ActionTypes.DELETE_REGISTATION:
			// const array = state.registrations;
			// const newArray = array.filter((ele) => ele._id !== action.id);
			return {
				...state,
				// registrations: newArray,
				// total: parseFloat(state.total) - 1,
				ids: [],
				checkAll: false,
			};
		case ActionTypes.CHECK_ALL:
			const registrations = state.registrations;
			var deletesAll = [];
			if (action.status) {
				deletesAll = Object.assign(
					[],
					Array.from(registrations, ele => ele._id),
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
