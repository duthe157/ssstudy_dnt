import * as ActionTypes from "./type";

const initState = {
	data: [],
	totalItems: 0,
	page: 1,
	limit: 20,
	examword: null,
	id: [],
	checkAll: false,
	redirect: false,
	dataRemoveExamWord: null,
	isCopyExamWord: false,
	classList: [],
	reportClass: null,
	detailExamWord: {},
	detail: null,
};

const reducer = (state = initState, action) => {
	switch (action.type) {
		case ActionTypes.LIST_EXAMWORDS:
			return {
				...state,
				examwords: action.examwords,
				totalItems: action.totalItems,
				limit: action.limit,
				page: action.page || state.page,
				id: [],
				checkAll: false,
				redirect: false
			};
		case "PAGING":
			return {
				...state,
				page: action.page
			};
		case ActionTypes.CREATE_EXAMWORD:
			return {
				...state,
				examword: action.examword,
				redirect: action.redirect
			};
		case ActionTypes.SHOW_EXAMWORD:
			return {
				...state,
				examword: action.examword
			};
		case ActionTypes.UPDATE_EXAMWORD:
			return {
				...state,
				redirect: action.redirect
			};
		case ActionTypes.ADD_DELETE:
			var arrDelete = [];
			var deletes = [];
			arrDelete.push(action.id);
			if (
				action.mode === "add" &&
				state.ids.includes(action.id) === false
			) {
				deletes = state.ids.concat(arrDelete);
			} else if (action.mode === "remove") {
				deletes = state.ids.filter(ele => ele !== action.id);
			} else {
				deletes = arrDelete;
			}
			return {
				...state,
				id: deletes
			};
		case ActionTypes.DELETE_EXAMWORD:
			return {
				...state,
				id: [],
				checkAll: false
			};
		case ActionTypes.CHECK_ALL:
			const examwords = state.examwords;
			var deletesAll = [];
			if (action.status) {
				deletesAll = Object.assign(
					[],
					Array.from(examwords, ele => ele._id)
				);
			} else {
				deletesAll = [];
			}
			return {
				...state,
				checkAll: action.status,
				id: deletesAll
			};
		case ActionTypes.COPY_EXAMWORD:
			return {
				...state,
				isCopyExamWord: true
			};
		case ActionTypes.UPLOAD_FILE:
			return {
				...state,
				uploadedFile: action.file
			};
		case ActionTypes.DOWNLOAD_FILE:
			return {
				...state
			};
		case "ADD_DATA_REMOVE_EXAMWORD":
			return {
				...state,
				dataRemoveExamWord: action.data
			};
		case ActionTypes.DETAIL_EXAMWORD:
			return {
				...state,
				detailExamWord: action.data
			};
		case ActionTypes.LIST_CLASS:
			return {
				...state,
				classList: action.data,
				examIdForClass: action.id
			};
		case ActionTypes.REPORT_CLASS:
			return {
				...state,
				reportClass: action.data
			};
		case "SET_EXAM_DETAIL":
			return {
				...state,
				detail: action.payload
			};
		default:
			return state;
	}
};

export default reducer; 