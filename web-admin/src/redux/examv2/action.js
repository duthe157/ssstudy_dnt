import axios from "axios";
import { initAPI, notify, responseError } from "../../config/api";
import * as ActionTypes from "./type";
import { CREATE_EXAM, CREATE_QUESTION, CREATE_SECTION, UPDATE_EXAM, UPDATE_QUESTION } from "./type";

export function createExam(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`exam/v2/create`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let exam = res.data.data;
					dispatch({
						type: ActionTypes.CREATE_EXAM,
						exam
					});
				}
			})
			.catch(err => {
				responseError(err);
			});
	};
}

export function updateExam(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`exam/v2/update`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let exam = res.data.data;
					dispatch({
						type: ActionTypes.UPDATE_EXAM,
						exam
					});
				}
			})
			.catch(err => {
				responseError(err);
			});
	};
}

export function createSection(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`/exam/section/create`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let section = res.data.data;
					dispatch({
						type: ActionTypes.CREATE_SECTION,
						section
					});
				}
			})
			.catch(err => {
				responseError(err);
			});
	};
}

export function updateSection(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`/exam/section/update`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let section = res.data.data;
					dispatch({
						type: ActionTypes.UPDATE_SECTION,
						section
					});
				}
			})
			.catch(err => {
				responseError(err);
			});
	};
}

export function updateGroupQuestionf(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`/exam/group/update`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({
						type: ActionTypes.UPDATE_GROUP,
					});
				}
			})
			.catch(err => {
				responseError(err);
			});
	};
}

export function createQuestion(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`/question/v2/create`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let question = res.data.data;
					dispatch({
						type: ActionTypes.CREATE_QUESTION,
						question
					});
				}
			})
			.catch(err => {
				responseError(err);
			});
	};
}

export function updateQuestion(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`/question/v2/update`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let question = res.data.data;
					dispatch({
						type: ActionTypes.UPDATE_QUESTION,
						question
					});
				}
			})
			.catch(err => {
				responseError(err);
			});
	};
}

export function detailExam(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`/exam/v2/detail`, data)
			.then(res => {
				if (res.data.code === 200) {
					let detail = res.data.data;
					dispatch({
						type: ActionTypes.DETAIL_EXAM,
						detail
					});
				}
			})
			.catch(err => {
				responseError(err);
			});
	};
}


export function deleteQuestion(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`question/v2/delete`, params)
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

export function deleteGroup(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`exam/group/delete`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({ type: ActionTypes.DELETE_GROUP });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function deleteSection(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`/exam/section/delete`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({ type: ActionTypes.DELETE_SECTION });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}