import * as ActionTypes from './type';

const initState = {
    bookCategories: [],
    bookCategory: null,
    total: 0,
    page: 1,
    limit: 20,
    ids: [],
    checkAll: false,
    redirect: false
}
const reducer = (state = initState, action) => {
    switch (action.type) {
        case ActionTypes.LIST_BOOK_CATEGORY:
            return {
                ...state,
                bookCategories: action.bookCategories,
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
        case ActionTypes.CREATE_BOOK_CATEGORY:
            return {
                ...state
            }
        case ActionTypes.SHOW_BOOK_CATEGORY:
            return {
                ...state,
                bookCategory: action.bookCategory
            }
        case ActionTypes.UPDATE_BOOK_CATEGORY:
            const arr = state.bookCategories;
            const newArr = arr.filter((ele) => ele._id !== action.bookCategory._id);
            newArr.unshift(action.bookCategory);
            return {
                ...state,
                bookCategories: newArr,
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
        case ActionTypes.DELETE_BOOK_CATEGORY:
            return {
                ...state,
                ids: [],
                checkAll: false
            }
        case ActionTypes.CHECK_ALL:
            const bookCategories = state.bookCategories;
            var deletesAll = [];
            if (action.status) {
                deletesAll = Object.assign([], Array.from(bookCategories, ele => ele._id));
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