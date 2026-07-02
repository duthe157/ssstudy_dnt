import * as ActionTypes from "./type";

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
		case ActionTypes.LIST_EXAMS:
			return {
				...state,
				exams: action.exams,
				total: action.total,
				limit: action.limit,
				ids: [],
				checkAll: false,
				redirect: false
			};
		case "PAGING":
			return {
				...state,
				page: action.page
			};
		case ActionTypes.CREATE_EXAMS:
			return {
				...state,
				exam: action.exam,
				redirect: action.redirect
			};
		case ActionTypes.SHOW_EXAMS:
			return {
				...state,
				exam: action.exam
				// idQuestions: Object.assign([], action.exam.exam.questions),
				// detailQuestion: Object.assign([], action.exam.questions),
			};
		case ActionTypes.UPDATE_EXAMS:
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
				ids: deletes
			};
		case ActionTypes.DELETE_EXAMS:
			return {
				...state,
				ids: [],
				checkAll: false
			};
		case ActionTypes.CHECK_ALL:
			const exams = state.exams;
			var deletesAll = [];
			if (action.status) {
				deletesAll = Object.assign(
					[],
					Array.from(exams, ele => ele._id)
				);
			} else {
				deletesAll = [];
			}
			return {
				...state,
				checkAll: action.status,
				ids: deletesAll
			};
		case ActionTypes.ADD_CLASSROOM:
			return {
				...state
			};
		case ActionTypes.REMOVE_CLASSROOM:
			return {
				...state
			};
		case ActionTypes.LIST_CLASS:
			return {
				...state,
				classList: action.data
			};
		case ActionTypes.REPORT_CLASS:
			return {
				...state,
				reportClass: action.data
			};
		case ActionTypes.SEND:
			return {
				...state
			};
		case ActionTypes.PREVIEW_LIST_QUESTION:
			return {
				...state,
				dataPreviewExam: action.dataPreviewExam
			}
		case ActionTypes.DATA_REMOVE_EXAM:
			return {
				...state,
                dataRemoveExam: action.dataRemoveExam
			}
		default:
			return state;
	}
};
export default reducer;
