import * as ActionTypes from './type';
import axios from 'axios';
import { initAPI, notify, responseError } from '../../config/api';

export function listSubject(data) {
  initAPI();

  // đảm bảo data luôn là object
  const safeData = data || {};

  return async (dispatch) => {
    try {
      const res = await axios.post(`/subject/list`, safeData);

      // lấy page an toàn
      const page = safeData.page != null ? safeData.page : 1;
      dispatch({ type: "PAGING", page });

      const subjects = res.data?.data?.records || [];
      const total = res.data?.data?.totalRecord || 0;
      const limit = res.data?.data?.perPage || 10;
      dispatch({ type: ActionTypes.LIST_SUBJECT, subjects, total, limit });
    } catch (err) {
      responseError(err);
    }
  };
}

export function createSubject(data) {
  initAPI();
  return async (dispatch) => {
    await axios
      .post(`subject/create`, data)
      .then((res) => {
        notify(res);
        if (res.data.code === 200) {
          let subject = res.data.data;
          dispatch({
            type: ActionTypes.CREATE_SUBJECT,
            subject,
            redirect: true,
          });
        }
      })
      .catch(async (err) => {
        responseError(err);
      });
  };
}

export function showSubject(id) {
    initAPI();
    return async (dispatch) => {
        const data = {
            id: id
        }
        await axios.post(`subject/detail`, data)
            .then((res) => {
                notify(res, false);
                if (res.data.code === 200) {
                    let subject = res.data.data;
                    dispatch({ type: ActionTypes.SHOW_SUBJECT, subject });
                }
            }).catch(async err => {
                responseError(err);
            });
    };
}

export function updateSubject(params) {
    initAPI();
    return async (dispatch) => {
        await axios.post(`subject/update`, params)
            .then((res) => {
                notify(res);
                if (res.data.code === 200) {
                    let subject = res.data.data;
                    dispatch({ type: ActionTypes.UPDATE_SUBJECT, subject, redirect: true });
                }
            }).catch(async err => {
                responseError(err);
            });
    };
}

export function addDelete(id, mode = 'deleteone') {
    return (dispatch) => {
        dispatch({ type: 'ADD_DELETE', id, mode: mode });
    }
}

export function checkAll(status) {
    return (dispatch) => {
        dispatch({ type: 'CHECK_ALL', status: status });
    }
}

export function deleteSubject(params) {
    initAPI();
    return async (dispatch) => {
        await axios.post(`subject/delete`, params)
            .then((res) => {
                notify(res);
                if (res.data.code === 200) {
                    dispatch({ type: ActionTypes.DELETE_SUBJECT });
                }
            }).catch(async err => {
                responseError(err);
            });
    };
}

export function addDataRemoveSubject(data) {
	initAPI();
	return (dispatch) => {
		dispatch({
			type: ActionTypes.DATA_REMOVE_SUBJECT,
			dataRemoveSubject: data
		})
	}
}