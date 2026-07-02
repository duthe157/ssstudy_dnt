import axios from 'axios';
import * as ActionTypes from './type';
import { initAPI, responseError, notify } from '../../config/api';

export function listAdultEvaluation(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`/adult-evalution/list`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					dispatch({ type: 'PAGING', page: data.page });
					const adultEvals = res.data.data.records;
					const total = res.data.data.totalRecord;
					const limit = res.data.data.perPage;
					dispatch({
						type: ActionTypes.LIST_ADULT_EVALUATION,
						adultEvals,
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

export function listClassRoom(data) {
  initAPI();
  return async (dispatch) => {
    await axios
      .post(`/classroom/list`, data)
      .then((res) => {
        notify(res, false);
        if (res.data.code === 200) {
          const classrooms = res.data.data.records;
          const total = res.data.data.totalRecord;
          const limit = res.data.data.perPage;
          dispatch({
            type: ActionTypes.LIST_CLASSROOM,
            classrooms,
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

export function listSubject(data) {
  initAPI();
  return async (dispatch) => {
    await axios
      .post(`/subject/list`, data)
      .then((res) => {
        notify(res, false);
        if (res.data.code === 200) {
          const subjects = res.data.data.records;
          const total = res.data.data.totalRecord;
          const limit = res.data.data.perPage;
          dispatch({
            type: ActionTypes.LIST_SUBJECT,
            subjects,
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

export function listClassroomGroup(data) {
  initAPI();
  return async (dispatch) => {
    await axios
      .post(`/classroom-group/list`, data)
      .then((res) => {
        notify(res, false);
        if (res.data.code === 200) {
          const classroomGroups = res.data.data.records;
          const total = res.data.data.totalRecord;
          const limit = res.data.data.perPage;

          dispatch({
            type: ActionTypes.LIST_CLASSROOM_GROUP,
            classroomGroups,
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

export function listModalClassRoom(data) {
  initAPI();
  return async (dispatch) => {
    try {
      const res = await axios.post(`/classroom/list`, data);
      if (res.data.code === 200) {
        dispatch({
          type: ActionTypes.LIST_MODAL_CLASSROOM,
          payload: res.data.data.records,
        });
      }
    } catch (err) {
      responseError(err);
    }
  };
}

export function listModalSubject(data) {
  initAPI();
  return async (dispatch) => {
    try {
      const res = await axios.post(`/subject/list`, data);
      if (res.data.code === 200) {
        dispatch({
          type: ActionTypes.LIST_MODAL_SUBJECT,
          payload: res.data.data.records,
        });
      }
    } catch (err) {
      responseError(err);
    }
  };
}

export function listModalClassroomGroup(data) {
  initAPI();
  return async (dispatch) => {
    try {
      const res = await axios.post(`/classroom-group/list`, data);
      if (res.data.code === 200) {
        dispatch({
          type: ActionTypes.LIST_MODAL_CLASSROOM_GROUP,
          payload: res.data.data.records,
        });
      }
    } catch (err) {
      responseError(err);
    }
  };
}

export function uploadImageReview(data) {
  initAPI();
  return () => {
    return axios
      .post(`file/upload`, data)
      .then((res) => {
        notify(res, false);
        if (res.data.code === 200) {
          const url = res.data.data;

          return url;
        }

        return null;
      })
      .catch((err) => {
        responseError(err);

        return null;
      });
  };
}

export function createAdultEvaluation(data) {
	initAPI();
	return async (dispatch) => {
		await axios.post(`/adult-evalution/create`, data)
			.then((res) => {
				notify(res);
				if (res.data.code === 200) {
					let adultEval = res.data.data;
					dispatch({
						type: ActionTypes.CREATE_ADULT_EVALUATION,
						adultEval,
						redirect: true,
					})
				}
			}).catch(async (err) => {
				responseError(err);
			})
	}
}

export function createReview(data) {
  initAPI();
  return async (dispatch) => {
    await axios
      .post(`/review/create`, data)
      .then((res) => {
        notify(res);
        if (res.data.code === 200) {
          let adultEval = res.data.data;
          dispatch({
            type: ActionTypes.CREATE_ADULT_EVALUATION,
            adultEval,
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
};

export function showAdultEvaluation(id) {
  initAPI();
	return async dispatch => {
		const data = {
			id
		};
		await axios.post(`/adult-evalution/detail`, data)
			.then(res => {
				notify(res, false);
        console.log(res);
				if (res.data.code === 200) {
					let adultEval = res.data.data;
					dispatch({ type: ActionTypes.SHOW_ADULT_EVALUATION, adultEval });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	}
}

export function updateAdultEvaluation(params) {
	initAPI();
	return async (dispatch) => {
		await axios.post(`/adult-evalution/update`, params)
			.then((res) => {
				notify(res);
				if (res.data.code === 200) {
					let adultEval = res.data.data;
          const dataDispatch = {
            type: ActionTypes.UPDATE_ADULT_EVALUATION,
            adultEval,
            redirect: true,
          };

					dispatch(dataDispatch);
				} else {
					console.log('failure!');
				}
			})
	}
}

export function updateReviews(data) {
  initAPI();
  return async (dispatch) => {
    try {
      const res = await axios.post(`/review/updates`, data);
      notify(res);

      if (res.data.code === 200) {
        let adultEval = res.data.data;
        dispatch({
          type: ActionTypes.UPDATE_REVIEWS,
          adultEval,
        });
        return true;
      } else {
        console.log("failure!");
        return false;
      }
    } catch (err) {
      responseError(err);
      return false;
    }
  };
}

export function checkInputItem(id, mode = "") {
	initAPI();
	return (dispatch) => {
		dispatch({
			type: ActionTypes.CHECK_INPUT_ITEM,
			id,
			mode
		})
	}
}
export function addDataRemoveAdultEval(data) {
	initAPI();
	return (dispatch) => {
		dispatch({
			type: ActionTypes.DATA_REMOVE_ADULTEVAL,
			dataRemoveAdultEval: data
		})
	}
}

export function onDeleteAdultEval(data, isActionRemove = true) {
	initAPI();
	return (dispatch) => {
		axios.post(`/adult-evalution/delete`, data)
			.then((res) => {
				if (res.data.code === 200 || res.data.data.code === 200) {
					notify(res);
					if (isActionRemove) {
						dispatch({
							type: ActionTypes.REMOVE_ADULT_EVALUATION
						})
					}
				}
			})
	}
}
