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

export function createCategory(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`category/create`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let category = res.data.data;
					dispatch({
						type: ActionTypes.CREATE_CATEGORY,
						category,
						redirect: true,
					});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function showCategory(id, classroomID = null) {
	initAPI();
	return async dispatch => {
		const data = {
			id: id,
			classroom_id: classroomID
		};
		await axios
			.post(`category/detail`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					let category = res.data.data;
					dispatch({ type: ActionTypes.SHOW_CATEGORY, category });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function updateCategory(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`category/update`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let category = res.data.data;
					dispatch({
						type: ActionTypes.UPDATE_CATEGORY,
						category,
						redirect: true,
					});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}
export function updateMetaDataCategory(params) {
	initAPI();

	return async dispatch => {
		await axios
			.post(`/category/ordering`, { data: params })
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let category = res.data.data;
					dispatch({
						type: ActionTypes.UPDATE_META_DATA,
						category,
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

export function assignValue(initCategory, data, configs, chapter_ids) {
	return dispatch => {
		dispatch({
			type: ActionTypes.ASSIGN,
			initCategory,
			data,
			configs,
			chapter_ids,
		});
	};
}

export function deleteCategory(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`category/delete`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({ type: ActionTypes.DELETE_CATEGORY });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function listCategoryVideo(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`/category/list-video`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code == 200) {
					const categoryVideos = res.data.data.records;
					const total = res.data.data.totalRecord;
					const limit = res.data.data.perPage;
					dispatch({
						type: ActionTypes.LIST_CATEGORY_VIDEO,
						categoryVideos,
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

export function createCategoryVideo(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`category/create-video`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let categoryVideo = res.data.data;
					dispatch({
						type: ActionTypes.CREATE_CATEGORY_VIDEO,
						categoryVideo,
						redirect: true,
					});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function showCategoryVideo(id) {
	initAPI();
	return async dispatch => {
		const data = {
			id: id,
		};
		await axios
			.post(`category/detail-video`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					let categoryVideo = res.data.data;
					dispatch({ type: ActionTypes.SHOW_CATEGORY_VIDEO, categoryVideo });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function updateCategoryVideo(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`category/update-video`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let categoryVideo = res.data.data;
					dispatch({
						type: ActionTypes.UPDATE_CATEGORY_VIDEO,
						categoryVideo,
						redirect: true,
					});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function deleteCategoryVideo(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`category/delete-video`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({ type: ActionTypes.DELETE_CATEGORY_VIDEO });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}