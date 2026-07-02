import * as ActionTypes from './type';

const initState = {
    reviews: [],
    review: null,
    total: 0,
    page: 1,
    limit: 20,
    ids: [],
    checkAll: false,
    redirect: false
}
const reducer = (state = initState, action) => {
    switch (action.type) {
        case ActionTypes.LIST_REVIEW:
            return {
                ...state,
                reviews: action.reviews,
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
        case ActionTypes.CREATE_REVIEW:
            return {
                ...state
            }
        case ActionTypes.SHOW_REVIEW:
            return {
                ...state,
                review: action.review
            }
        case ActionTypes.UPDATE_REVIEW:
            const arr = state.reviews;
            const newArr = arr.filter((ele) => ele._id !== action.review._id);
            newArr.unshift(action.review);
            return {
                ...state,
                reviews: newArr,
                redirect: action.redirect
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
        case ActionTypes.DELETE_REVIEW:
            return {
                ...state,
                ids: [],
                checkAll: false
            }
        case ActionTypes.CHECK_ALL:
            const reviews = state.reviews;
            var deletesAll = [];
            if (action.status) {
                deletesAll = Object.assign([], Array.from(reviews, ele => ele._id));
            } else {
                deletesAll = [];
            }
            return {
                ...state,
                checkAll: action.status,
                ids: deletesAll
            }
        case ActionTypes.DATA_REMOVE_CLASSROOM_REVIEW:
            return {
                ...state,
                dataRemoveClassroomReview: action.dataRemoveClassroomReview
            }
        default:
            return state;
    }
}

export default reducer;