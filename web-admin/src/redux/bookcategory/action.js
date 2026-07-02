import axios from 'axios';
import * as ActionTypes from './type';
import { initAPI, responseError, notify } from '../../config/api';

export function listBookCategory(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`/book-category/list`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					dispatch({ type: 'PAGING', page: data.page });
					const bookCategories = res.data.data.records;
					const total = res.data.data.totalRecord;
					const limit = 20;
					dispatch({
						type: ActionTypes.LIST_BOOK_CATEGORY,
						bookCategories,
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

export function createBookCategory(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`book-category/create`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let bookCategory = res.data.data;
					dispatch({
						type: ActionTypes.CREATE_BOOK_CATEGORY,
						bookCategory,
						redirect: true,
					});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function showBookCategory(id) {
	initAPI();
	return async dispatch => {
		const data = {
			id: id,
		};
		await axios
			.post(`book-category/detail`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					let bookCategory = res.data.data;
					dispatch({ type: ActionTypes.SHOW_BOOK_CATEGORY, bookCategory });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function updateBookCategory(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`book-category/update`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let bookCategory = res.data.data;
					dispatch({ type: ActionTypes.UPDATE_BOOK_CATEGORY, bookCategory });
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

export function deleteBookCategory(params) {
	initAPI();

	return async dispatch => {
		await axios
			.post(`book-category/delete`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({ type: ActionTypes.DELETE_BOOK_CATEGORY });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}
