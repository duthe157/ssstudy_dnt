import axios from 'axios';
import * as ActionTypes from './type';
import { initAPI, responseError, notify } from '../../config/api';

export function listExamCategory(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`/exam-category/list`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					dispatch({ type: 'PAGING', page: data.page });
					const examCategories = res.data.data.records;
					const total = res.data.data.totalRecord;
					const limit = 20;
					dispatch({
						type: ActionTypes.LIST_EXAM_CATEGORY,
						examCategories,
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

export function createExamCategory(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`exam-category/create`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let examCategory = res.data.data;
					dispatch({
						type: ActionTypes.CREATE_EXAM_CATEGORY,
						examCategory,
						redirect: true,
					});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function showExamCategory(id) {
	initAPI();
	return async dispatch => {
		const data = {
			id: id,
		};
		await axios
			.post(`exam-category/detail`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					let examCategory = res.data.data;
					dispatch({ type: ActionTypes.SHOW_EXAM_CATEGORY, examCategory });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function updateExamCategory(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`exam-category/update`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let examCategory = res.data.data;
					dispatch({ type: ActionTypes.UPDATE_EXAM_CATEGORY, examCategory });
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

export function deleteExamCategory(params) {
	initAPI();

	return async dispatch => {
		await axios
			.post(`exam-category/delete`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({ type: ActionTypes.DELETE_EXAM_CATEGORY });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}
export function addDataRemoveExamCategory(data) {
	initAPI();
	return (dispatch) => {
		dispatch({
			type: ActionTypes.DATA_REMOVE_EXAM_CATEGORY,
			dataRemoveExamCategory: data
		})
	}
}