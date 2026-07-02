import axios from 'axios';
import * as ActionTypes from './type';
import {initAPI, notify, responseError} from '../../config/api';

export function listMessage(data) {
	return async dispatch => {
		await initAPI();
		await axios
			.post(`message/list`, data)
			.then(res => {
				dispatch({type: 'PAGING', page: data.page});
				const messages = res.data.data.records;
				const total = res.data.data.totalRecord;
				const limit = res.data.data.perPage;
				dispatch({
					type: ActionTypes.LIST_MESSAGE,
					messages,
					total,
					limit,
				});
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function createMessage(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`message/create`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({
						type: ActionTypes.CREATE_MESSAGE,
						redirect: true,
					});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function sendMessage(data) {
	return async dispatch => {
		await initAPI();
		await axios
			.post(`message/send`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({type: ActionTypes.SEND_MESSAGE});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function showMessage(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`message/detail`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					let mess = res.data.data;
					dispatch({type: ActionTypes.SHOW_MESSAGE, mess});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function updateMessage(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`message/update`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({
						type: ActionTypes.UPDATE_MESSAGE,
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
		dispatch({type: 'ADD_DELETE', id, mode});
	};
}

export function checkAll(status) {
	return dispatch => {
		dispatch({type: 'CHECK_ALL', status: status});
	};
}

export function deleteMessage(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`message/delete`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({type: ActionTypes.DELETE_MESSAGE});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function addDataRemoveMessage(data) {
	initAPI();
	return (dispatch) => {
		dispatch({
			type: ActionTypes.DATA_REMOVE_MESSAGE,
			dataRemoveMessage: data
		})
	}
}
