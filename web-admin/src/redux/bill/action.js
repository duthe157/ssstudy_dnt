import axios from "axios";
import * as ActionTypes from "./type";
import { initAPI, notify, responseError } from "../../config/api";

export function listBill(data) {
	return async (dispatch) => {
		await initAPI();
		await axios
			.post(`bill/list`, data)
			.then((res) => {
				dispatch({ type: "PAGING", page: data.page });
				const bills = res.data.data.records;
				const userInfos = res.data.data.userInfos;
				const total = res.data.data.totalRecord;
				const limit = res.data.data.perPage;

				dispatch({
					type: ActionTypes.LIST_BILL,
					bills,
					userInfos,
					total,
					limit,
				});
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function listHistory(data) {
	return async (dispatch) => {
		await initAPI();
		await axios
			.post(`bill/list-history`, data)
			.then((res) => {
				dispatch({ type: "PAGING", page: data.page });
				const listHistory = res.data.data.records;
				const total = res.data.data.totalRecord;
				const limit = res.data.data.perPage;

				dispatch({
					type: ActionTypes.LIST_HISTORY,
					listHistory,
					total,
					limit,
				});
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function getUserByCode(data) {
	return async (dispatch) => {
		dispatch({ type: ActionTypes.RESET_SEARCH });

		await initAPI();
		await axios
			.post(`user/by-code`, data)
			.then((res) => {
				notify(res);

				if (res.data.code === 200) {
					let userData = res.data.data;
					if (userData === null) {
						dispatch({ type: ActionTypes.RESET_SEARCH });
					} else {
						dispatch({
							type: ActionTypes.GET_USER_BY_CODE,
							userData,
						});
					}
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function createAdmin(data) {
	initAPI();
	return async (dispatch) => {
		await axios
			.post(`user/create`, data)
			.then((res) => {
				notify(res);
				if (res.data.code === 200) {
					let admin = res.data.data;
					dispatch({ type: ActionTypes.ADMIN_CREATE, admin });
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function addClassToBill(data) {
	return (dispatch) => {
		dispatch({ type: ActionTypes.ADD_CLASSROOM, data });
	};
}

export function initItem(data) {
	return (dispatch) => {
		dispatch({ type: ActionTypes.INIT_ITEM, data });
	};
}

export function initItemEdit(data) {
	return (dispatch) => {
		dispatch({ type: ActionTypes.INIT_ITEM_EDIT, data });
	};
}

export function changeQty(data) {
	return (dispatch) => {
		dispatch({ type: ActionTypes.CHANGE_QTY, data });
	};
}

export function changeQtyClassRefund(data) {
	return (dispatch) => {
		dispatch({ type: ActionTypes.CHANGE_QTY_CLASS_REFUND, data });
	};
}

export function billCreate(data) {
	return async (dispatch) => {
		await initAPI();
		await axios
			.post(`bill/create`, data)
			.then((res) => {
				notify(res);

				if (res.data.code === 200) {
					dispatch({ type: ActionTypes.BILL_CREATE });
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function showBill(id) {
	initAPI();
	return async (dispatch) => {
		const data = {
			id: id,
		};
		await axios
			.post(`bill/detail`, data)
			.then((res) => {
				notify(res, false);
				if (res.data.code === 200) {
					let bill = res.data.data;
					dispatch({ type: ActionTypes.SHOW_BILL, bill });
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function updateBill(params) {
	return async (dispatch) => {
		await initAPI();
		await axios
			.post(`bill/update`, params)
			.then((res) => {
				notify(res);
				if (res.data.code === 200) {
					let video = res.data.data;
					dispatch({
						type: ActionTypes.UPDATE_BILL,
						video,
						redirect: true,
					});
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function classItemsCopy() {
	return (dispatch) => {
		dispatch({ type: ActionTypes.CLASS_ITEM_COPY });
	};
}

export function addDelete(id, mode = "deleteone") {
	return (dispatch) => {
		dispatch({ type: "ADD_DELETE", id, mode });
	};
}

export function checkAll(status) {
	return (dispatch) => {
		dispatch({ type: "CHECK_ALL", status: status });
	};
}

export function deleteBill(params) {
	return async (dispatch) => {
		await initAPI();
		await axios
			.post(`bill/delete`, params)
			.then((res) => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({ type: ActionTypes.DELETE_BILL });
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function selectClass(id, item) {
	return (dispatch) => {
		dispatch({ type: ActionTypes.SELECT_CLASS, id, item });
	};
}

export function disSelectClass(id, item) {
	return (dispatch) => {
		dispatch({ type: ActionTypes.DISSELECT_CLASS, id, item });
	};
}

export function resetStateBill() {
	return (dispatch) => {
		dispatch({ type: ActionTypes.RESET_STATE });
	};
}

export function changePayType(data) {
	return (dispatch) => {
		dispatch({ type: ActionTypes.CHANGE_PAYTYPE, data });
	};
}

export function listBillReport(data) {
	return async (dispatch) => {
		await initAPI();
		await axios
			.post(`bill/report`, data)
			.then((res) => {
				const data = res.data.data;

				dispatch({
					type: ActionTypes.BILL_REPORT,
					data,
				});
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function addClassRefund(data) {
	return (dispatch) => {
		dispatch({ type: ActionTypes.ADD_CLASSROOM_REFUND, data });
	};
}

export function disSelectClassRefund(id, item) {
	return (dispatch) => {
		dispatch({ type: ActionTypes.DISSELECT_CLASS_REFUND, id, item });
	};
}


export function revenueByCompany(data) {
	return async (dispatch) => {
		await initAPI();
		await axios
			.post(`report/revenue-by-company`, data)
			.then((res) => {
				const dataReport = res.data.data;

				dispatch({
					type: ActionTypes.REVENUE_BY_COMPANY,
					dataReport,
				});
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}


export function revenueBySubject(data) {
	return async (dispatch) => {
		await initAPI();
		await axios
			.post(`report/revenue-by-subject`, data)
			.then((res) => {
				const data = res.data.data;
				dispatch({
					type: ActionTypes.REVENUE_BY_SUBJECT,
					data,
				});
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function revenueByStaff(data) {
	return async (dispatch) => {
		await initAPI();
		await axios
			.post(`report/revenue-by-staff`, data)
			.then((res) => {
				const data = res.data.data;
				dispatch({
					type: ActionTypes.REVENUE_BY_STAFF,
					data,
				});
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function showBillRefund(id) {
	initAPI();
	return async (dispatch) => {
		const data = {
			id: id,
		};
		await axios
			.post(`bill/detail`, data)
			.then((res) => {
				notify(res, false);
				if (res.data.code === 200) {
					let bill = res.data.data;
					dispatch({ type: ActionTypes.SHOW_BILL_REFUND, bill });
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function addDataRemoveBill(data) {
	initAPI();
	return (dispatch) => {
		dispatch({
			type: ActionTypes.DATA_REMOVE_BILL,
			dataRemoveBill: data
		})
	}
}

export function downloadExcelData(data) {
	initAPI();
	return async (dispatch) => {
		await axios
			.post(`bill/export-excel`, data, { responseType: 'arraybuffer' })
			.then((res) => {
				// Check if response is JSON error (content-type will be application/json)
				const contentType = res.headers['content-type'];
				if (contentType && contentType.includes('application/json')) {
					// Decode arraybuffer to JSON to get error message
					const decoder = new TextDecoder('utf-8');
					const jsonString = decoder.decode(new Uint8Array(res.data));
					const jsonResponse = JSON.parse(jsonString);
					if (jsonResponse.code !== 200) {
						notify({ data: jsonResponse });
						return;
					}
				}

				res.responseType = "arraybuffer";
				const filename = 'HocPhi-' + new Date().getTime() + '.xlsx';
				window.saveAs(new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename);
			})
			.catch(async (err) => {
				// Handle arraybuffer error response
				if (err.response && err.response.data instanceof ArrayBuffer) {
					try {
						const decoder = new TextDecoder('utf-8');
						const jsonString = decoder.decode(new Uint8Array(err.response.data));
						const jsonResponse = JSON.parse(jsonString);
						notify({ data: jsonResponse });
						return;
					} catch (e) {
						// If parsing fails, fall through to default error handling
					}
				}
				responseError(err);
			});
	};
}
