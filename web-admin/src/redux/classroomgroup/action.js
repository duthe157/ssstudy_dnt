import axios from 'axios';
import * as ActionTypes from './type';
import { initAPI, responseError, notify } from '../../config/api';

export function listClassroomGroup(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`/classroom-group/list`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					dispatch({ type: 'PAGING', page: data.page });
					const classroomGroups = res.data.data.records;
					const total = res.data.data.total;
					const limit = 20;
					dispatch({
						type: ActionTypes.LIST_CLASSROOMGROUP,
						classroomGroups,
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

export function listClassroomCategory(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`/classroom-chapter-category`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					dispatch({ type: 'PAGING', page: data.page });
					const classroomCategory = res.data.data;
					dispatch({
						type: ActionTypes.LIST_CLASSROOMG_CATEGORY,
						classroomCategory,
					});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function createClassroomGroup(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`classroom-group/create`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let classroomGroup = res.data.data;
					dispatch({
						type: ActionTypes.CREATE_CLASSROOMGROUP,
						classroomGroup,
						redirect: true,
					});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function showClassroomGroup(id) {
	initAPI();
	return async dispatch => {
		const data = {
			id: id,
		};
		await axios
			.post(`classroom-group/detail`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					let classroomGroup = res.data.data;
					dispatch({ type: ActionTypes.SHOW_CLASSROOMGROUP, classroomGroup });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}

export function updateClassroomGroup(params) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`classroom-group/update`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let classroomGroup = res.data.data;
					dispatch({ type: ActionTypes.UPDATE_CLASSROOMGROUP, classroomGroup });
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

export function checkAll(status) {
	return dispatch => {
		dispatch({ type: 'CHECK_ALL', status: status });
	};
}

export function deleteClassroomGroup(params) {
	initAPI();

	return async dispatch => {
		await axios
			.post(`classroom-group/delete`, params)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({ type: ActionTypes.DELETE_CLASSROOMGROUP });
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}
export function addDataRemoveClassroomGroup(data) {
	initAPI();
	return (dispatch) => {
		dispatch({
			type: ActionTypes.DATA_REMOVE_CLASSROOM_GROUP,
			dataRemoveClassroomGroup: data
		})
	}
}
