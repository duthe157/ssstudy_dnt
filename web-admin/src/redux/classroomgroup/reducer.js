import * as ActionTypes from './type';

const initState = {
    classroomGroups: [],
    classroomGroup: null,
    total: 0,
    page: 1,
    limit: 20,
    ids: [],
    checkAll: false,
    redirect: false
}
const reducer = (state = initState, action) => {
    switch (action.type) {
        case ActionTypes.LIST_CLASSROOMGROUP:
            return {
                ...state,
                classroomGroups: action.classroomGroups,
                total: action.total,
                limit: action.limit,
                ids: [],
                checkAll: false,
                redirect: false,
            }
        case 'PAGING':
            return {
                ...state,
                page: action.page
            }
        case ActionTypes.CREATE_CLASSROOMGROUP:
            return {
                ...state
            }
        case ActionTypes.SHOW_CLASSROOMGROUP:
            return {
                ...state,
                classroomGroup: action.classroomGroup
            }
        case ActionTypes.UPDATE_CLASSROOMGROUP:
            const arr = state.classroomGroups;
            const newArr = arr.filter((ele) => ele._id !== action.classroomGroup._id);
            newArr.unshift(action.classroomGroup);
            return {
                ...state,
                classroomGroups: newArr,
            }
        case ActionTypes.ADD_DELETE:
            var arrDelete = [];
            var deletes = [];
            arrDelete.push(action.id);
            if (action.mode === 'add') {
                deletes = state.ids.concat(arrDelete);
            } else if (action.mode === 'remove') {
                deletes = state.ids.filter(ele => ele !== action.id);
            } else {
                deletes = arrDelete;
            }
            return {
                ...state,
                ids: deletes
            }
        case ActionTypes.DELETE_CLASSROOMGROUP:
            return {
                ...state,
                ids: [],
                checkAll: false
            }
        case ActionTypes.CHECK_ALL:
            const classroomGroups = state.classroomGroups;
            var deletesAll = [];
            if (action.status) {
                deletesAll = Object.assign([], Array.from(classroomGroups, ele => ele._id));
            } else {
                deletesAll = [];
            }
            return {
                ...state,
                checkAll: action.status,
                ids: deletesAll
            }
        case ActionTypes.DATA_REMOVE_CLASSROOM_GROUP:
            return {
                ...state,
                dataRemoveClassroomGroup: action.dataRemoveClassroomGroup
            }
        case ActionTypes.LIST_CLASSROOMG_CATEGORY:
            return {
                ...state,
                listClassromCategory: action.classroomCategory
            }
        default:
            return state;
    }
}

export default reducer;