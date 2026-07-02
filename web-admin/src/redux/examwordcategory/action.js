import axios from 'axios';
import * as ActionTypes from './type';
import { initAPI, responseError, notify } from '../../config/api';

export function listExamCategory(data) {
    initAPI();
    return async dispatch => {
        await axios
            .post(`/competition-part/list`, data)
            .then(res => {
                notify(res, false);
                if (res.data.code === 200) {
                    dispatch({ type: 'EXAMWORDCATEGORY_PAGING', page: data.page });

                    const examCategories = res.data.data ? res.data.data.records : [];
                    const total = res.data.data ? res.data.data.totalRecord : 0;
                    const limit = data.limit || 20;

                   

                    dispatch({
                        type: ActionTypes.LIST_EXAM_WORD_CATEGORY,
                        examCategories,
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

export function createExamCategory(data) {
    initAPI();
    return async dispatch => {
        await axios
            .post(`/competition-part/create`, data)
            .then(res => {
                notify(res);
                if (res.data.code === 200) {
                    let examCategory = res.data.data;
                    dispatch({
                        type: ActionTypes.CREATE_EXAM_WORD_CATEGORY,
                        examCategory,
                        redirect: true,
                    });
                }
            })
            .catch(async err => {
                responseError(err);
            });
    };
}

export function showExamCategory(id) {
    initAPI();
    return async dispatch => {
        const data = { id: id };
        await axios
            .post(`/competition-part/detail`, data)
            .then(res => {
                notify(res, false);
                if (res.data.code === 200) {
                    let examCategory = res.data.data;
                    dispatch({ type: ActionTypes.SHOW_EXAM_WORD_CATEGORY, examCategory });
                }
            })
            .catch(async err => {
                responseError(err);
            });
    };
}

export function updateExamCategory(params) {
    initAPI();
    return async dispatch => {
        await axios
            .post(`/competition-part/update`, params)
            .then(res => {
                notify(res);
                if (res.data.code === 200) {
                    let examCategory = res.data.data;
                    dispatch({ type: ActionTypes.UPDATE_EXAM_WORD_CATEGORY, examCategory });
                }
            })
            .catch(async err => {
                responseError(err);
            });
    };
}

export function addDelete(id, mode = 'deleteone') {
    return dispatch => {
        dispatch({ type: ActionTypes.EXAMWORDCATEGORY_ADD_DELETE, id, mode });
    };
}

export function checkAll(status) {
    return dispatch => {
        dispatch({ type: ActionTypes.EXAMWORDCATEGORY_CHECK_ALL, status: status });
    };
}

export function deleteExamCategory(params) {
    initAPI();

    console.log('deleteExamCategory params:', params);

    return async dispatch => {
        await axios
            .post(`/competition-part/delete`, params)
            .then(res => {
                console.log('deleteExamCategory response:', res.data);
                notify(res);
                if (res.data.code === 200) {
                    dispatch({ type: ActionTypes.DELETE_EXAM_WORD_CATEGORY });
                }
            })
            .catch(async err => {
                console.error('deleteExamCategory error:', err);
                responseError(err);
            });
    };
}

export function addDataRemoveExamCategory(data) {
    initAPI();
    return dispatch => {
        dispatch({
            type: ActionTypes.DATA_REMOVE_EXAM_WORD_CATEGORY,
            dataRemoveExamCategory: data,
        });
    };
}

export function setPartLists(partsActive = [], partsHidden = [], partsDeleted = []) {
    return { type: ActionTypes.EXAMWORDCATEGORY_SET_PART_LISTS, partsActive, partsHidden, partsDeleted };
}
export function addPart(part) {
    return { type: ActionTypes.EXAMWORDCATEGORY_PART_ADD, part };
}
export function hidePart(id) {
    return { type: ActionTypes.EXAMWORDCATEGORY_PART_HIDE, id };
}
export function unhidePart(id) {
    return { type: ActionTypes.EXAMWORDCATEGORY_PART_UNHIDE, id };
}
export function deletePart(id) {
    return { type: ActionTypes.EXAMWORDCATEGORY_PART_DELETE, id };
}

export function restorePart(id) {
    return { type: ActionTypes.EXAMWORDCATEGORY_PART_RESTORE, id };
}

export function purgePart(id) {
    return { type: ActionTypes.EXAMWORDCATEGORY_PART_PURGE, id };
}

export function renamePart(id, name) {
    return { type: ActionTypes.EXAMWORDCATEGORY_PART_RENAME, id, name };
}
