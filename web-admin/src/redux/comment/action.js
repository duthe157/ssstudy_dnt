import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import * as ActionTypes from './type';
import { initAPI, notify, responseError } from '../../config/api';

export function listReview(data) {
    initAPI();
    return async (dispatch) => {
        await axios
            .post(`review/list`, data)
            .then((res) => {
                notify(res, false);
                if (res.data.code === 200) {
                    dispatch({ type: 'PAGING', page: data.page });
                    const dataReviews = res.data.data.records;
                    const total = res.data.data.totalRecord;
                    const limit = res.data.data.perPage;
                    dispatch({
                        type: ActionTypes.LIST_REVIEW,
                        dataReviews,
                        total,
                        limit,
                    });
                }
            })
            .catch(async (err) => {
                responseError(err);
            });
    };
}

export function detailReview(id) {
    initAPI();
    return async (dispatch) => {
        const data = {
            id: id,
        };
        await axios
            .post(`review/detail`, data)
            .then((res) => {
                notify(res, false);
                if (res.data.code === 200) {
                    let dataReview = res.data.data;
                    dispatch({ type: ActionTypes.DETAIL_REVIEW, dataReview });
                }
            })
            .catch(async (err) => {
                responseError(err);
            });
    };
}

export function createReview(data) {
    initAPI();
    return async (dispatch) => {
        await axios
            .post(`review/create`, data)
            .then((res) => {
                notify(res);
                if (res.data.code === 200) {
                    let dataReview = res.data.data;
                    dispatch({
                        type: ActionTypes.CREATE_REVIEW,
                        dataReview,
                        redirect: true,
                    });
                }
            })
            .catch(async (err) => {
                responseError(err);
            });
    };
}

export function updateReview(params) {
    initAPI();
    return async (dispatch) => {
        await axios
            .post(`review/update`, params)
            .then((res) => {
                notify(res);
                if (res.data.code === 200) {
                    let dataReview = res.data.data;
                    dispatch({
                        type: ActionTypes.UPDATE_REVIEW,
                        dataReview,
                        redirect: true,
                    });
                }
            })
            .catch(async (err) => {
                responseError(err);
            });
    };
}

export function addDelete(id, mode = 'deleteone') {
    return (dispatch) => {
        dispatch({ type: 'ADD_DELETE', id, mode });
    };
}

export function checkAll(status) {
    return (dispatch) => {
        dispatch({ type: 'CHECK_ALL', status: status });
    };
}

export function deleteReview(params) {
    initAPI();
    return async (dispatch) => {
        await axios
            .post(`review/delete`, params)
            .then((res) => {
                notify(res);
                if (res.data.code === 200) {
                    dispatch({ type: ActionTypes.DELETE_REVIEW });
                }
            })
            .catch(async (err) => {
                responseError(err);
            });
    };
}
