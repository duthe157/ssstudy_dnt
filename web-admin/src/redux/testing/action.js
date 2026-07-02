import axios from 'axios';
import * as ActionTypes from './type';
import {initAPI, notify, responseError} from '../../config/api';

export function listTesting(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`/testing/list`, data)
			.then(res => {
				dispatch({type: 'PAGING', page: data.page});
				const testings = res.data.data.records;
				const total = res.data.data.totalRecord;
				const limit = res.data.data.perPage;
				dispatch({
					type: ActionTypes.LIST_TESTING,
					testings,
					total,
					limit,
				});
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function createTesting(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`testing/create`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let video = res.data.data;
					dispatch({type: ActionTypes.CREATE_TESTING, video});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function showTesting(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`testing/detail`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					let testing = res.data.data;
					dispatch({
						type: ActionTypes.SHOW_TESTING,
						testing,
						id: data.id,
					});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function updateTesting(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`testing/update`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let video = res.data.data;
					dispatch({type: ActionTypes.UPDATE_TESTING, video});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function confirmTesting(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`testing/confirm`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({type: ActionTypes.CONFIRM_TESTING});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function addDelete(id, mode = 'deleteone') {
	return dispatch => {
		dispatch({type: 'ADD_DELETE', id, mode});
	};
}

export function deleteTesting(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`testing/delete`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({type: ActionTypes.DELETE_TESTING});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function checkAll(status) {
	return dispatch => {
		dispatch({type: 'CHECK_ALL', status: status});
	};
}
export function updatePoint(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`testing/update-point`, data)
			.then(res => {
				if (res.data.code === 200) {
					notify(res);
					dispatch({type: ActionTypes.UPDATE_POINT});
				}
				notify(res, false);
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function addDataRemoveTesting(data) {
	initAPI();
	return (dispatch) => {
		dispatch({
			type: ActionTypes.DATA_REMOVE_TESTING,
			dataRemoveTesting: data
		})
	}
}
