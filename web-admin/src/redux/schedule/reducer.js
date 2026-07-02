import * as ActionTypes from "./type";
import { isUndefined } from "lodash";

const initState = {
	schedules: [],
	schedule: null,
	total: 0,
	page: 1,
	limit: 20,
	ids: [],
	checkAll: false,
	redirect: false,

	classrooms: [],
	subjects: [],
	createSuccess: false,
	updateSuccess: false,
};
const reducer = (state = initState, action) => {
	switch (action.type) {
		case ActionTypes.LIST_CLASSROOM:
			return {
				...state,
				classrooms: action.classrooms,
			};

		case ActionTypes.LIST_SUBJECT:
			return {
				...state,
				subjects: action.subjects,
			};

		case ActionTypes.LIST_SCHEDULE:
			return {
				...state,
				schedules: action.schedules,
				total: action.total,
				limit: action.limit,
				ids: [],
				redirect: false,
				checkAll: false,
			};
		case "PAGING":
			return {
				...state,
				page: action.page,
			};

		case ActionTypes.SCHEDULE_CREATE:
			return {
				...state,
				createSuccess: true,
			};

		case ActionTypes.CREATE_ERROR:
			return {
				...state,
				createSuccess: false,
			};

		case ActionTypes.SHOW_SCHEDULE:
			return {
				...state,
				schedule: action.schedule,
				updateSuccess: false,
			};
		case ActionTypes.UPDATE_SCHEDULE:
			return {
				...state,
				updateSuccess: true,
			};

		case ActionTypes.UPDATE_ERROR:
			return {
				...state,
				updateSuccess: false,
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
			};
		case ActionTypes.DELETE_SCHEDULE:
			return {
				...state,
				ids: [],
				checkAll: false,
			};
		case ActionTypes.CHECK_ALL:
			const schedules = state.schedules;
			var deletesAll = [];
			if (action.status) {
				deletesAll = Object.assign(
					[],
					Array.from(schedules, (ele) => ele._id)
				);
			} else {
				deletesAll = [];
			}
			return {
				...state,
				checkAll: action.status,
				ids: deletesAll,
			};

		case ActionTypes.RESET_STATE_SCHEDULE:
			return {
				...state,
				schedule: null,
				classrooms: [],
				subjects: [],
				createSuccess: false,
				updateSuccess: false,
			};

		default:
			return state;
	}
};

export default reducer;
