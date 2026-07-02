import axios from 'axios';
import { initAPI, notify, responseError } from '../../config/api';
import * as ActionTypes from './type';

export function listQuestion(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`/question/list`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					if (data.page !== null) {
						dispatch({ type: 'PAGING', page: data.page || 1 });
					}
					const questions = res.data.data.records;
					const total = res.data.data.totalRecord;
					const limit = res.data.data.perPage;
					dispatch({
						type: ActionTypes.LIST_QUESTION,
						questions,
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

export function createQuestion(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`question/create`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200 && res.data.data !== null) {
					let question = res.data.data;
					dispatch({
						type: ActionTypes.CREATE_QUESTION,
						question,
						redirect: true,
					});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}
export function createQuestionJson(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`question/create`, data)
			.then(res => {
				if (res.data.code === 200 && res.data.data !== null) {
					let question = res.data.data;
					dispatch({
						type: ActionTypes.CREATE_QUESTION,
						question,
						redirect: true,
					});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function showQuestion(id) {
	initAPI();
	return async dispatch => {
		const data = {
			id: id,
		};
		await axios
			.post(`question/detail`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code) {
					let question = res.data.data;
					dispatch({ type: ActionTypes.SHOW_QUESTION, question });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function updateQuestion(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`question/update`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {

					let question = res.data.data;
					dispatch({
						type: ActionTypes.UPDATE_QUESTION,
						params,
						redirect: true,
						question
					});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function addDelete(id, mode = 'deleteone') {
	return dispatch => {
		dispatch({ type: 'ADD_DELETE', id, mode });
	};
}

export function deleteQuestion(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`question/delete`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({ type: ActionTypes.DELETE_QUESTION });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function uploadImage(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`question/upload`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					const data = res.data.data;
					dispatch({ type: 'UPLOAD_IMAGE', data });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function selectQuestion(id, item) {
	return dispatch => {
		dispatch({ type: 'SELECT_QUESTION', id, item });
	};
}

export function disSelectQuestion(id, item) {
	return dispatch => {
		dispatch({ type: 'DISSELECT_QUESTION', id, item });
	};
}

export function assignValue(exam) {
	return dispatch => {
		dispatch({ type: 'ASSIGN_VALUE', exam });
	};
}

export function handleChangeExamQuestions(data, arrIds) {
	return dispatch => {
		dispatch({ type: 'CHANGE_EXAM_QUESTION', data ,arrIds })
	}
}

export function removeIds() {
	return dispatch => {
		dispatch({ type: 'REMOVE_IDS' });
	};
}

export function removeExamQuestion() {
	return dispatch => {
		dispatch({ type: 'REMOVE_EXAM_QUESTION' });
	};
}

export function checkAll(status) {
	return dispatch => {
		dispatch({ type: 'CHECK_ALL', status: status });
	};
}


export function addClassroom(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`question/add-classroom`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({ type: ActionTypes.ADD_CLASSROOM });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function removeClassroom(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`question/remove-classroom`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({ type: ActionTypes.REMOVE_CLASSROOM });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function getQuestionClassrooms(dataList) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`question/classrooms`, dataList)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					const data = res.data.data.records;
					dispatch({
						type: ActionTypes.GET_LIST_CLASSROOM,
						data,
						id: dataList.exam_id,
					});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function addDataRemoveQuestion(data) {
	initAPI();
	return (dispatch) => {
		dispatch({
			type: ActionTypes.DATA_REMOVE_QUESTION,
			dataRemoveQuestion: data
		})
	}
}


// export function onChangExamQuestions(data) {
// 	initAPI();
// 	return async (dispatch) => {
// 		dispatch({
// 			type: 'CHANGE_EXAM_QUESTIONS',
// 			data
// 		})
// 	}
// }