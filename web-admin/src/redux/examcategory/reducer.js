import * as ActionTypes from './type';

const initState = {
    examCategories: [],
    examCategory: null,
    total: 0,
    page: 1,
    limit: 20,
    ids: [],
    checkAll: false,
    redirect: false
}
const reducer = (state = initState, action) => {
    switch (action.type) {
        case ActionTypes.LIST_EXAM_CATEGORY:
            return {
                ...state,
                examCategories: action.examCategories,
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
        case ActionTypes.CREATE_EXAM_CATEGORY:
            return {
                ...state
            }
        case ActionTypes.SHOW_EXAM_CATEGORY:
            return {
                ...state,
                examCategory: action.examCategory
            }
        case ActionTypes.UPDATE_EXAM_CATEGORY:
            const arr = state.examCategories;
            const newArr = arr.filter((ele) => ele._id !== action.examCategory._id);
            newArr.unshift(action.examCategory);
            return {
                ...state,
                examCategories: newArr,
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
        case ActionTypes.DELETE_EXAM_CATEGORY:
            return {
                ...state,
                ids: [],
                checkAll: false
            }
        case ActionTypes.CHECK_ALL:
            const examCategories = state.examCategories;
            var deletesAll = [];
            if (action.status) {
                deletesAll = Object.assign([], Array.from(examCategories, ele => ele._id));
            } else {
                deletesAll = [];
            }
            return {
                ...state,
                checkAll: action.status,
                ids: deletesAll
            }
        case ActionTypes.DATA_REMOVE_EXAM_CATEGORY:
            return {
                ...state,
                dataRemoveExamCategory: action.dataRemoveExamCategory
            }
        default:
            return state;
    }
}

export default reducer;