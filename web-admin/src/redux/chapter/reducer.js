import * as ActionTypes from './type';

const initState = {
    chapters: [],
    chapter: null,
    total: 0,
    page: 1,
    limit: 20,
    ids: [],
    checkAll: false,
    redirect: false
}
const reducer = (state = initState, action) => {
    switch (action.type) {
        case ActionTypes.LIST_CHAPTER:
            return {
                ...state,
                chapters: action.chapters,
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
        case ActionTypes.CREATE_CHAPTER:
            return {
                ...state,
                redirect: action.redirect
            }
        case ActionTypes.SHOW_CHAPTER:
            return {
                ...state,
                chapter: action.chapter
            }
        case ActionTypes.UPDATE_CHAPTER:
            const arr = state.chapters;
            const newArr = arr.filter((ele) => ele._id !== action.chapter._id);
            newArr.unshift(action.chapter);
            return {
                ...state,
                chapters: newArr,
            }
        case ActionTypes.UPDATE_META_DATA:
            return {
                ...state,
                chapters: action.chapter,
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
        case ActionTypes.DELETE_CHAPTER:
            return {
                ...state,
                ids: [],
                checkAll: false
            }
        case ActionTypes.COPY_CHAPTER:
            return {
                ...state,
                checkAll: false,
                isCopyChapter: action.isCopyChapter || false
            }
        case ActionTypes.LIST_CHAPTER_BY_CLASSROOM:
            return {
                ...state,
                listSelectedchapters: action.listSelectedchapters,
                checkAll: false,
                redirect: false,
            }
        case ActionTypes.CHECK_ALL:
            const chapters = state.chapters;
            var deletesAll = [];
            if (action.status) {
                deletesAll = Object.assign([], Array.from(chapters, ele => ele._id));
            } else {
                deletesAll = [];
            }
            return {
                ...state,
                checkAll: action.status,
                ids: deletesAll
            }
        default:
            return state;
    }
}

export default reducer;