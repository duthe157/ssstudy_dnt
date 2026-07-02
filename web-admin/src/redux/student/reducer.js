import * as ActionTypes from './type';

const initState = {
	students: [],
	student: null,
	accountants: [],
	admin: null,
	total: 0,
	page: 1,
	limit: 20,
	ids: [],
	isDoneHomeWork: null,	
	lastTesting: null,
	checkAll: false,
	redirect: false,
	classrooms: [],
	attendance: []
};
const reducer = (state = initState, action) => {
	switch (action.type) {
		case ActionTypes.LIST_STUDENT:

			return {
				...state,
				students: action.students,
				total: action.total,
				limit: action.limit,
				ids: [],
				redirect: false,
				checkAll: false,
			};

		case ActionTypes.LIST_ACCOUNTANT:
			return {
				...state,
				accountants: action.accountants,
				total: action.total,
				limit: action.limit,
				ids: [],
				redirect: false,
				checkAll: false,
			};
		case ActionTypes.CHECK_CODE:
			return {
				...state,
				dataUser: action.dataUser,
				statusCode: action.statusCode,
				dataClass: action.dataClass,
				data: action.data,
				isDoneHomeWork: action.isDoneHomeWork,
				lastTesting: action.lastTesting,
				attendance: action.attendance
			};
		case ActionTypes.LIST_CLASSROOM:
			return {
				...state,
				classrooms: action.classrooms,
			};
		case 'PAGING':
			return {
				...state,
				page: action.page,
			};
		case ActionTypes.CREATE_STUDENT:
			return {
				...state,
			};
		case ActionTypes.ADMIN_CREATE:
			return {
				...state,
				redirect: action.redirect,
			};
		case ActionTypes.ADMIN_UPDATE:
			return {
				...state,
				redirect: action.redirect,
			};
		case ActionTypes.SHOW_STUDENT:
			return {
				...state,
				student: action.student,
			};
		case ActionTypes.UPDATE_STUDENT:
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
		case ActionTypes.DELETE_STUDENT:
			return {
				...state,
				ids: [],
				checkAll: false,
			};
		case ActionTypes.CHECK_ALL:
			const students = state.students;
			var deletesAll = [];
			if (action.status) {
				deletesAll = Object.assign(
					[],
					Array.from(students, ele => ele._id),
				);
			} else {
				deletesAll = [];
			}
			return {
				...state,
				checkAll: action.status,
				ids: deletesAll,
			};
		case ActionTypes.CREDIT_CREATE:
			return {
				...state,
				credit: action.credit
			}
		case ActionTypes.DATA_REMOVE_STUDENT:
			return {
				...state,
				dataRemoveStudent: action.dataRemoveStudent
			}
		case ActionTypes.DATA_REMOVE_ADMIN:
			return {
				...state,
				dataRemoveAdmin: action.dataRemoveAdmin
			}
		default:
			return state;
	}
};

export default reducer;
