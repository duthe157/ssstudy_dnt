import axios from 'axios';
import * as ActionTypes from './type';
import { initAPI, notify, responseError } from '../../config/api';

export function updateCategory(data) {
	return async (dispatch) => {
		await initAPI();
		await axios
			.post(`classroom/update-category`, data)
			.then((res) => {
				if (res.data.code === 200) {
					notify(res);
					dispatch({
						type: ActionTypes.UPDATE_POSITION,
					});
				}
				notify(res, false);
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function updatePosition(data) {
	return async (dispatch) => {
		await initAPI();
		await axios
			.post(`classroom/update-position`, data)
			.then((res) => {
				if (res.data.code === 200) {
					notify(res);
					dispatch({
						type: ActionTypes.UPDATE_POSITION,
					});
				}
				notify(res, false);
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}
export function updateGroupChapter(data) {
	return async (dispatch) => {
		await initAPI();
		await axios
			.post(`classroom/update-group-chapter`, data)
			.then((res) => {
				if (res.data.code === 200) {
					notify(res);
					dispatch({
						type: ActionTypes.UPDATE_GROUP_CHAPTER,
					});
				}
				notify(res, false);
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}
export function updateChapter(data) {
	return async (dispatch) => {
		await initAPI();
		await axios
			.post(`classroom/update-chapter`, data)
			.then((res) => {
				if (res.data.code === 200) {
					notify(res);
					dispatch({
						type: ActionTypes.UPDATE_CHAPTER,
					});
				}
				notify(res, false);
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function addChapter(data) {
	return async (dispatch) => {
		await initAPI();
		await axios
			.post(`classroom/add-chapter`, data)
			.then((res) => {
				if (res.data.code === 200) {
					notify(res);
					dispatch({
						type: ActionTypes.ADD_CHAPTER,
					});
				}
				notify(res, false);
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}


export function removeChapter(data) {
	return async (dispatch) => {
		await initAPI();
		await axios
			.post(`classroom/remove-chapter`, data)
			.then((res) => {
				if (res.data.code === 200) {
					notify(res);
					dispatch({
						type: ActionTypes.REMOVE_CHAPTER,
					});
				}
				notify(res, false);
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}


export function addCategory(data) {
	return async (dispatch) => {
		await initAPI();
		await axios
			.post(`classroom/add-category`, data)
			.then((res) => {
				if (res.data.code === 200) {
					notify(res);
					dispatch({
						type: ActionTypes.ADD_CATEGORY,
					});
				}
				notify(res, false);
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}


export function removeCategory(data) {
	return async (dispatch) => {
		await initAPI();
		await axios
			.post(`classroom/remove-category`, data)
			.then((res) => {
				if (res.data.code === 200) {
					notify(res);
					dispatch({
						type: ActionTypes.REMOVE_CATEGORY,
					});
				}
				notify(res, false);
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}


export function listChapterCategory(data) {
	initAPI();
	return async (dispatch) => {
		await axios
			.post(`classroom/list-chapter-category`, data)
			.then((res) => {
				notify(res, false);
				if (res.data.code === 200) {
					const chapterCategories = res.data.data;
					dispatch({
						type: ActionTypes.LIST_CHAPTER_CATEGORY,
						chapterCategories
					});
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function listClassroom(data) {
	initAPI();
	return async (dispatch) => {
		await axios
			.post(`classroom/list`, data)
			.then((res) => {
				notify(res, false);
				if (res.data.code === 200) {
					dispatch({ type: 'PAGING', page: data.page });
					const classrooms = res.data.data.records;
					const userClassroomInfo = res.data.data.userClassroomInfo;
					const total = res.data.data.totalRecord;
					const limit = res.data.data.perPage;
					dispatch({
						type: ActionTypes.LIST_CLASSROOM,
						userClassroomInfo,
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

export function createStudent(data) {
	initAPI();
	return async (dispatch) => {
		await axios
			.post(`auth/signin`, data)
			.then((res) => {
				notify(res);
				if (res.data.code === 200) {
					let student = res.data.data;
					dispatch({ type: ActionTypes.CREATE_CLASSROOM, student });
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function showClassroom(id) {
	initAPI();
	return async (dispatch) => {
		const data = {
			id: id,
		};
		await axios
			.post(`classroom/detail`, data)
			.then((res) => {
				notify(res, false);
				if (res.data.code === 200) {
					let classroom = res.data.data;
					dispatch({ type: ActionTypes.SHOW_CLASSROOM, classroom });
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function getMultipleClassroomDetails(ids) {
	initAPI();
	return async (dispatch) => {
		try {
			const promises = ids.map(id =>
				axios.post(`classroom/detail`, { id: id })
			);

			const responses = await Promise.all(promises);
			const classrooms = responses
				.filter(res => res.data.code === 200)
				.map(res => res.data.data.classroom);

			dispatch({
				type: ActionTypes.GET_MULTIPLE_CLASSROOM_DETAILS,
				classrooms
			});

			return classrooms;
		} catch (err) {
			responseError(err);
			return [];
		}
	};
}

export function createClassroom(data) {
	initAPI();
	return async (dispatch) => {
		return await axios
			.post(`classroom/create`, data)
			.then((res) => {
				notify(res);
				if (res.data.code === 200) {
					let classroom = res.data.data;
					dispatch({
						type: ActionTypes.CREATE_CLASSROOM,
						classroom,
						redirect: true,
					});
				}
				return res;
			})
			.catch(async (err) => {
				responseError(err);
				return null;
			});
	};
}

export function updateClassroom(params) {
	initAPI();
	return async (dispatch) => {
		return await axios
			.post(`classroom/update`, params)
			.then((res) => {
				notify(res);
				if (res.data.code === 200) {
					let video = res.data.data;
					dispatch({
						type: ActionTypes.UPDATE_CLASSROOM,
						video,
						redirect: true,
					});
				}
				return res;
			})
			.catch(async (err) => {
				responseError(err);
				return null;
			});
	};
}

export function checkInputItem(id, mode = '') {
	return (dispatch) => {
		dispatch({ type: 'CHECK_INPUT_ITEM', id, mode });
	};
}

export function checkAll(status) {
	return (dispatch) => {
		dispatch({ type: 'CHECK_ALL', status: status });
	};
}

export function deleteClassroom(params) {
	initAPI();
	return async (dispatch) => {
		await axios
			.post(`classroom/delete`, params)
			.then((res) => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({ type: ActionTypes.DELETE_CLASSROOM });
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function addDataRemoveClass(data) {
	return (dispatch) => {
		dispatch({
			type: ActionTypes.DATA_REMOVE_CLASS,
			dataRemoveClass: data
		})
	}
}

export function listCode(data) {
	initAPI();
	return async (dispatch) => {
		await axios
			.post(`classroom/codes`, data)
			.then((res) => {
				notify(res, false);
				if (res.data.code === 200) {
					dispatch({ type: 'PAGING', page: data.page });
					const codes = res.data.data.items;
					const total = res.data.data.total;
					const limit = res.data.data.limit;
					dispatch({
						type: ActionTypes.LIST_CODE,
						codes,
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

export function deleteClassroomCode(params) {
	initAPI();
	return async (dispatch) => {
		await axios
			.post(`classroom/delete-code`, params)
			.then((res) => {
				notify(res);
				if (res.data.code === 200) {
					dispatch({ type: ActionTypes.DELETE_CLASSROOM_CODE });
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function downloadExcelData(data) {
	initAPI();
	const options = {};
	options.responseType = 'arraybuffer';

	return async (dispatch) => {
		await axios
			.post(`classroom/export-code`, data, options)
			.then((res) => {
				res.responseType = "arraybuffer";
				const filename = 'Ma_Truy_Cap-' + new Date().getTime() + '.xlsx';
				window.saveAs(new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename);
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function listMember(data) {
	return async (dispatch) => {
		await initAPI();
		const options = {};
		if (data.is_export)
			options.responseType = 'arraybuffer';

		await axios
			.post(`classroom/list-member`, data, options)
			.then((res) => {
				if (data.is_export) {
					res.responseType = "arraybuffer";
					const filename = 'Hs_Lop-' + new Date().getTime() + '.xlsx';
					window.saveAs(new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename);
				} else {
					notify(res, false);
					if (res.data.code === 200) {
						dispatch({ type: 'PAGING', page: data.page });
						const members = res.data.data.records;
						const total = res.data.data.totalRecord;
						const limit = res.data.data.perPage;
						dispatch({
							type: ActionTypes.CLASSROOM_MEMBER,
							members,
							total,
							limit,
						});
					}
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function createCode(data) {
	initAPI();
	return async (dispatch) => {
		await axios
			.post(`classroom/generate-access-code`, data)
			.then((res) => {
				notify(res, false);
				if (res.data.code === 200)
					dispatch({ type: ActionTypes.CREATE_CODE });
			})
			.catch((err) => {
				responseError(err);
			});
	};
}

export function classroomReport(data) {
	initAPI();
	return async (dispatch) => {
		await axios
			.post(`classroom/report`, data)
			.then((res) => {
				notify(res, false);
				if (res.data.code === 200) {
					var data = res.data.data;
					dispatch({ type: ActionTypes.CLASSROOM_REPORT, data });
				}
			})
			.catch((err) => {
				responseError(err);
			});
	};
}

export function addMember(data) {
	return async (dispatch) => {
		await initAPI();
		await axios
			.post(`classroom/add-member`, data)
			.then((res) => {
				console.log('success');
				if (res.data.code === 200) {
					notify(res);
					dispatch({
						type: ActionTypes.ADD_MEMBER,
					});
				}
				notify(res, false);
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function addDataRemoveMember(data) {
	return (dispatch) => {
		dispatch({
			type: ActionTypes.DATA_REMOVE_MEMBER,
			dataRemoveMember: data,
		});
	};
}

export function addDataAddMember(data) {
	return (dispatch) => {
		dispatch({
			type: ActionTypes.DATA_ADD_MEMBER,
			dataRemoveMember: data,
		});
	};
}

export function removeMember(data, isActionRemove = true) {
	return async (dispatch) => {
		await initAPI();
		await axios
			.post(`classroom/remove-member`, data)
			.then((res) => {
				if (res.data.code === 200 || res.data.data.code === 200) {
					notify(res);
					if (isActionRemove) {
						dispatch({
							type: ActionTypes.REMOVE_MEMBER,
						});
					}
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function listClassroomPerUser(data) {
	return async (dispatch) => {
		await initAPI();
		await axios
			.post(`classroom/list`, data)
			.then((res) => {
				notify(res, false);
				if (res.data.code === 200) {
					const classrooms = res.data.data.records;
					dispatch({
						type: ActionTypes.LIST_CLASSROOM_PER_USER,
						classrooms,
					});
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function resetBillCreateState() {
	return (dispatch) => {
		dispatch({ type: ActionTypes.RESET_BILL_CREATE_STATE });
	};
}

export function updateLesson(params) {
	initAPI();
	return async (dispatch) => {
		await axios
			.post(`classroom/update-buoihoc`, params)
			.then((res) => {
				notify(res);
				if (res.data.code === 200) {
					let dataLesson = res.data.data;
					dispatch({
						type: ActionTypes.UPDATE_LESSON,
						dataLesson,
						redirect: true,
					});
				}
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}


export function checkDiligence(data) {
	initAPI();
	const options = {};
	if (data.is_export)
		options.responseType = 'arraybuffer';
	return async dispatch => {
		await axios
			.post(`classroom/check-attend`, data, options)
			.then(res => {
				if (data.is_export) {
					res.responseType = "arraybuffer";
					const filename = 'ChuyenCanLop-' + new Date().getTime() + '.xlsx';
					window.saveAs(new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename);
				} else {
					notify(res);
					if (res.data.code === 200) {
						let code = res.data.code;
						let data = res.data.data;
						dispatch({
							type: ActionTypes.CHECK_DILIGENCE,
							code,
							data,
						});
					}
				}
			})
			.catch(err => {
				responseError(err);
			});
	};
}

export function checkClassRoomAttend(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`classroom/check-classroom-attend`, data)
			.then(res => {
				notify(res);
				if (res.data.code === 200) {
					let code = res.data.code;
					let dataClassroomAttend = res.data.data.dataClassroomAttend;
					dispatch({
						type: ActionTypes.CHECK_CLASSROOM_ATTEND,
						dataClassroomAttend,
						code,
					});
				}
			})
			.catch(err => {
				responseError(err);
			});
	};
}

export function diffBuoiHoc(data) {
	return async (dispatch) => {
		await initAPI();
		await axios
			.post(`classroom/diff-buoi-da-hoc`, data)
			.then((res) => {
				if (res.data.code === 200) {
					notify(res);
					dispatch({
						type: ActionTypes.ADD_MEMBER,
					});
				}
				notify(res, false);
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function setVideoWatchTime(data) {
	return async (dispatch) => {
		await initAPI;
		await axios.post(`classroom/update-lesson-view-month`, data)
			.then((res) => {
				if (res.data.code === 200) {
					notify(res);
					dispatch({
						type: ActionTypes.SET_VIDEO_WATCH_TIME,
					});
				}
				notify(res, false);
			})
			.catch((err) => {
				responseError(err);
			});
	}
}

//update 1906
export function classroomUpdateRelate(data) {
	return async (dispatch) => {
		await initAPI();
		await axios
			.post(`classroom/update-relate`, data)
			.then((res) => {
				if (res.data.code === 200) {
					notify(res);
					dispatch({
						type: ActionTypes.CLASSROOM_UPDATE_RELATE,
					});
				}
				notify(res, false);
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}

export function updateMetaData(data) {
	return async (dispatch) => {
		await initAPI();
		await axios
			.post(`classroom/update-meta-data`, data)
			.then((res) => {
				if (res.data.code === 200) {
					notify(res);
					let classroom = res.data.data;
					dispatch({
						type: ActionTypes.UPDATE_META_DATA,
						classroom
					});
				}
				notify(res, false);
			})
			.catch(async (err) => {
				responseError(err);
			});
	};
}
