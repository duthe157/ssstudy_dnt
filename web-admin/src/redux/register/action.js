import axios from 'axios';
import * as ActionTypes from './type';
import { initAPI, notify, responseError } from '../../config/api';

export function listRegistration(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`/registration/list`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					dispatch({ type: 'PAGING', page: data.page });
					const registrations = res.data.data.records;
					const total = res.data.data.totalRecord;
					const limit = res.data.data.perPage;
					dispatch({
						type: ActionTypes.LIST_REGISTATION,
						registrations,
						total,
						limit,
					});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function createRegistration(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`registration/create`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200 && res.data.data !== null) {
					let registration = res.data.data;
					dispatch({
						type: ActionTypes.CREATE_REGISTATION,
						registration,
						redirect: true,
					});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function showRegistration(id) {
	initAPI();
	return async dispatch => {
		const data = {
			id: id,
		};
		await axios
			.post(`registration/detail`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					let registration = res.data.data;
					dispatch({ type: ActionTypes.SHOW_REGISTATION, registration });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function updateRegistration(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`registration/update`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let registration = res.data.data;
					dispatch({
						type: ActionTypes.UPDATE_REGISTATION,
						registration,
						redirect: true,
					});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function addDelete(id, mode = 'deleteone') {
	return dispatch => {
		dispatch({ type: 'ADD_DELETE', id, mode });
	};
}

export function checkAll(status) {
	return dispatch => {
		dispatch({ type: 'CHECK_ALL', status: status });
	};
}

export function deleteRegistration(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`registration/delete`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({ type: ActionTypes.DELETE_REGISTATION });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}
