import * as ActionTypes from './type';

const initState = {
    books: [],
    bookCategories: [],
    book: null,
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
        case ActionTypes.LIST_BOOK:
            return {
                ...state,
                books: action.books,
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
        case ActionTypes.CREATE_BOOK:
            return {
                ...state,
                redirect: action.redirect,
                book: action.book
            }
        case ActionTypes.SHOW_BOOK:
            return {
                ...state,
                book: action.book.book,
                classroomAttached: action.book.classroomAttached,
                bookRelates: action.book.bookRelates,
                classroomRelates: action.book.classroomRelates
            }
        case ActionTypes.UPDATE_BOOK:
            const arr = state.books;
            const newArr = arr.filter((ele) => ele._id !== action.book._id);
            newArr.unshift(action.book);
            return {
                ...state,
                books: newArr,
            }
        case ActionTypes.DELETE_BOOK:
            return {
                ...state,
                ids: [],
                checkAll: false
            }
        case ActionTypes.CHECK_ALL:
            const books = state.books;
            var deletesAll = [];
            if (action.status) {
                deletesAll = Object.assign([], Array.from(books, ele => ele._id));
            } else {
                deletesAll = [];
            }
            return {
                ...state,
                checkAll: action.status,
                ids: deletesAll
            }
        case ActionTypes.DATA_REMOVE_BOOK:
            return {
                ...state,
                dataRemoveBook: action.dataRemoveBook
            }
        case ActionTypes.BOOK_UPDATE_RELATE: {
            return {
                ...state,
            }
        }
        case "UPLOAD_IMAGE":
            return {
                ...state,
                image: action.data[0],
            };
        case ActionTypes.UPDATE_META_DATA: {
            return {
                ...state,
                book: action.book
            }
        }
        default:
            return state;
    }
}

export default reducer;