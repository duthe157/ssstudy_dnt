import axios from "axios";
import { initAPI, notify, responseError } from "../../config/api";
import * as ActionTypes from "./type";

export function listExam(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`/exam/list`, data)
			.then(res => {
				dispatch({ type: "PAGING", page: data.page || 1 });
				const exams = res.data.data.records;
				const total = res.data.data.totalRecord;
				const limit = res.data.data.perPage;
				dispatch({ type: ActionTypes.LIST_EXAMS, exams, total, limit });
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function createExam(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`exam/create`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let exam = res.data.data;
					dispatch({
						type: ActionTypes.CREATE_EXAMS,
						exam,
						redirect: true
					});
				}
			})
			.catch(err => {
				responseError(err);
			});
	};
}

export function ShowExam(id) {
	initAPI();
	return async dispatch => {
		const data = {
			id: id
		};
		await axios
			.post(`exam/detail`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					let exam = res.data.data;
					dispatch({ type: ActionTypes.SHOW_EXAMS, exam });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function updateExam(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`exam/update`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({
						type: ActionTypes.UPDATE_EXAMS,
						params,
						redirect: true
					});
				}
			})
			.catch(err => {
				responseError(err);
			});
	};
}

export function copyExam(examId) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`exam/copy`, {exam_id: examId})
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({
						type: ActionTypes.COPY_EXAM,
						isCopyExam: true
					});
				}
			})
			.catch(err => {
				responseError(err);
			});
	};
}

export function addDelete(id, mode = "deleteone") {
	return dispatch => {
		dispatch({ type: "ADD_DELETE", id, mode });
	};
}

export function checkAll(status) {
	return dispatch => {
		dispatch({ type: "CHECK_ALL", status: status });
	};
}

export function deleteExam(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`exam/delete`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({ type: ActionTypes.DELETE_EXAMS });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function addClass(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`exam/add-classroom`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200)
					dispatch({ type: ActionTypes.ADD_CLASSROOM });
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function sent(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`exam/send`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200) dispatch({ type: ActionTypes.SEND });
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function removeClass(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`exam/remove-classroom`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200)
					dispatch({ type: ActionTypes.REMOVE_CLASSROOM });
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function listClass(dataList) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`exam/classrooms`, dataList)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					const data = res.data.data.items;
					dispatch({
						type: ActionTypes.LIST_CLASS,
						data,
						id: dataList.exam_id
					});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function reportClass(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`exam/report`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					const data = res.data.data;
					dispatch({
						type: ActionTypes.REPORT_CLASS,
						data
					});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function reportClass2(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`exam/v2/report`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					const data = res.data.data;
					dispatch({
						type: ActionTypes.REPORT_CLASS,
						data
					});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function importPoint(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`exam/import-result`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200)
					dispatch({ type: ActionTypes.IMPORT_POINT });
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function previewListQuestion(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`exam/preview-api`, data)
			.then(res => {
				// notify(res);
				if (res.data.code === 200) {
					let dataPreviewExam = res.data.data.rs.content;
					dispatch({ 
						type: ActionTypes.PREVIEW_LIST_QUESTION ,
						dataPreviewExam
					});

				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function addDataRemoveExam(data) {
	initAPI();
	return (dispatch) => {
		dispatch({
			type: ActionTypes.DATA_REMOVE_EXAM,
			dataRemoveExam: data
		})
	}
}
