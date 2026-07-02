import axios from "axios";
import * as ActionTypes from "./type";
import { initAPI, notify, responseError } from "../../config/api";

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

export function listSubject(data) {
	return async (dispatch) => {
		await initAPI();
		await axios
			.post(`/subject/list`, data)
			.then((res) => {
				const subjects = res.data.data.records;

				dispatch({
					type: ActionTypes.LIST_SUBJECT,
					subjects,
				});
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function listSchedule(data) {
	return async (dispatch) => {
		await initAPI();
		await axios
			.post(`/classroom-schedule/list`, data)
			.then((res) => {
				dispatch({ type: "PAGING", page: data.page });
				const schedules = res.data.data.records;
				const total = res.data.data.totalRecord;
				const limit = res.data.data.perPage;

				dispatch({
					type: ActionTypes.LIST_SCHEDULE,
					schedules,
					total,
					limit,
				});
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function createSchedule(data) {
	return async (dispatch) => {
		await initAPI();

		await axios
			.post(`/classroom-schedule/create`, data)
			.then((res) => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({ type: ActionTypes.SCHEDULE_CREATE });
				}
			})
			.catch(async (err) => {
				dispatch({ type: ActionTypes.CREATE_ERROR });
				responseError(err);
			});
	};
}

export function showSchedule(id) {
	initAPI();
	return async (dispatch) => {
		const data = {
			id: id,
		};
		await axios
			.post(`/classroom-schedule/detail`, data)
			.then((res) => {
				notify(res, false);
				if (res.data.code === 200) {
					let schedule = res.data.data;
					dispatch({ type: ActionTypes.SHOW_SCHEDULE, schedule });
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function updateSchedule(params) {
	return async (dispatch) => {
		await initAPI();
		await axios
			.post(`/classroom-schedule/update`, params)
			.then((res) => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({
						type: ActionTypes.UPDATE_SCHEDULE,
					});
				}
			})
			.catch(async (err) => {
				dispatch({ type: ActionTypes.UPDATE_ERROR });
				responseError(err);
			});
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

export function deleteSchedule(params) {
	return async (dispatch) => {
		await initAPI();
		await axios
			.post(`/classroom-schedule/delete`, params)
			.then((res) => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({ type: ActionTypes.DELETE_SCHEDULE });
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function resetStateSchedule() {
	return (dispatch) => {
		dispatch({ type: ActionTypes.RESET_STATE_SCHEDULE });
	};
}
