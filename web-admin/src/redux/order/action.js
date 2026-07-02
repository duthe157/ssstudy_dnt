import axios from 'axios';
import * as ActionTypes from './type';
import { initAPI, notify } from '../../config/api';

export function listOrder(data) {
    initAPI();
    return async (dispatch) => {
        await axios.post('/order/list', data)
            .then((res) => {
                notify(res, false);
                if (res.data.code === 200) {
                    dispatch({ type: 'PAGING', page: data.page });
                    const orders = res.data.data.records;
					const total = res.data.data.totalRecord;
					const limit = res.data.data.perPage;
					dispatch({
						type: ActionTypes.LIST_ORDER,
						orders,
						total,
						limit,
					});
                } else {
                    console.log('falure!');
                }
            }).catch((err) => {
                console.log(err);
            })
    }
}

export function showOrder(id) {
    const data = {
        id
    };
    initAPI();
    return async (dispatch) => {
        await axios.post('/order/detail', data)
            .then((res) => {
                if (res.data.code === 200) {
                    var order = res.data.data;
                    dispatch({
                        type: ActionTypes.SHOW_ORDER_DETAIL,
                        order
                    })
                }
            }).catch((err) => {
                console.log(err);
            })
    }
}

export function updateOrderStatus(params) {
    initAPI();
    return async (dispatch) => {
        await axios.post('/order/update-status', params)
            .then((res) => {
                notify(res);
                if (res.data.code === 200) {
                    var order = res.data.data;
                    dispatch({
                        type: ActionTypes.SHOW_ORDER_DETAIL,
                        order
                    })
                }
            }).catch((err) => {
                console.log(err);
            })
    }
}