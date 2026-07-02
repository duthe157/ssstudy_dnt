import * as ActionTypes from './type';

const initState = {
    books: [],
    bookCategories: [],
    bookIdCourse: null,
    bookIdCourses: [],
    isBought: false,
    classroomAttached: null,
    bookRelates: [],
    classroomRelates: [],
    dataRemoveBook: null,
    total: 0,
    page: 1,
    limit: 20,
    ids: [],
    checkAll: false,
    redirect: false
}

const reducer = (state = initState, action) => {
    switch (action.type) {
        case ActionTypes.LIST_BOOKID_COURSE:
            return {
                ...state,
                bookIdCourses: action.books,
                total: action.total || state.total,
                limit: action.limit || state.limit,
                ids: [],
                checkAll: false,
                redirect: false,
            }

        case ActionTypes.LIST_BOOKID_COURSE_CATEGORY:
            return {
                ...state,
                bookCategories: action.bookCategories,
                total: action.total,
                limit: action.limit,
                ids: [],
                checkAll: false,
                redirect: false,
            }

        case ActionTypes.PAGING_BOOKID_COURSE:
            return {
                ...state,
                page: action.page
            }

        case ActionTypes.CREATE_BOOKID_COURSE:
            return {
                ...state,
                bookIdCourse: action.bookIdCourse,
                redirect: true
            }

        case ActionTypes.SHOW_BOOKID_COURSE: {
            const data = action.bookIdCourse;
            return {
                ...state,
                bookIdCourse: data && data.course ? data.course : data,
                isBought: data && data.is_bought ? data.is_bought : false,
                classroomAttached: data && data.classroomAttached ? data.classroomAttached : null,
                bookRelates: data && data.bookRelates ? data.bookRelates : [],
                classroomRelates: data && data.classroomRelates ? data.classroomRelates : []
            }
        }

        case ActionTypes.UPDATE_BOOKID_COURSE: {
            const updatedBook = action.bookIdCourse;
            return {
                ...state,
                books: state.books.map(book => book._id === updatedBook._id ? updatedBook : book),
                bookIdCourse: updatedBook,
                redirect: true
            }
        }

        case ActionTypes.DELETE_BOOKID_COURSE:
            return {
                ...state,
                ids: [],
                checkAll: false
            }

        case ActionTypes.CHECK_ALL:
            return {
                ...state,
                checkAll: action.status,
                ids: action.status ? state.books.map(ele => ele._id) : []
            }

        case ActionTypes.DATA_REMOVE_BOOKID_COURSE:
            return {
                ...state,
                dataRemoveBook: action.dataRemoveBook
            }

        case ActionTypes.ADD_CHAPTER:
        case ActionTypes.UPDATE_GROUP_CHAPTER:
        case ActionTypes.REMOVE_CHAPTER:
        case ActionTypes.UPDATE_META_DATA_BOOKID_COURSE:
        case ActionTypes.BOOKID_COURSE_UPDATE_RELATE:
            return {
                ...state,
                bookIdCourse: action.bookIdCourse
            }

        case ActionTypes.CHECK_INPUT_ITEM: {
            let newIds = [...state.ids];
            if (action.mode === 'add') {
                if (!newIds.includes(action.id)) {
                    newIds.push(action.id);
                }
            } else if (action.mode === 'remove') {
                newIds = newIds.filter(item => item !== action.id);
            }
            return {
                ...state,
                ids: newIds
            }
        }

        default:
            return state;
    }
}

export default reducer;

                                