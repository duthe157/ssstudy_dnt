import axios from 'axios';
import * as ActionTypes from './type';
import { initAPI, responseError, notify } from '../../config/api';

export function listVideo(data) {
	initAPI();

	return async dispatch => {
		await axios
			.post(`/video/list`, data)
			.then(res => {
				dispatch({ type: 'PAGING', page: data.page });
				const videos = res.data.data.records;
				const total = res.data.data.totalRecord;
				const limit = res.data.data.perPage;
				dispatch({ type: ActionTypes.LIST_VIDEO, videos, total, limit });
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function createVideo(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`video/create`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200 && res.data.data !== null) {
					let video = res.data.data;
					dispatch({
						type: ActionTypes.CREATE_VIDEO,
						video,
						redirect: true,
					});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function showVideo(id) {
	initAPI();
	return async dispatch => {
		const data = {
			id: id,
		};
		await axios
			.post(`video/detail`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					let video = res.data.data;
					dispatch({ type: ActionTypes.SHOW_VIDEO, video });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function updateVideo(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`video/update`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let video = res.data.data;
					dispatch({
						type: ActionTypes.UPDATE_VIDEO,
						video,
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

export function deleteVideo(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`video/delete`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({ type: ActionTypes.DELETE_VIDEO });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function addClass(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`video/add-classroom`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({ type: ActionTypes.ADD_CLASSROOM });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function removeClass(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`video/remove-classroom`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({ type: ActionTypes.REMOVE_CLASSROOM });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function listClass(dataList) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`video/classrooms`, dataList)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					const data = res.data.data.items;
					dispatch({
						type: ActionTypes.LIST_CLASS,
						data,
						id: dataList.exam_id,
					});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}
