import { baseURL } from './config';
import axios from 'axios';
import { notification } from 'antd';

export const initAPI = () => {
	var token = null;
	axios.defaults.baseURL = baseURL;
	axios.defaults.headers.post['Content-Type'] = 'application/json';
	if (localStorage.getItem('SSID')) {
		token = localStorage.getItem('SSID');
		axios.defaults.headers.common['Authorization'] = token;
	}
};

export const redirectToLogin = code => {
	if (code === 401) {
		localStorage.clear();
		window.location.href = '/login';
	}
};

export const notify = (res, showSuccess = true) => {
	if (res.data.code !== 200) {
		notification.warning({
			message: res.data.message,
			placement: 'topRight',
			top: 50,
			duration: 3,
		});
	}

	if (res.data.code === 200 && showSuccess) {
		if (res.data.message !== '')
			notification.success({
				message: res.data.message,
				placement: 'topRight',
				top: 50,
				duration: 3,
			});
	}
};

export const responseError = err => {
	if (err && err.response) {
		if (err.response.status === 401) {
			redirectToLogin(err.response.status);
		} else {
			if (err.response.data && err.response.data.message)
				notification.warning({
					message: err.response.data.message,
					placement: 'topRight',
					top: 50,
					duration: 3,
				});
		}
	} else {
		notification.error({
			message: 'Lỗi. Vui lòng thử lại!',
			placement: 'topRight',
			top: 50,
			duration: 3,
		});
	}
};
