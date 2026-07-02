import axios from 'axios';
import { initAPI, notify, responseError } from '../../config/api';
import * as ActionTypes from './type';

export function listDocument(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`/document/list`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					dispatch({ type: 'PAGING', page: data.page || 1 });
					const documents = res.data.data.records;
					const total = res.data.data.totalRecord;
					const limit = res.data.data.perPage;
					dispatch({
						type: ActionTypes.LIST_DOCUMENT,
						documents,
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

export function createDocument(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`document/create`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let document = res.data.data;
					dispatch({
						type: ActionTypes.CREATE_DOCUMENT,
						document,
						redirect: true,
					});
				}
			})
			.catch(err => {
				responseError(err);
			});
	};
}

export function ShowDocument(id) {
	initAPI();
	return async dispatch => {
		const data = {
			id: id,
		};
		await axios
			.post(`document/detail`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					let document = res.data.data;
					dispatch({ type: ActionTypes.SHOW_DOCUMENT, document });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function updateDocument(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`/document/update`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let document = res.data.data;
					dispatch({ type: ActionTypes.UPDATE_DOCUMENT, document });
				}
			})
			.catch(err => {
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

export function deleteDocument(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`/document/delete`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({ type: ActionTypes.DELETE_DOCUMENT });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function addDataRemoveDocument(data) {
	initAPI();
	return (dispatch) => {
		dispatch({
			type: ActionTypes.ADD_DATA_REMOVE_DOCUMENT,
			dataRemoveDocument: data
		})
	}
}
export function listDocumentCategory(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`document-category/list`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					dispatch({ type: 'PAGING', page: data.page || 1 });
					const main_categories = res.data.data.records;
					const total = res.data.data.totalRecord;
					const limit = res.data.data.perPage;
					dispatch({
						type: ActionTypes.LIST_DOCUMENT_CATEGORY,
						main_categories,
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

export function createDocumentCategory(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`document-category/create`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let document = res.data.data;
					dispatch({
						type: ActionTypes.CREATE_DOCUMENT_CATEGORY,
						document,
						redirect: true,
					});
				}
			})
			.catch(err => {
				responseError(err);
			});
	};
}

export function ShowDocumentCategory(id) {
	initAPI();
	return async dispatch => {
		const data = {
			id: id,
		};
		await axios
			.post(`/document-category/detail`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					let document = res.data.data;
					dispatch({ type: ActionTypes.SHOW_DOCUMENT_CATEGORY, document });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function updateDocumentCategory(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`/document-category/update`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let document = res.data.data;
					dispatch({ type: ActionTypes.UPDATE_DOCUMENT_CATEGORY, document });
				}
			})
			.catch(err => {
				responseError(err);
			});
	};
}

export function addDeleteCategory(id, mode = 'deleteone') {
	return dispatch => {
		dispatch({ type: 'ADD_DELETE', id, mode });
	};
}

export function checkAllCategory(status) {
	return dispatch => {
		dispatch({ type: 'CHECK_ALL', status: status });
	};
}

export function deleteDocumentCategory(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`/document-category/delete`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({ type: ActionTypes.DELETE_DOCUMENT_CATEGORY });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function addDataRemoveDocumentCategory(data) {
	initAPI();
	return (dispatch) => {
		dispatch({
			type: ActionTypes.ADD_DATA_REMOVE_DOCUMENT,
			dataRemoveDocument: data
		})
	}
}