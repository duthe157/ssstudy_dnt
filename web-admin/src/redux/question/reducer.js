import * as ActionTypes from "./type";

const initState = {
	questions: [],
	total: 0,
	page: 1,
	limit: 20,
	question: null,
	ids: [],
	_ids: [],
	examQuestions: [],
	checkAll: false,
	redirect: false,
	image: null,
	classrooms: [],
	questionClassrooms: [],
};

const reducer = (state = initState, action) => {
	let newQuestions;
	switch (action.type) {
		case ActionTypes.LIST_QUESTION:
			return {
				...state,
				questions: action.questions,
				total: action.total,
				limit: action.limit,
				checkAll: false,
				redirect: false,
			};
		case "PAGING":
			return {
				...state,
				page: action.page,
			};
		case "UPLOAD_IMAGE":
			return {
				...state,
				image: action.data[0],
			};
		case ActionTypes.CREATE_QUESTION:
			return {
				...state,
				question: action.question,
				redirect: true,
			};
		case ActionTypes.SHOW_QUESTION:
			return {
				...state,
				question: action.question,
			};
		case ActionTypes.UPDATE_QUESTION:
			return {
				...state,
				question: action.question,
				redirect: true,
			};
		case ActionTypes.ADD_DELETE:
			var arrDelete = [];
			var deletes = [];
			arrDelete.push(action.id);
			if (action.mode === "add") {
				deletes = state._ids.concat(arrDelete);
			} else if (action.mode === "remove") {
				deletes = state._ids.filter((ele) => ele !== action.id);
			} else {
				deletes = arrDelete;
			}
			return {
				...state,
				_ids: deletes,
			};
		case ActionTypes.DELETE_QUESTION:
			const array = state.questions;
			const newArray = array.filter((ele) => ele._id !== action.id);
			return {
				...state,
				questions: newArray,
				total: newArray.length,
				_ids: [],
				checkAll: false,
			};
		case "SELECT_QUESTION":
			const arrSelect = state.ids;
			var examQuestions = state.examQuestions;
			if (state.ids.includes(action.id) === false) {
				arrSelect.push(action.id);
				examQuestions.push(action.item);
				var copy = Object.assign([], examQuestions);

				newQuestions = state.questions.map((ele) => {
					if (ele._id === action.id) {
						var eleCopy = {};
						eleCopy.check = true;
						return Object.assign(ele, eleCopy);
					}
					return ele;
				});
			}
			return {
				...state,
				ids: arrSelect,
				questions: Object.assign([], newQuestions),
				examQuestions: copy ? copy : Object.assign([], examQuestions),
			};
		case "DISSELECT_QUESTION":
			const arrDisSelect = state.ids;
			var examQuestions1 = state.examQuestions;
			if (state.ids.includes(action.id) === true) {
				var copy2 = arrDisSelect.filter((ele) => ele !== action.id);
				var copy3 = examQuestions1.filter(
					(ele) => ele._id !== action.id
				);
				newQuestions = state.questions.map((ele) => {
					if (ele._id === action.id) {
						var eleCopy = {};
						eleCopy.check = false;
						return Object.assign(ele, eleCopy);
					}
					return ele;
				});
			}
			return {
				...state,
				ids: copy2,
				questions: Object.assign([], newQuestions),
				examQuestions: copy3 ? copy3 : Object.assign([], examQuestions1),
			};
		case "ASSIGN_VALUE":
			return {
				...state,
				ids: Object.assign([], action.exam.exam.questions),
				examQuestions: Object.assign([], action.exam.questions),
			};
		case "CHANGE_EXAM_QUESTION":
			return {
				...state,
				ids: Object.assign([], action.arrIds),
				examQuestions: Object.assign([], action.data),
			}
		case "REMOVE_EXAM_QUESTION":
			return {
				...state,
				examQuestions: [],
			};
		case "REMOVE_IDS":
			return {
				...state,
				ids: [],
			};
		case ActionTypes.CHECK_ALL:
			const questions = state.questions;
			var deletesAll = [];
			if (action.status) {
				deletesAll = Object.assign(
					[],
					Array.from(questions, (ele) => ele._id)
				);
			} else {
				deletesAll = [];
			}
			return {
				...state,
				checkAll: action.status,
				_ids: deletesAll,
			};
		case ActionTypes.ADD_CLASSROOM:
			return {
				...state,
			};
		case ActionTypes.REMOVE_CLASSROOM:
			return {
				...state,
			};
		case ActionTypes.GET_LIST_CLASSROOM:
			return {
				...state,
				questionClassrooms: action.data,
			};
		case ActionTypes.DATA_REMOVE_QUESTION:
			return {
				...state,
				dataRemoveQuestion: action.dataRemoveQuestion
			}
		// case 'CHANGE_EXAM_QUESTIONS':
		// 	return {
		// 		...state,
		// 		examQuestions: action.data,
		// 	}
		default:
			return state;
	}
};
export default reducer;
