import axios from 'axios';
import * as ActionTypes from './type';
import { initAPI, responseError, notify } from '../../config/api';

export function listPost(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`/blog/list`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					dispatch({ type: 'PAGING', page: data.page });
					const posts = res.data.data.records;
					const total = res.data.data.totalRecord;
					const limit = 20;
					dispatch({
						type: ActionTypes.LIST_POST,
						posts,
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

export function showPost(id) {
	initAPI();
	return async (dispatch) => {
		const data = {
			id
		};
		await axios.post(`blog/detail`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					let post = res.data.data;
					dispatch({ type: ActionTypes.SHOW_POST, post });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	}
}

export function createPost(data) {
	initAPI();
	return async (dispatch) => {
		await axios.post(`/blog/create`, data)
			.then((res) => {
				notify(res);
				if (res.data.code === 200) {
					let post = res.data.data;
					dispatch({
						type: ActionTypes.CREATE_POST,
						post,
						redirect: true,
					})
				}
			})
			.catch(async err => {
				responseError(err);
			});
	}
}

export function updatePost(data) {
	initAPI();
	return async (dispatch) => {
		await axios.post('blog/update', data)
			.then((res) => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({
						type: ActionTypes.UPDATE_POST,
						redirect: true
					})
				}
			})
			.catch((err) => {
				console.log(err);
				responseError(err);
			})
	}
}

export function addDataRemovePost(data) {
	initAPI();
	return async (dispatch) => {
		dispatch({
			type:ActionTypes.DATA_REMOVE_POST,
			dataRemovePost: data
		})
	}
}

export function onDeletePost(data, isActionRemove = true) {
	initAPI();
	return async (dispatch) => {
		await axios.post('/blog/delete', data) 
			.then((res) => {
				if (res.data.code === 200 || res.data.data.code === 200) {
					notify(res);
					if (isActionRemove ) {
						dispatch({
							type: ActionTypes.DELETE_POST
						})
					}
				}
			})
			.catch((err) => {
				console.log(err);
			})
	}
}
