import * as ActionTypes from './type';

const initState = {
    bookReviews: [],
    bookReview: null,
    total: 0,
    page: 1,
    limit: 20,
    ids: [],
    checkAll: false,
    redirect: false
}
const reducer = (state = initState, action) => {
    switch (action.type) {
        case ActionTypes.LIST_BOOK_REVIEW:
            return {
                ...state,
                bookReviews: action.bookReviews,
                total: action.total,
                limit: action.limit,
                ids: [],
                checkAll: false,
                redirect: false,
            }
        case ActionTypes.SHOW_BOOK_REVIEW:
            return {
                ...state,
                bookReview: action.bookReview
            }
        case ActionTypes.DATA_REMOVE_BOOK_REVIEW:
            return {
                ...state,
                dataRemoveBookReview: action.dataRemoveBookReview
            }
        case ActionTypes.UPDATE_BOOK_REVIEW:
            return {
                ...state,
                review: action.review
            }
        case ActionTypes.DELETE_BOOK_REVIEW: 
            return {
                ...state,
				ids: [],
				checkAll: false,
            }
        case ActionTypes.CREATE_REVIEW: {
            return {
                ...state
            }
        }
        case 'PAGING':
            return {
                ...state,
                page: action.page
            }
        default:
            return state;
    }
}

export default reducer;