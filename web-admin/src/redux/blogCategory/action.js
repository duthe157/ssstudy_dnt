import axios from 'axios';
import * as ActionTypes from './type';
import { initAPI, responseError, notify } from '../../config/api';

export function listBlogCategory(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`/blog-category/list`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					dispatch({ type: 'PAGING', page: data.page });
					const blogCategories = res.data.data.records;
					const total = res.data.data.totalRecord;
					const limit = 20;
					dispatch({
						type: ActionTypes.LIST_BLOG_CATEGORY,
						blogCategories,
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

export function createBlogCategory(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`blog-category/create`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let blogCategory = res.data.data;
					dispatch({
						type: ActionTypes.CREATE_BLOG_CATEGORY,
						blogCategory,
						redirect: true,
					});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function showBlogCategory(id) {
	initAPI();
	return async dispatch => {
		const data = {
			id: id,
		};
		await axios
			.post(`blog-category/detail`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					let blogCategory = res.data.data;
					dispatch({ type: ActionTypes.SHOW_BLOG_CATEGORY, blogCategory });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function updateBlogCategory(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`blog-category/update`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let blogCategory = res.data.data;
					dispatch({ type: ActionTypes.UPDATE_BLOG_CATEGORY, blogCategory });
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

export function deleteBlogCategory(params) {
	initAPI();

	return async dispatch => {
		await axios
			.post(`blog-category/delete`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({ type: ActionTypes.DELETE_BLOG_CATEGORY });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}
