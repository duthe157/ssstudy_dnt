import * as ActionTypes from "./type";
import { isUndefined } from "lodash";

const initState = {
	billReports: [],
	bills: [],
	userInfos: null,
	bill: null,
	listHistory: [],
	admin: null,
	total: 0,
	page: 1,
	limit: 20,
	ids: [],
	checkAll: false,
	redirect: false,
	userData: null,
	isSearch: false,
	classItems: [],
	classItemsRefund: [],
	classItemsCopy: [],
	classDisselect: [],
};
const reducer = (state = initState, action) => {
	switch (action.type) {
		case ActionTypes.BILL_REPORT:
			return {
				...state,
				billReports: action.data,
			};
		case ActionTypes.LIST_BILL:
			return {
				...state,
				bills: action.bills,
				total: action.total,
				limit: action.limit,
				userInfos: action.userInfos,
				ids: [],
				redirect: false,
				checkAll: false,
				userData: null,
			};
		case ActionTypes.LIST_HISTORY:
			return {
				...state,
				listHistory: action.listHistory,
				total: action.total,
				limit: action.limit,
				ids: [],
				redirect: false,
				checkAll: false,
				userData: null,
			};
		case "PAGING":
			return {
				...state,
				page: action.page,
			};
		case ActionTypes.GET_USER_BY_CODE:
			return {
				...state,
				userData: action.userData,
				isSearch: true,
			};

		case ActionTypes.RESET_SEARCH:
			return {
				...state,
				userData: null,
				isSearch: false,
			};

		case ActionTypes.ADMIN_CREATE:
			return {
				...state,
			};

		case ActionTypes.INIT_ITEM:
			var data = action.data;

			var newArr = [];
			if (data.length > 0) {
				newArr = data.map((ele) => {
					var obj = {
						id: ele._id,
						code: ele.code,
						name: ele.name,
						price: isUndefined(ele.tuition_per_day)
							? ele.hp_day
							: ele.tuition_per_day,
						qty: 0,
						subject_name: ele.subject.name,
					};
					return Object.assign({}, obj);
				});
			}

			return {
				...state,
				classItemsCopy: newArr,
				// classItems: newArr,
			};

		case ActionTypes.INIT_ITEM_EDIT:
			var dataClass = action.data;

			let classItems2 = state.classItems;

			var newArr1 = [];
			if (dataClass.length > 0) {
				dataClass.forEach((ele) => {
					let check = classItems2.filter(
						(item) => item.id === ele._id
					);

					if (check.length === 0) {
						var obj = {
							id: ele._id,
							code: ele.code,
							name: ele.name,
							price: isUndefined(ele.tuition_per_day)
								? ele.hp_day
								: ele.tuition_per_day,
							qty: 0,
							subject_name: ele.subject.name,
						};
						newArr1.push(obj);
					}
				});
			}

			return {
				...state,
				classItemsCopy: newArr1,
				// classItems: newArr,
			};

		case ActionTypes.CLASS_ITEM_COPY:
			return {
				...state,
				classItemsCopy: Object.assign([], state.classItems),
			};

		case ActionTypes.CHANGE_QTY:
			let classItems = state.classItems;

			var newClassItems = classItems.map((ele) => {
				if (ele.id === action.data.id) {
					return Object.assign(ele, action.data);
				}
				return ele;
			});

			return {
				...state,
				classItems: newClassItems,
			};
		case ActionTypes.ADD_CLASSROOM:
			let listClass = state.classItems;

			let indexFinded = listClass
				.map((ele) => ele.id.toString())
				.indexOf(action.data.id);

			if (indexFinded === -1) {
				listClass.push(action.data);
			}

			return {
				...state,
				classItems: Object.assign([], listClass),
			};
		case ActionTypes.BILL_CREATE:
			return {
				...state,
				redirect: true,
			};

		case ActionTypes.SHOW_BILL:
			return {
				...state,
				classItems: action.bill.items,
				bill: action.bill,
			};
		case ActionTypes.UPDATE_BILL:
			return {
				...state,
				redirect: action.redirect,
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
		case ActionTypes.DELETE_BILL:
			return {
				...state,
				ids: [],
				checkAll: false,
			};
		case ActionTypes.CHECK_ALL:
			const bills = state.bills;
			var deletesAll = [];
			if (action.status) {
				deletesAll = Object.assign(
					[],
					Array.from(bills, (ele) => ele._id)
				);
			} else {
				deletesAll = [];
			}
			return {
				...state,
				checkAll: action.status,
				ids: deletesAll,
			};

		case ActionTypes.SELECT_CLASS:
			var classItemsCopy = state.classItemsCopy;
			var classItems1 = state.classItems;

			const index = classItemsCopy
				.map((ele) => ele.id.toString())
				.indexOf(action.id);

			classItems1.push(action.item);

			classItemsCopy.splice(index, 1);

			return {
				...state,
				classItemsCopy: Object.assign([], classItemsCopy),
				classItems: Object.assign([], classItems1),
			};

		case ActionTypes.DISSELECT_CLASS:
			var classItemsAfterRemove = state.classItems;

			const removeIndex = classItemsAfterRemove
				.map((ele) => ele.id.toString())
				.indexOf(action.id);

			classItemsAfterRemove.splice(removeIndex, 1);

			return {
				...state,
				classItems: Object.assign([], classItemsAfterRemove),
			};

		case ActionTypes.RESET_STATE:
			return {
				...state,
				billReports: [],
				bills: [],
				bill: null,
				classItems: [],
				classItemsCopy: [],

				redirect: false,
				userData: null,
				isSearch: false,
				classDisselect: [],
			};

		case ActionTypes.CHANGE_PAYTYPE:
			return {
				...state,
				bill: null,
				classItems: Object.assign([], action.data),
			};
		case ActionTypes.ADD_CLASSROOM_REFUND:
			let listClassRefund = state.classItemsRefund;

			let findIndex = listClassRefund
				.map((ele) => ele.id.toString())
				.indexOf(action.data.id);

			if (findIndex === -1) {
				listClassRefund.push(action.data);
			}

			return {
				...state,
				classItemsRefund: Object.assign([], listClassRefund),
			};
		case ActionTypes.DISSELECT_CLASS_REFUND:
			var classItemsAfterRemove = state.classItemsRefund;

			const classRefundIndex = classItemsAfterRemove
				.map((ele) => ele.id.toString())
				.indexOf(action.id);

			classItemsAfterRemove.splice(classRefundIndex, 1);

			return {
				...state,
				classItemsRefund: Object.assign([], classItemsAfterRemove),
			};
		case ActionTypes.CHANGE_QTY_CLASS_REFUND:
			let classItemsRefund = state.classItemsRefund;

			var newClassItemsRefund = classItemsRefund.map((ele) => {
				if (ele.id === action.data.id) {
					return Object.assign(ele, action.data);
				}
				return ele;
			});

			return {
				...state,
				classItemsRefund: newClassItemsRefund,
			};
		case ActionTypes.REVENUE_BY_COMPANY:
			return {
				...state,
				billCompanyReports: action.dataReport.report
			}
		case ActionTypes.REVENUE_BY_SUBJECT:
			return {
				...state,
				billSubjectReports: action.data.report
			}
		case ActionTypes.REVENUE_BY_STAFF:
			return {
				...state,
				billStaffReports: action.data.report
			}
		case ActionTypes.SHOW_BILL_REFUND:
			return {
				...state,
				classItemsRefund: action.bill.items,
				bill: action.bill,
			};
		case ActionTypes.DATA_REMOVE_BILL:
			return {
				...state,
				dataRemoveBill: action.dataRemoveBill
			}
		default:
			return state;
	}
};

export default reducer;
