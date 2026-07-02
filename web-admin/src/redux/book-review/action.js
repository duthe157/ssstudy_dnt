import axios from 'axios';
import * as ActionTypes from './type';
import { initAPI, responseError, notify } from '../../config/api';

export function listBookReview(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`/book-review/list`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					dispatch({ type: 'PAGING', page: data.page });
					const bookReviews = res.data.data.records;
					const total = res.data.data.totalRecord;
					const limit = res.data.data.perPage;
					dispatch({
						type: ActionTypes.LIST_BOOK_REVIEW,
						bookReviews,
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

export function showReview(id) {
	initAPI();
	return async dispatch => {
		const data = {
			id: id,
		};
		await axios
			.post(`book-review/detail`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					let bookReview = res.data.data;
					dispatch({ type: ActionTypes.SHOW_BOOK_REVIEW, bookReview });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function addDataRemoveBookReview(data) {
	return (dispatch) => {
		dispatch({
			type: ActionTypes.DATA_REMOVE_BOOK_REVIEW,
			dataRemoveBookReview: data
		})
	}
}

export function updateReview(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`book-review/update`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let review = res.data.data;
					dispatch({ type: ActionTypes.UPDATE_BOOK_REVIEW, review });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function deleteBookReview(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`book-review/delete`, params)
			.then((res) => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({ type: ActionTypes.DELETE_BOOK_REVIEW });
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function createReview(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`book-review/create`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let review = res.data.data;
					dispatch({
						type: ActionTypes.CREATE_REVIEW,
						review,
						redirect: true,
					});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function checkAll(status) {
	return dispatch => {
		dispatch({ type: 'CHECK_ALL', status: status });
	};
}