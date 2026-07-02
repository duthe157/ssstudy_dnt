import * as ActionTypes from './type';

const initState = {
	messages: [],
	student: null,
	total: 0,
	page: 1,
	limit: 20,
	ids: [],
	checkAll: false,
	redirect: false,
	mess: null,
};
const reducer = (state = initState, action) => {
	switch (action.type) {
		case ActionTypes.LIST_MESSAGE:
			return {
				...state,
				messages: action.messages,
				total: action.total,
				limit: action.limit,
				ids: [],
				redirect: false,
				mess: null,
				checkAll: false,
			};
		case 'PAGING':
			return {
				...state,
				page: action.page,
			};
		case ActionTypes.CREATE_MESSAGE:
			return {
				...state,
				redirect: action.redirect,
			};
		case ActionTypes.SHOW_MESSAGE:
			return {
				...state,
				mess: action.mess,
			};
		case ActionTypes.UPDATE_MESSAGE:
			return {
				...state,
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
		case ActionTypes.DELETE_MESSAGE:
			return {
				...state,
				ids: [],
				checkAll: false,
			};
		case ActionTypes.SEND_MESSAGE:
			return {
				...state,
			};
		case ActionTypes.CHECK_ALL:
			const messages = state.messages;
			var deletesAll = [];
			if (action.status) {
				deletesAll = Object.assign(
					[],
					Array.from(messages, ele => ele._id),
				);
			} else {
				deletesAll = [];
			}
			return {
				...state,
				checkAll: action.status,
				ids: deletesAll,
			};
		case ActionTypes.DATA_REMOVE_MESSAGE:
			return {
				...state,
				dataRemoveMessage: action.dataRemoveMessage
			}
		default:
			return state;
	}
};

export default reducer;
