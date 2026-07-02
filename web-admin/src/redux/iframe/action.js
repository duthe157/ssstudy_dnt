import axios from 'axios';
import * as ActionTypes from './type';
import { initAPI, responseError, notify } from '../../config/api';

export function listIframe(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`/iframe/list`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					dispatch({ type: 'PAGING', page: data.page || 1 });
					const iframes = res.data.data.records;
					const total = res.data.data.totalRecord;
					const limit = res.data.data.perPage;
					dispatch({
						type: ActionTypes.LIST_IFRAME,
						iframes,
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

export function deleteIframe(params) {
	initAPI();

	return async dispatch => {
		await axios
			.post(`iframe/delete`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({ type: ActionTypes.DELETE_IFRAME });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function createIframeAction(data) {
	initAPI();
	return async dispatch => {
		await axios.post(`iframe/create`, data)
			.then((res) => {
				notify(res);
				if (res.data.code === 200) {
					let iframe = res.data.data;
					dispatch({
						type: ActionTypes.CREATE_IFRAME,
						iframe,
						redirect: true,
					});
				}
			}).catch(async (err) => {
				responseError(err);
			})
	};
}

export function updateIframeAction(data) {
	initAPI();
	return async dispatch => {
		await axios.post(`iframe/update`, data)
			.then((res) => {
				notify(res);
				if (res.data.code === 200) {
					let iframe = res.data.data;
					dispatch({
						type: ActionTypes.UPDATE_IFRAME,
						iframe,
						redirect: true,
					});
				}
			}).catch(async (err) => {
				responseError(err);
			})
	};
}

export function detailIframe(id) {
	initAPI();
	return async dispatch => {
		const data = {
			id: id,
		};
		await axios
			.post(`iframe/detail`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					let iframeItem = res.data.data;
					dispatch({ type: ActionTypes.DETAIL_IFRAME, iframeItem });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function login(data) {
	return async (dispatch) => {
		await initAPI();
		axios
			.post(`/auth/signin`, data)
			.then((res) => {
				notify(res);
				if (res.data.code === 200) {
					let token = res.data.data.token;
					let user = res.data.data;
					dispatch({ type: ActionTypes.LOGIN_IFRAME, token, user });
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function signupIframe(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`auth/signup-iframe`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					let token = res.data.data.token;
					let user = res.data.data;
					dispatch({ type: ActionTypes.SIGN_UP_IFRAME, token, user });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function signupIframeEmail(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`auth/send-verification-email`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					let message = res.data.message;
					let code = res.data.code;
					dispatch({ type: ActionTypes.SIGN_UP_IFRAME_EMAIL, message, code });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}