import * as ActionTypes from './type';

const initState = {
    blogCategories: [],
    blogCategory: null,
    total: 0,
    page: 1,
    limit: 20,
    ids: [],
    checkAll: false,
    redirect: false
}
const reducer = (state = initState, action) => {
    switch (action.type) {
        case ActionTypes.LIST_BLOG_CATEGORY:
            return {
                ...state,
                blogCategories: action.blogCategories || [],
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
        case ActionTypes.CREATE_BLOG_CATEGORY:
            return {
                ...state
            }
        case ActionTypes.SHOW_BLOG_CATEGORY:
            return {
                ...state,
                blogCategory: action.blogCategory || {}
            }
        case ActionTypes.UPDATE_BLOG_CATEGORY:
            const updated = action.blogCategory;
            const updatedList = (state.blogCategories || []).map((item) =>
                item && item._id === (updated && updated._id) ? { ...item, ...updated } : item
            );
            return {
                ...state,
                blogCategories: updatedList
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
        // case ActionTypes.DELETE_BOOK_CATEGORY:
        //     return {
        //         ...state,
        //         ids: [],
        //         checkAll: false
        //     }
        case ActionTypes.CHECK_ALL:
            const bookCategories = state.blogCategories;
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