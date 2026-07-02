import axios from 'axios';
import * as ActionTypes from './type';
import { initAPI, responseError, notify } from '../../config/api';

export function listBook(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`/book-id/list`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					dispatch({ type: 'PAGING', page: data.page || 1 });
					const bookIds = res.data.data.records;
					const total = res.data.data.totalRecord;
					const limit = res.data.data.perPage;
					dispatch({
						type: ActionTypes.LIST_BOOKID,
						books: bookIds,
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
			.post(`/bookId-category/list`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					dispatch({ type: 'PAGING', page: data.page });
					const bookCategories = res.data.data.records;
					const total = res.data.data.totalRecord;
					const limit = res.data.data.perPage;
					dispatch({
						type: ActionTypes.LIST_BOOKID_CATEGORY,
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
		return await axios.post(`book-id/create`, data)
			.then((res) => {
				notify(res);
				if (res.data.code === 200) {
					let bookId = res.data.data;
					dispatch({
						type: ActionTypes.CREATE_BOOKID,
						bookId,
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
			.post(`book-id/detail`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					let bookId = res.data.data;
					dispatch({ type: ActionTypes.SHOW_BOOKID, bookId });
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
		return await axios
			.post(`book-id/update`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let bookId = res.data.data;
					dispatch({ type: ActionTypes.UPDATE_BOOKID, bookId, redirect: true });
				}
				return res;
			})
			.catch(async err => {
				responseError(err);
				return null;
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
			.post(`book-id/delete`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({ type: ActionTypes.DELETE_BOOKID });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function checkInputItem(id, mode = '') {
	initAPI();
	return (dispatch) => {
		dispatch({ type: 'CHECK_INPUT_ITEM', id, mode });
	};
}

export function addDataRemoveBook(data) {
	initAPI();
	return (dispatch) => {
		dispatch({
			type: ActionTypes.DATA_REMOVE_BOOKID,
			dataRemoveBook: data
		})
	}
}

//update 2106
export function bookUpdateRelate(data) {
	return async (dispatch) => {
		await initAPI();
		await axios
			.post(`book-id/update-relate`, data)
			.then((res) => {
				if (res.data.code === 200) {
					notify(res);
					dispatch({
						type: ActionTypes.BOOKID_UPDATE_RELATE,
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
			.post(`book-id/update-meta-data`, data)
			.then((res) => {
				if (res.data.code === 200) {
					notify(res);
					let bookId = res.data.data;

					dispatch({
						type: ActionTypes.UPDATE_META_DATA,
						bookId
					});
				}
				notify(res, false);
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function listCode(data) {
	initAPI();
	return async (dispatch) => {
		await axios
			.post(`book-id/codes`, data)
			.then((res) => {
				notify(res, false);
				if (res.data.code === 200) {
					dispatch({ type: 'PAGING', page: data.page });
					const codes = res.data.data.items;
					const total = res.data.data.total;
					const limit = res.data.data.limit;
					dispatch({
						type: ActionTypes.LIST_CODE,
						codes,
						total,
						limit,
					});
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}
export function createCode(data) {
	initAPI();
	return async (dispatch) => {
		await axios
			.post(`book-id/generate-access-code`, data)
			.then((res) => {
				notify(res, false);
				if (res.data.code === 200)
					dispatch({ type: ActionTypes.CREATE_CODE });
			})
			.catch((err) => {
				responseError(err);
			});
	};
}
export function deleteCode(params) {
	initAPI();
	return async (dispatch) => {
		await axios
			.post(`book-id/delete-code`, params)
			.then((res) => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({ type: ActionTypes.DELETE_CODE });
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}
export function downloadExcelData(data) {
	initAPI();
	const options = {};
	options.responseType = 'arraybuffer';

	return async (dispatch) => {
		await axios
			.post(`book-id/export-code`, data, options)
			.then((res) => {
				res.responseType = "arraybuffer";
				const filename = 'Ma_Truy_Cap-' + new Date().getTime() + '.xlsx';
				window.saveAs(new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename);
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}
export function listMember(data) {
	return async (dispatch) => {
		await initAPI();
		const options = {};
		if (data.is_export)
			options.responseType = 'arraybuffer';

		await axios
			.post(`book-id/list-member`, data, options)
			.then((res) => {
				if (data.is_export) {
					res.responseType = "arraybuffer";
					const filename = 'Hs_Lop-' + new Date().getTime() + '.xlsx';
					window.saveAs(new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename);
				} else {
					notify(res, false);
					if (res.data.code === 200) {
						dispatch({ type: 'PAGING', page: data.page });
						const members = res.data.data.records;
						const total = res.data.data.totalRecord;
						const limit = res.data.data.perPage;
						dispatch({
							type: ActionTypes.BOOK_ID_MEMBER,
							members,
							total,
							limit,
						});
					}
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}
export function removeMember(data, isActionRemove = true) {
	return async (dispatch) => {
		await initAPI();
		await axios
			.post(`book-id/remove-member`, data)
			.then((res) => {
				if (res.data.code === 200 || res.data.data.code === 200) {
					notify(res);
					if (isActionRemove) {
						dispatch({
							type: ActionTypes.REMOVE_MEMBER,
						});
					}
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}
export function getInfoExport(data) {
	return async (dispatch) => {
		await initAPI();
		await axios
			.post(`book-id/info-export`, data)
			.then((res) => {
				notify(res, false);
				if (res.data.code === 200) {
					const infoExport = res.data.data.groups;
					dispatch({
						type: ActionTypes.GET_INFO_EXPORT,
						infoExport,
					});
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}
export function exportTestBook(data) {
	initAPI();
	const options = {};
	options.responseType = 'arraybuffer';

	return async (dispatch) => {
		await axios
			.post(`book-id/export-test`, data, options)
			.then((res) => {
				res.responseType = "arraybuffer";
				const filename = 'Export_Test-' + new Date().getTime() + '.docx';
				window.saveAs(new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }), filename);
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}
