import axios from 'axios';
import * as ActionTypes from './type';
import { initAPI, responseError, notify } from '../../config/api';

export function listReportBug(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`/report-bug/list`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					dispatch({ type: 'PAGING', page: data.page });
					const reportBugs = res.data.data.records;
					const total = res.data.data.totalRecord;
					const limit = res.data.data.perPage;
					dispatch({
						type: ActionTypes.LIST_REPORT_BUG,
						reportBugs,
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

export function createReportBug(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`report-bug/create`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let reportBug = res.data.data;
					dispatch({
						type: ActionTypes.CREATE_REPORT_BUG,
						reportBug,
						redirect: true,
					});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function showReportBug(id) {
	initAPI();
	return async dispatch => {
		const data = {
			id: id,
		};
		await axios
			.post(`report-bug/detail`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					let reportBug = res.data.data;
					dispatch({ type: ActionTypes.SHOW_REPORT_BUG, reportBug });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function updateReportBug(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`report-bug/update`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let reportBug = res.data.data;
					dispatch({
						type: ActionTypes.UPDATE_REPORT_BUG,
						reportBug,
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

export function filterCategory(data) {
	return dispatch => {
		dispatch({ type: 'FILTER', data });
	};
}

export function checkCount(data, config) {
	return dispatch => {
		dispatch({ type: 'CHECK_COUNT', data, config });
	};
}

export function deleteReportBug(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`report-bug/delete`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({ type: ActionTypes.DELETE_REPORT_BUG });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function addDataRemoveBug(data) {
	initAPI();
	return (dispatch) => {
		dispatch({
			type: ActionTypes.DATA_REMOVE_BUG,
			dataRemoveBug: data
		})
	}
}