import axios from 'axios';
import * as ActionTypes from './type';
import { initAPI, responseError, notify } from '../../config/api';

export function listBook(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`/book/list`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					dispatch({ type: 'PAGING', page: data.page || 1 });
					const books = res.data.data.records;
					const total = res.data.data.totalRecord;
					const limit = res.data.data.perPage;
					dispatch({
						type: ActionTypes.LIST_BOOK,
						books,
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
					const limit = res.data.data.perPage;
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

export function createBook(data) {
	initAPI();
	return async dispatch => {
		return await axios.post(`book/create`, data)
			.then((res) => {
				notify(res);
				if (res.data.code === 200) {
					let book = res.data.data;
					dispatch({
						type: ActionTypes.CREATE_BOOK,
						book,
						redirect: true,
					});
				}
				return res;
			}).catch(async (err) => {
				responseError(err);
				return null;
			})
	};
}

export function showBook(id) {
	initAPI();
	return async dispatch => {
		const data = {
			id: id,
		};
		await axios
			.post(`book/detail`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					let book = res.data.data;
					dispatch({ type: ActionTypes.SHOW_BOOK, book });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function updateBook(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`book/update`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let book = res.data.data;
					dispatch({ type: ActionTypes.UPDATE_BOOK, book });
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

export function deleteBook(params) {
	initAPI();

	return async dispatch => {
		await axios
			.post(`book/delete`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({ type: ActionTypes.DELETE_BOOK });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function checkInputItem(id, mode='') {
	initAPI();
	return (dispatch) => {
		dispatch({ type: 'CHECK_INPUT_ITEM', id, mode });
	};
}

export function addDataRemoveBook(data) {
	initAPI();
	return (dispatch) => {
		dispatch({
			type: ActionTypes.DATA_REMOVE_BOOK,
			dataRemoveBook: data
		})
	}
}

//update 2106
export function bookUpdateRelate(data) {
	return async (dispatch) => {
		await initAPI();
		await axios
			.post(`book/update-relate`, data)
			.then((res) => {
				if (res.data.code === 200) {
					notify(res);
					dispatch({
						type: ActionTypes.BOOK_UPDATE_RELATE,
					});
				}
				notify(res, false);
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}


export function updateMetaData(data) {
	return async (dispatch) => {
		await initAPI();
		await axios
			.post(`book/update-meta-data`, data)
			.then((res) => {
				if (res.data.code === 200) {
					notify(res);
					let book = res.data.data;

					dispatch({
						type: ActionTypes.UPDATE_META_DATA,
						book
					});
				}
				notify(res, false);
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}


export function uploadImage(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`question/upload`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					const data = res.data.data;
					dispatch({ type: 'UPLOAD_IMAGE', data });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}
