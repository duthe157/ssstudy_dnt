import axios from 'axios';
import { initAPI, responseError, notify } from '../../config/api';
import * as ActionTypes from './type';

export function updateSetting(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`setting/update`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({
						type: ActionTypes.UPDATE_SETTING,
						params,
						redirect: true,
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

export function settingWebsite(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`setting/website`, params)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					const data = res.data.data;
					dispatch({
						type: ActionTypes.SETTING_WEBSITE,
						data,
					});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function pageUpdate(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`page/update`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					const data = res.data.data;
					dispatch({
						type: ActionTypes.PAGE_UPDATE,
						data,
					});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function pageDetail(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`page/detail`, params)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					const data = res.data.data.content_configs;
					dispatch({
						type: ActionTypes.PAGE_DETAIL,
						data,
					});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function aboutDetail() {
	initAPI();
	return async dispatch => {
		await axios
			.post(`about/detail`)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					const data = res.data.data;
					dispatch({
						type: ActionTypes.ABOUT_DETAIL,
						data,
					});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function aboutUpdate(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`about/update`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					const data = res.data.data;
					dispatch({
						type: ActionTypes.ABOUT_UPDATE,
						data,
					});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}
