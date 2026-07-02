import axios from 'axios';
import * as ActionTypes from './type';
import { initAPI, responseError, notify } from '../../config/api';

export function listCoupon(data) {
    initAPI();
    return async (dispatch) => {
        await axios.post('/coupon/list', data)
            .then((res) => {
                notify(res, false);
                if (res.data.code === 200) {
                    dispatch({ type: 'PAGING', page: data.page });
                    const coupons = res.data.data.records;
					const total = res.data.data.totalRecord;
					const limit = 20;
					dispatch({
						type: ActionTypes.LIST_COUPON,
						coupons,
						total,
						limit,
					});
                } else {
                    console.log('falure!');
                }
            })
    }
}

export function createCoupon(data) {
    initAPI();
    return async (dispatch) => {
        await axios.post('/coupon/create', data)
            .then((res) => {
                notify(res);
                if (res.data.code === 200) {
                    let coupon = res.data.data;
                    dispatch({
						type: ActionTypes.CREATE_COUPON,
						coupon,
						redirect: true,
					});
                } 
            })
            .catch((err) => {
                console.log(err);
            })
    }
}

export function getDataCoupon(data) {
    initAPI();
    return async (dispatch) => {
        await axios.post('/coupon/detail', data)
            .then((res) => {
                if (res.data.code === 200) {
                    let couponDetail = res.data.data;
                    dispatch({
						type: ActionTypes.DETAIL_COUPON,
						couponDetail,
						redirect: true,
					});
                } 
            })
            .catch((err) => {
                console.log(err);
            })
    }
}

export function updateCoupon(data) {
    initAPI();
    return async (dispatch) => {
        await axios.post('/coupon/update', data)
            .then((res) => {
                notify(res);
                if (res.data.code === 200) {
                    let coupon = res.data.data;
                    dispatch({
						type: ActionTypes.UPDATE_COUPON,
                        coupon,
						redirect: true,
					});
                } 
            })
            .catch((err) => {
                console.log(err);
            })
    }
}

export function deleteCoupon(params) {
	initAPI();

	return async dispatch => {
		await axios
			.post(`/coupon/delete`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({ type: ActionTypes.DELETE_COUPON });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function addDataRemoveCoupon(data) {
	initAPI();
	return (dispatch) => {
		dispatch({
			type: ActionTypes.DATA_REMOVE_COUPON,
			dataRemoveCoupon: data
		})
	}
}