import axios from 'axios';
import * as ActionTypes from './type';
import { initAPI, notify } from '../../config/api';

export function listPaymentLinks(data) {
  const { page, limit, keyword, creatorId, course, status } = data;
  initAPI();
  return async (dispatch) => {
    let query = `page=${page}&limit=${limit}`;
    if (keyword) query += `&keyword=${keyword}`;
    if (creatorId) query += `&creator_id=${creatorId}`;
    if (course) query += `&course=${course}`;
    if (status) query += `&status=${status}`;

    await axios.get(`/link-payment/list?${query}`)
      .then((res) => {
        notify(res, false);
        if (res.data.code === 200) {
          const paymentLinks = res.data.data.items;
          const total = res.data.data.total;
          const limit = res.data.data.perPage;
          dispatch({ type: 'PAGING', page: page, total, limit });
          dispatch({
            type: ActionTypes.LIST_PAYMENT_LINKS,
            paymentLinks,
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

export function listStatistics() {
  initAPI();
  return async (dispatch) => {
    await axios.get(`/link-payment/statistics`)
      .then((res) => {
        notify(res, false);
        if (res.data.code === 200) {
          const statistics = res.data.data;
          dispatch({
            type: ActionTypes.LIST_PAYMENT_STATISTIC,
            statistics
          });
        } else {
          console.log('falure!');
        }
      }).catch((err) => {
        console.log(err);
      })
  }
}

export function listCreator() {
  initAPI();
  return async (dispatch) => {
    await axios.get(`/user/get-admin-manager`)
    .then((res) => {
      const response = res.data
      if (response.code === 200) {
        const creators = response.data;
        dispatch({
          type: ActionTypes.LIST_CREATOR,
          creators: creators
        })
      }
    }).catch((err) => {
      console.log(err);
    })
  }
}
