import * as ActionTypes from './type';
import { isUndefined } from 'util';

const initState = {
	reportBugs: [],
	categoriesFilter: [],
	reportBug: null,
	total: 0,
	image: null,
	page: 1,
	limit: 20,
	ids: [],
	checkAll: false,
	redirect: false,
	count: 0,
	configs: [],
};
const reducer = (state = initState, action) => {
	switch (action.type) {
		case ActionTypes.LIST_REPORT_BUG:
			return {
				...state,
				reportBugs: action.reportBugs,
				total: action.total,
				limit: action.limit,
				ids: [],
				checkAll: false,
				redirect: false,
				categoriesFilter: []
			};
		case 'PAGING':
			return {
				...state,
				page: action.page,
			};
		case ActionTypes.CREATE_REPORT_BUG:
			return {
				...state,
				redirect: action.redirect,
			};
		case ActionTypes.SHOW_REPORT_BUG:
			return {
				...state,
				reportBug: action.reportBug,
			};

		case ActionTypes.UPDATE_REPORT_BUG:
			const arr1 = state.reportBugs;
			const newArr1 = arr1.filter(ele => ele._id !== action.reportBug._id);
			newArr1.unshift(action.reportBug);
			return {
				...state,
				reportBugs: newArr1,
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
		case ActionTypes.DELETE_REPORT_BUG:
			return {
				...state,
				ids: [],
				checkAll: false,
			};
		case ActionTypes.DELETE_REPORT_BUG:
			return {
				...state,
				ids: [],
				checkAll: false,
			};
		case ActionTypes.CHECK_ALL:
			const reportBugs = state.reportBugs;
			var deletesAll = [];
			if (action.status) {
				deletesAll = Object.assign(
					[],
					Array.from(reportBugs, ele => ele._id),
				);
			} else {
				deletesAll = [];
			}
			return {
				...state,
				checkAll: action.status,
				ids: deletesAll,
			};
		case "UPLOAD_IMAGE":
			return {
				...state,
				image: action.data[0],
			};
		case ActionTypes.DATA_REMOVE_BUG:
			return {
				...state,
				dataRemoveBug: action.dataRemoveBug
			}
		default:
			return state;
	}
};

export default reducer;
