import axios from 'axios';
import * as ActionTypes from './type';
import { initAPI, responseError, notify } from '../../config/api';

export function listReview(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`/classroom-review/list`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					dispatch({ type: 'PAGING', page: data.page });
					const reviews = res.data.data.records;
					const total = res.data.data.total;
					const limit = 20;
					dispatch({
						type: ActionTypes.LIST_REVIEW,
						reviews,
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

export function createReview(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`classroom-review/create`, data)
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

export function showReview(id) {
	initAPI();
	return async dispatch => {
		const data = {
			id: id,
		};
		await axios
			.post(`classroom-review/detail`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					let review = res.data.data;
					dispatch({ type: ActionTypes.SHOW_REVIEW, review });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function updateReview(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`classroom-review/update`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let review = res.data.data;
					dispatch({ type: ActionTypes.UPDATE_REVIEW, review });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}


//Update trong màn chỉnh sửa đánh giá
export function reviewUpdate(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`review/updateReview`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let review = res.data.data;
					dispatch({ type: ActionTypes.UPDATE_REVIEW,
						review,
						redirect: true});
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

export function deleteReview(params) {
	initAPI();

	return async dispatch => {
		await axios
			.post(`classroom-review/delete`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({ type: ActionTypes.DELETE_REVIEW });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}
export function addDataRemoveClassroomReview(data) {
	initAPI();
	return (dispatch) => {
		dispatch({
			type: ActionTypes.DATA_REMOVE_CLASSROOM_REVIEW,
			dataRemoveClassroomReview: data
		})
	}
}
