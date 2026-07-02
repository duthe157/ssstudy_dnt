import axios from 'axios';
import * as ActionTypes from './type';
import { initAPI, responseError, notify } from '../../config/api';

export function listBook(data) {
    initAPI();
    return async dispatch => {
        try {
            const res = await axios.post(`/book-id-course/list`, data);
            notify(res, false);
            if (res.data.code === 200) {
                dispatch({ type: ActionTypes.PAGING_BOOKID_COURSE, page: data.page || 1 });
                const { records: books, totalRecord: total, perPage: limit } = res.data.data;
                dispatch({
                    type: ActionTypes.LIST_BOOKID_COURSE,
                    books,
                    total,
                    limit,
                });
            }
        } catch (err) {
            responseError(err);
        }
    };
}

/**
 * Lấy danh sách Category của Book ID Course
 */
export function listBookCategory(data) {
    initAPI();
    return async dispatch => {
        try {
            const res = await axios.post(`/book-id-course/list-category`, data);
            notify(res, false);
            if (res.data.code === 200) {
                const { records: bookCategories, totalRecord: total, perPage: limit } = res.data.data;
                dispatch({
                    type: ActionTypes.LIST_BOOKID_COURSE_CATEGORY,
                    bookCategories,
                    total,
                    limit,
                });
            }
        } catch (err) {
            responseError(err);
        }
    };
}

/**
 * Lấy danh sách Book ID Course công khai
 */
export function listBookPublic(data) {
    initAPI();
    return async dispatch => {
        try {
            const res = await axios.post(`/book-id-course/list-public`, data);
            notify(res, false);
            if (res.data.code === 200) {
                dispatch({ type: ActionTypes.PAGING_BOOKID_COURSE, page: data.page || 1 });
                const { records: books, totalRecord: total, perPage: limit } = res.data.data;
                dispatch({
                    type: ActionTypes.LIST_BOOKID_COURSE,
                    books,
                    total,
                    limit,
                });
            }
        } catch (err) {
            responseError(err);
        }
    };
}

/**
 * Lấy danh sách Book ID Course liên quan
 */
export function listBookRelated(data) {
    initAPI();
    return async dispatch => {
        try {
            const res = await axios.post(`/book-id-course/list-related`, data);
            notify(res, false);
            if (res.data.code === 200) {
                const { records: books } = res.data.data;
                dispatch({
                    type: ActionTypes.LIST_BOOKID_COURSE,
                    books,
                });
            }
        } catch (err) {
            responseError(err);
        }
    };
}

/**
 * Tạo mới Book ID Course
 */
export function createBook(data) {
    initAPI();
    return async dispatch => {
        try {
            const res = await axios.post(`/book-id-course/create`, data);
            notify(res);
            if (res.data.code === 200) {
                dispatch({
                    type: ActionTypes.CREATE_BOOKID_COURSE,
                    bookIdCourse: res.data.data,
                    redirect: true,
                });
            }
        } catch (err) {
            responseError(err);
        }
    };
}

/**
 * Xem chi tiết Book ID Course
 * (Giữ tên showClassroom để tương thích với component hiện tại)
 */
export function showClassroom(id) {
    initAPI();
    return async dispatch => {
        try {
            const res = await axios.post(`/book-id-course/detail`, { id });
            notify(res, false);
            if (res.data.code === 200) {
                dispatch({ 
                    type: ActionTypes.SHOW_BOOKID_COURSE, 
                    bookIdCourse: res.data.data 
                });
            }
        } catch (err) {
            responseError(err);
        }
    };
}

/**
 * Cập nhật Book ID Course
 */
export function updateBook(params) {
    initAPI();
    return async dispatch => {
        try {
            const res = await axios.post(`/book-id-course/update`, params);
            notify(res);
            if (res.data.code === 200) {
                dispatch({ 
                    type: ActionTypes.UPDATE_BOOKID_COURSE, 
                    bookIdCourse: res.data.data, 
                    redirect: true 
                });
            }
        } catch (err) {
            responseError(err);
        }
    };
}

/**
 * Hành động chọn tất cả (local)
 */
export function checkAll(status) {
    return dispatch => {
        dispatch({ type: ActionTypes.CHECK_ALL, status });
    };
}

/**
 * Xóa Book ID Course
 */
export function deleteBook(params) {
    initAPI();
    return async dispatch => {
        try {
            const res = await axios.post(`/book-id-course/delete`, params);
            notify(res);
            if (res.data.code === 200) {
                dispatch({ type: ActionTypes.DELETE_BOOKID_COURSE });
            }
        } catch (err) {
            responseError(err);
        }
    };
}

/**
 * Thêm chuyên đề (Chapter) vào Book ID Course
 */
export function addChapter(params) {
    initAPI();
    return async dispatch => {
        try {
            const res = await axios.post(`/book-id-course/add-chapter`, params);
            notify(res);
            if (res.data.code === 200) {
                dispatch({
                    type: ActionTypes.ADD_CHAPTER,
                    bookIdCourse: res.data.data,
                });
            }
        } catch (err) {
            responseError(err);
        }
    };
}

/**
 * Cập nhật thông tin nhóm chuyên đề
 */
export function updateGroupChapter(params) {
    initAPI();
    return async dispatch => {
        try {
            const res = await axios.post(`/book-id-course/update-group-chapter`, params);
            notify(res);
            if (res.data.code === 200) {
                dispatch({
                    type: ActionTypes.UPDATE_GROUP_CHAPTER,
                    bookIdCourse: res.data.data,
                });
            }
        } catch (err) {
            responseError(err);
        }
    };
}

/**
 * Xóa chuyên đề khỏi Book ID Course
 */
export function removeChapter(params) {
    initAPI();
    return async dispatch => {
        try {
            const res = await axios.post(`/book-id-course/remove-chapter`, params);
            notify(res);
            if (res.data.code === 200) {
                dispatch({
                    type: ActionTypes.REMOVE_CHAPTER,
                    bookIdCourse: res.data.data,
                });
            }
        } catch (err) {
            responseError(err);
        }
    };
}

/**
 * Chọn/Bỏ chọn một item trong list
 */
export function checkInputItem(id, mode = '') {
    return dispatch => {
        dispatch({ type: ActionTypes.CHECK_INPUT_ITEM, id, mode });
    };
}

/**
 * Lưu dữ liệu cần xóa tạm thời
 */
export function addDataRemoveBook(data) {
    return dispatch => {
        dispatch({
            type: ActionTypes.DATA_REMOVE_BOOKID_COURSE,
            dataRemoveBook: data
        });
    };
}

/**
 * Cập nhật meta data cho Book ID Course
 */
export function updateMetaData(data) {
    initAPI();
    return async dispatch => {
        try {
            const res = await axios.post(`/book-id-course/update-meta-data`, data);
            notify(res);
            if (res.data.code === 200) {
                dispatch({
                    type: ActionTypes.UPDATE_META_DATA_BOOKID_COURSE,
                    bookIdCourse: res.data.data
                });
            }
        } catch (err) {
            responseError(err);
        }
    };
}

/**
 * Cập nhật các liên quan (Relate)
 */
export function updateRelate(data) {
    initAPI();
    return async dispatch => {
        try {
            const res = await axios.post(`/book-id-course/update-relate`, data);
            notify(res);
            if (res.data.code === 200) {
                dispatch({
                    type: ActionTypes.BOOKID_COURSE_UPDATE_RELATE,
                    bookIdCourse: res.data.data
                });
            }
        } catch (err) {
            responseError(err);
        }
    };
}

