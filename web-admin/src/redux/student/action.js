import axios from "axios";
import * as ActionTypes from "./type";
import { initAPI, notify, responseError } from "../../config/api";

export function listStudent(data) {
	initAPI();
	return async (dispatch) => {
		await axios
			.post(`user/list`, data)
			.then((res) => {
				dispatch({ type: "PAGING", page: data.page });
				const students = res.data.data.records;
				const total = res.data.data.totalRecord;
				const limit = res.data.data.perPage;
				dispatch({
					type: ActionTypes.LIST_STUDENT,
					students,
					total,
					limit,
				});
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function listAdmin(data) {
	initAPI();
	return async (dispatch) => {
		await axios
			.post(`user/admins`, data)
			.then((res) => {
				dispatch({ type: "PAGING", page: data.page });
				const students = res.data.data.records;
				const total = res.data.data.totalRecord;
				const limit = res.data.data.perPage;
				dispatch({
					type: ActionTypes.LIST_STUDENT,
					students,
					total,
					limit,
				});
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function listAccountant(data) {
	initAPI();
	return async (dispatch) => {
		await axios
			.post(`user/accountants`, data)
			.then((res) => {
				dispatch({ type: "PAGING", page: data.page });
				const accountants = res.data.data.records;				
				const total = res.data.data.totalRecord;
				const limit = res.data.data.perPage;
				dispatch({
					type: ActionTypes.LIST_ACCOUNTANT,
					accountants,
					total,
					limit,
				});
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
					dispatch({ type: ActionTypes.ADMIN_CREATE, admin, redirect: true });
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function updateAdmin(data) {
	initAPI();
	return async (dispatch) => {
		await axios
			.post(`user/update`, data)
			.then((res) => {
				notify(res);
				if (res.data.code === 200) {
					let admin = res.data.data;
					dispatch({ type: ActionTypes.ADMIN_UPDATE, admin });
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function createStudent(data) {
	initAPI();
	return async (dispatch) => {
		await axios
			.post(`auth/signin`, data)
			.then((res) => {
				notify(res);
				if (res.data.code === 200) {
					let student = res.data.data;
					dispatch({ type: ActionTypes.CREATE_STUDENT, student });
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function showStudent(id) {
	initAPI();
	return async (dispatch) => {
		const data = {
			id: id,
		};
		await axios
			.post(`user/detail`, data)
			.then((res) => {
				notify(res, false);
				if (res.data.code === 200) {
					let student = res.data.data;
					dispatch({ type: ActionTypes.SHOW_STUDENT, student });
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function updateStudent(params) {
	initAPI();
	return async (dispatch) => {
		await axios
			.post(`user/update`, params)
			.then((res) => {
				notify(res);
				if (res.data.code === 200) {
					let video = res.data.data;
					dispatch({
						type: ActionTypes.UPDATE_STUDENT,
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

export function hotResetPassword(id) {
	initAPI();
	if (window.confirm('Bạn chắc chắn muốn reset về mật khẩu mặc định?')) {
		return async (dispatch) => {
			await axios
				.post(`user/hot-reset-password`, { user_id: id })
				.then((res) => {
					notify(res);
				})
				.catch(async (err) => {
					responseError(err);
				});
		};
	} else {
		return async (dispatch) => {

		};
	}
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

export function deleteStudent(params) {
	initAPI();
	return async (dispatch) => {
		await axios
			.post(`user/delete`, params)
			.then((res) => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({ type: ActionTypes.DELETE_STUDENT });
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}


/* check code */
export function checkCode(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`user/check-code`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let dataUser = res.data.data.user;
					let dataClass = res.data.data.classroom;
					let statusCode = res.data.code;
					let data = res.data.data;
					let isDoneHomeWork = res.data.data.isDoneHomeWork;
					let lastTesting = res.data.data.lastTesting;
					let attendance = res.data.data.attendance;
					dispatch({
						type: ActionTypes.CHECK_CODE,
						dataUser,
						statusCode,
						dataClass,
						data,
						isDoneHomeWork,
						lastTesting,
						attendance
					});
				}
			})
			.catch(err => {
				responseError(err);
			});
	};
}

export function listClassroom(data) {
	return async (dispatch) => {
		await initAPI();
		await axios
			.post(`classroom/list`, data)
			.then((res) => {
				notify(res, false);
				if (res.data.code === 200) {
					const classrooms = res.data.data.records;

					dispatch({
						type: ActionTypes.LIST_CLASSROOM,
						classrooms,
					});
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function onSetCredit(data) {
	return async(dispatch) => {
		await initAPI();
		await axios.post('credit/create', data)
			.then((res) => {
				notify(res);
				if (res.data.code === 200) {
					var credit = res.data.data;
					dispatch({
						type: ActionTypes.CREDIT_CREATE,
						credit
					})
				}
			}).catch((err) => {
				responseError(err);
			})
	}
}

export function addDataRemoveStudent(data) {
	initAPI();
	return (dispatch) => {
		dispatch({
			type: ActionTypes.DATA_REMOVE_STUDENT,
			dataRemoveStudent: data
		})
	}
}

export function addDataRemoveAdmin(data) {
	initAPI();
	return (dispatch) => {
		dispatch({
			type: ActionTypes.DATA_REMOVE_ADMIN,
			dataRemoveAdmin: data
		})
	}
}

export function forceActivateUser(userId) {
	initAPI();
	return async (dispatch) => {
		await axios
			.post(`user/force-activate`, { user_id: userId })
			.then((res) => {
				notify(res);
				if (res.data && res.data.code === 200) {
					// Refresh current student details if available
					if (userId) {
						dispatch(showStudent(userId));
					}
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}