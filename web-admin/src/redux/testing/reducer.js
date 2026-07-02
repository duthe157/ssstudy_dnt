import * as ActionTypes from "./type";
import { stat } from "fs";

const initState = {
	testings: [],
	questions: [],
	testing: null,
	total: 0,
	page: 1,
	limit: 20,
	ids: [],
	checkAll: false,
	qtyTrue: 0,
	total: 0,
	success: null,
	data: null,
};
const reducer = (state = initState, action) => {
	switch (action.type) {
		case ActionTypes.LIST_TESTING:
			return {
				...state,
				testings: action.testings,
				total: action.total,
				limit: action.limit,
				ids: [],
				success: null,
				checkAll: false,
			};
		case "PAGING":
			return {
				...state,
				page: action.page,
			};
		case ActionTypes.SHOW_TESTING:
			const _answers = Object.assign([], action.testing.testing.answers);
			const questions = Object.assign([], action.testing.questions);
			const total = questions.length;

			_answers.forEach((ans) => {
				questions.forEach((ele) => {
					if (ans.question_id === ele._id) {
						ans = Object.assign(ans, ele);
					}
				});
			});

			const iterator = _answers.values();
			var qtyTrue = 0;
			for (const ele of iterator) {
				if (ele.value === ele.answer) {
					qtyTrue++;
				}
			}

			return {
				...state,
				testing: action.testing,
				questions: Object.assign([], _answers),
				qtyTrue,
				total: total,
				ids: Object.assign([], [action.id]),
				data: action.testing,
			};
		case ActionTypes.CONFIRM_TESTING:
			return {
				...state,
				ids: [],
				checkAll: false,
				success: true,
			};
		case ActionTypes.ADD_DELETE:
			var arrDelete = [];
			var deletes = [];
			arrDelete.push(action.id);
			if (action.mode === "add") {
				deletes = state.ids.concat(arrDelete);
			} else if (action.mode === "remove") {
				deletes = state.ids.filter((ele) => ele !== action.id);
			} else {
				deletes = arrDelete;
			}
			return {
				...state,
				ids: deletes,
				success: false,
			};
		case ActionTypes.DELETE_TESTING:
			return {
				...state,
				ids: [],
				checkAll: false,
			};
		case ActionTypes.DATA_REMOVE_TESTING:
			return {
				...state,
				dataRemoveTesting: action.dataRemoveTesting
			}
		case ActionTypes.CHECK_ALL:
			const testings = state.testings;
			var deletesAll = [];
			if (action.status) {
				deletesAll = Object.assign(
					[],
					Array.from(testings, (ele) => ele._id)
				);
			} else {
				deletesAll = [];
			}
			return {
				...state,
				checkAll: action.status,
				ids: deletesAll,
			};
		case ActionTypes.UPDATE_POINT:
			return {
				...state,
			};
		default:
			return state;
	}
};

export default reducer;
