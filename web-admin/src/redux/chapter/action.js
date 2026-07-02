import axios from 'axios';
import * as ActionTypes from './type';
import { initAPI, responseError, notify } from '../../config/api';

export function listCategory(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`/category/list`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					dispatch({ type: 'PAGING', page: data.page });
					const categories = res.data.data.records;
					const total = res.data.data.totalRecord;
					const limit = res.data.data.perPage;
					dispatch({
						type: ActionTypes.LIST_CATEGORY,
						categories,
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

export function listChapter(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`/chapter/list`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					dispatch({ type: 'PAGING', page: data.page });
					const chapters = res.data.data.records;
					const total = res.data.data.totalRecord;
					const limit = res.data.data.perPage;
					dispatch({
						type: ActionTypes.LIST_CHAPTER,
						chapters,
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

export function createChapter(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`chapter/create`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let chapter = res.data.data;
					dispatch({
						type: ActionTypes.CREATE_CHAPTER,
						chapter,
						redirect: true,
					});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function showChapter(id) {
	initAPI();
	return async dispatch => {
		const data = {
			id: id,
		};
		await axios
			.post(`chapter/detail`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					let chapter = res.data.data;
					dispatch({ type: ActionTypes.SHOW_CHAPTER, chapter });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function updateChapter(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`chapter/update`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let chapter = res.data.data;
					dispatch({ type: ActionTypes.UPDATE_CHAPTER, chapter });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function updateMetaDataChapter(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`/chapter/ordering`, {data : params})
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let chapter = res.data.data;
					dispatch({ type: ActionTypes.UPDATE_META_DATA, chapter });
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

export function deleteChapter(params) {
	initAPI();

	return async dispatch => {
		await axios
			.post(`chapter/delete`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({ type: ActionTypes.DELETE_CHAPTER });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function copyChapter(chapterId) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`chapter/copy`, {id: chapterId})
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({
						type: ActionTypes.COPY_CHAPTER,
						isCopyChapter: true
					});
				}
			})
			.catch(err => {
				responseError(err);
			});
	};
}

export function listChapterByClassRoom(id) {
	initAPI();

	return async dispatch => {
		await axios
			.post(`/classroom/list-chapter`, {classroom_id : id})
			.then(res => {
				// notify(res);
				if (res.data.code === 200) {
					const listSelectedchapters = res.data.data.records;
					dispatch({
						type: ActionTypes.LIST_CHAPTER_BY_CLASSROOM,
						listSelectedchapters,
					});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	}; 
}
