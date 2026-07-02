import * as ActionTypes from './type';

const initState = {
	classrooms: [],
	chapterCategories: [],
	classroomsPerUser: [],
	classroom: null,
	total: 0,
	page: 1,
	limit: 20,
	ids: [],
	checkAll: false,
	redirect: false,
	codes: [],
	members: null,
	columns: null,
	classroomMember: [],
	dataRemoveMember: {},
	cartCategories: []
};
const reducer = (state = initState, action) => {
	switch (action.type) {
		case ActionTypes.LIST_CLASSROOM:
			return {
				...state,
				classrooms: action.classrooms,
				userClassroomInfo: action.userClassroomInfo,
				total: action.total,
				limit: action.limit,
				ids: [],
				redirect: false,
				checkAll: false,
			};
		case ActionTypes.LIST_CLASSROOM_PER_USER:
			return {
				...state,
				classroomsPerUser: action.classrooms,
			};
		case ActionTypes.CHECK_DILIGENCE:
			return {
				...state,
				data: action.data,
				code: action.code,
			};
		case ActionTypes.CHECK_CLASSROOM_ATTEND:
			return {
				...state,
				code: action.code,
				dataClassroomAttends: action.dataClassroomAttend
			}
		case 'PAGING':
			return {
				...state,
				page: action.page,
			};
		case ActionTypes.CREATE_CLASSROOM:
			return {
				...state,
				redirect: action.redirect,
				classroom: action.classroom
			};
		case ActionTypes.SHOW_CLASSROOM:
			return {
				...state,
				classroom: action.classroom.classroom,
				bookAttached: action.classroom.bookAttached,
				classroomRelates: action.classroom.classroomRelates,
				classroomAttached: action.classroom.classroomAttached,
				bookRelates: action.classroom.bookRelates,
				cartCategories: action.classroom.cartCategories
			};
		case ActionTypes.GET_MULTIPLE_CLASSROOM_DETAILS:
			return {
				...state,
				classroomAttached: action.classrooms
			};
		case ActionTypes.UPDATE_CLASSROOM:
			return {
				...state,
				redirect: action.redirect,
			};
		case ActionTypes.DATA_REMOVE_CLASS:
			return {
				...state,
				dataRemoveClass: action.dataRemoveClass
			}
		case ActionTypes.UPDATE_LESSON:
			return {
				...state,
				redirect: action.redirect,
			};

		case ActionTypes.CHECK_INPUT_ITEM:
			let _ids = [];
			if (action.mode === 'add' && state.ids.indexOf(action.id) < 0) {
					state.ids.push(action.id);
					_ids = state.ids;
			}
			
			if (action.mode === 'remove') {
				if (Array.isArray(state.ids))
					_ids = state.ids.filter((ele) => ele !== action.id);
			}
			return {
				...state,
				ids: _ids,
			};

		case ActionTypes.DELETE_CLASSROOM:
			return {
				...state,
				ids: [],
				checkAll: false,
			};
		case ActionTypes.DELETE_CLASSROOM_CODE:
			return {
				...state,
				ids: [],
				checkAll: false,
			};
		case ActionTypes.CHECK_ALL:
			const _members = state.classroomMember;
			var deletesAll = [];
			if (action.status) {
				deletesAll = Object.assign(
					[],
					Array.from(_members, (ele) => ele._id)
				);
			} else {
				deletesAll = [];
			}
			return {
				...state,
				checkAll: action.status,
				ids: deletesAll,
			};
		case ActionTypes.LIST_CODE:
			return {
				...state,
				codes: action.codes,
				total: action.total,
				limit: action.limit,
			};
		case ActionTypes.EXPORT_CODE:
			return {
				...state,
			};
		case ActionTypes.CREATE_CODE:
			return {
				...state,
			};
		case ActionTypes.CLASSROOM_REPORT:
			var members = action.data.members;

			var student_testings = action.data.student_testings;

			var exams = action.data.exams;
			var totalExam = action.data.exams ? action.data.exams.length : 0;

			var columns = [
				{
					title: 'STT',
					label: 'STT',
					width: 90,
					dataIndex: 'stt',
					key: 'stt',
					fixed: 'left',
				},
				{
					title: 'Mã học sinh',
					label: 'Mã học sinh',
					width: 150,
					dataIndex: 'code',
					key: 'code',
					fixed: 'left',
				},
				{
					title: 'Tên học sinh',
					label: 'Tên học sinh',
					width: 200,
					dataIndex: 'fullname',
					key: 'name',
					fixed: 'left',
				},
			];

			const arrayExamID = [];
			exams.map((ele, i) => {
				i++;
				var colStt = {
					title: i,
					label: i,
					dataIndex: i,
					key: i,
				};
				if (i === 0) columns.push(colStt);

				var col = {
					title: ele.name,
					label: ele.name,
					dataIndex: 'exam-' + i,
					key: ele._id,
				};
				columns.push(col);
				arrayExamID.push(ele._id);
				return ele;
			});

			columns.push({
				title: 'Điểm TB',
				label: 'DiemTB',
				key: 'average',
				fixed: 'right',
				width: 100,
				dataIndex: 'average',
			});
			members.map((mem, j) => {
				j++;
				mem.testings = student_testings[mem._id];
				exams.map((e, index) => {
					var totalPoint = 0;
					student_testings[mem._id].testings.forEach((ele, i) => {
						if (ele.exam.id === e._id) {
							var key = 'exam-' + (index + 1);
							mem[key] = ele.point;
						}
						if (arrayExamID.indexOf(ele.exam.id) >= 0)
							totalPoint += ele.point;
					});
					mem.average = totalExam === 0 ? 0 : totalPoint / totalExam;
					mem.average = Math.round(mem.average * 100) / 100;
					mem['stt'] = j;
				});
				return mem;
			});
			
			return {
				...state,
				members: members,
				columns: columns,
				total_student: action.data.total_student,
				avg_point: action.data.avg_point,
				classroom: action.data.classroom,
			};

		case ActionTypes.CLASSROOM_MEMBER:
			return {
				...state,
				classroomMember: action.members,
				total: action.total,
				limit: action.limit,
			};
		case ActionTypes.ADD_MEMBER:
			return {
				...state,
			};
		case ActionTypes.REMOVE_MEMBER:
			return {
				...state,
			};
		case ActionTypes.DATA_REMOVE_MEMBER:
			return {
				...state,
				dataRemoveMember: action.dataRemoveMember,
			};
		case ActionTypes.RESET_BILL_CREATE_STATE:
			return {
				...state,
				classroomsPerUser: [],
			};

		case ActionTypes.DIFF_BUOIHOC:
			return {
				...state,
			};
		case ActionTypes.LIST_CHAPTER_CATEGORY:
			return {
				...state,
				chapterCategories: action.chapterCategories
			};

		case ActionTypes.ADD_CHAPTER:
			return {
				...state,
			};
		case ActionTypes.REMOVE_CHAPTER:

			return {
				...state,
			};

		case ActionTypes.ADD_CATEGORY:
			return {
				...state,
			};
		case ActionTypes.REMOVE_CATEGORY:
			return {
				...state,
			};
		case ActionTypes.SET_VIDEO_WATCH_TIME:
			return {
				...state
			}
		case ActionTypes.CLASSROOM_UPDATE_RELATE:
			return {
				...state
			}
		case ActionTypes.UPDATE_META_DATA:
			return {
				...state,
				classroom: action.classroom
			}
		default:
			return state;
	}
};

export default reducer;
