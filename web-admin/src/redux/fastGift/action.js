import axios from "axios";
import { initAPI, notify, responseError } from "../../config/api";
import * as ActionTypes from "./type";
import { data } from "jquery";

export function listGift(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`fast-gift/list`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					dispatch({ type: 'PAGING', page: data.page || 1 });
					const fastgifts = res.data.data.records;
					const total = res.data.data.totalRecord;
					const limit = res.data.data.perPage;
					dispatch({
						type: ActionTypes.LIST_GIFT,
						fastgifts,
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
export function detailGift(id) {
	initAPI();
	return async dispatch => {
		const data = {
			id: id,
		};
		await axios
			.post(`fast-gift/detail`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					let fastgift = res.data.data;
					dispatch({ type: ActionTypes.DETAIL_GIFT, fastgift });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}
export function deleteGift(id) {
	initAPI();
	return async dispatch => {
		const data = {
			id: id,
		};
		await axios
			.post(`fast-gift/delete`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					let fastgift = res.data.data;
					dispatch({ type: ActionTypes.DELETE_GIFT, fastgift });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}
export function createGift(data) {
	initAPI();
	return async dispatch => {
		await axios.post(`fast-gift/create`, data)
			.then((res) => {
				notify(res);
				if (res.data.code === 200) {
					let fastgift = res.data.data;
					dispatch({
						type: ActionTypes.CREATE_GIFT,
						fastgift,
						redirect: true,
					});
				}
			}).catch(async (err) => {
				responseError(err);
			})
	};
}
export function updateGift(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`fast-gift/update`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let fastgift = res.data.data;
					dispatch({ type: ActionTypes.UPDATE_GIFT, fastgift });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}
export function updateStatusGift(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`fast-gift/update-status`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let fastgift = res.data.data;
					dispatch({ type: ActionTypes.UPDATE_GIFT, fastgift });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}