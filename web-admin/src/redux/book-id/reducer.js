import * as ActionTypes from './type';

const initState = {
    bookIds: [],
    bookCategories: [],
    codes: [],
    bookId: null,
    members: [],
    total: 0,
    page: 1,
    limit: 20,
    ids: [],
    infoExport: null,
    checkAll: false,
    redirect: false
}
const reducer = (state = initState, action) => {
    switch (action.type) {
        case ActionTypes.LIST_BOOKID_CATEGORY:
            return {
                ...state,
                bookCategories: action.bookCategories,
                total: action.total,
                limit: action.limit,
                ids: [],
                checkAll: false,
                redirect: false,
            }
        case ActionTypes.LIST_BOOKID:
            return {
                ...state,
                bookIds: action.books,
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
        case ActionTypes.CREATE_BOOKID:
            return {
                ...state,
                redirect: action.redirect,
                bookId: action.bookId
            }
        case ActionTypes.SHOW_BOOKID:
            return {
                ...state,
                bookId: action.bookId.book,
                classroomAttached: action.bookId.classroomAttached,
                bookRelates: action.bookId.bookRelates,
                classroomRelates: action.bookId.classroomRelates
            }
        case ActionTypes.UPDATE_BOOKID:
            const arr = state.bookIds;
            const newArr = arr.filter((ele) => ele._id !== action.bookId._id);
            newArr.unshift(action.bookId);
            return {
                ...state,
                redirect: action.redirect,
                bookIds: newArr,
            }
        case ActionTypes.DELETE_BOOKID:
            return {
                ...state,
                ids: [],
                checkAll: false
            }
        case ActionTypes.CHECK_ALL:
            const bookIds = state.bookIds;
            var deletesAll = [];
            if (action.status) {
                deletesAll = Object.assign([], Array.from(bookIds, ele => ele._id));
            } else {
                deletesAll = [];
            }
            return {
                ...state,
                checkAll: action.status,
                ids: deletesAll
            }
        case ActionTypes.CHECK_INPUT_ITEM:
            let newIds = state.ids;
            if (action.mode === 'add') {
                newIds = [...state.ids, action.id];
            } else if (action.mode === 'remove') {
                newIds = state.ids.filter(item => item !== action.id);
            }
            return {
                ...state,
                ids: newIds
            }
        case ActionTypes.DATA_REMOVE_BOOKID:
            return {
                ...state,
                dataRemoveBook: action.dataRemoveBook
            }
        case ActionTypes.BOOKID_UPDATE_RELATE: {
            return {
                ...state,
            }
        }
        case "LIST_CODE":
            return {
                ...state,
                codes: action.codes,
                total: action.total,
                limit: action.limit,
            }
        case "DELETE_CODE":
            return {
                ...state,
                ids: [],
                checkAll: false
            }
        case "CREATE_CODE":
            return {
                ...state,
            }
        case ActionTypes.UPDATE_META_DATA: {
            return {
                ...state,
                bookId: action.bookId
            }
        }
        case "BOOK_ID_MEMBER": {
            return {
                ...state,
                members: action.members,
                total: action.total,
                limit:action. limit
            }
        }
        case "REMOVE_MEMBER": {
            return {
                ...state,
            }
        }
        case "GET_INFO_EXPORT": {
            return {
                ...state,
                infoExport: action.infoExport
            }
        }
        default:
            return state;
    }
}

export default reducer;