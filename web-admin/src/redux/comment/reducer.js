import * as ActionTypes from './type';

const initState = {
    dataReviews: [],
    dataReview: null,
    total: 0,
    page: 1,
    limit: 20,
    ids: [],
    checkAll: false,
    redirect: false,
};
const reducer = (state = initState, action) => {
    switch (action.type) {
        case ActionTypes.LIST_REVIEW:
            return {
                ...state,
                dataReviews: action.dataReviews,
                total: action.total,
                limit: action.limit,
                ids: [],
                redirect: false,
                checkAll: false,
            };

        case 'PAGING':
            return {
                ...state,
                page: action.page,
            };
        case ActionTypes.CREATE_REVIEW:
            return {
                ...state,
                redirect: action.redirect,
            };
        case ActionTypes.DETAIL_REVIEW:
            return {
                ...state,
                dataReview: action.dataReview,
            };
        case ActionTypes.UPDATE_REVIEW:
            return {
                ...state,
                review: action.review,
                redirect: action.redirect,
            };

        case ActionTypes.ADD_DELETE:
            var arrDelete = [];
            var deletes = [];
            arrDelete.push(action.id);
            if (action.mode === 'add') {
                deletes = state.ids.concat(arrDelete);
            } else if (action.mode === 'remove') {
                deletes = state.ids.filter((ele) => ele !== action.id);
            } else {
                deletes = arrDelete;
            }
            return {
                ...state,
                ids: deletes,
            };
        case ActionTypes.DETAIL_REVIEW:
            return {
                ...state,
                ids: [],
                checkAll: false,
            };
        case ActionTypes.CHECK_ALL:
            const dataReviews = state.dataReviews;
            var deletesAll = [];
            if (action.status) {
                deletesAll = Object.assign(
                    [],
                    Array.from(dataReviews, (ele) => ele._id)
                );
            } else {
                deletesAll = [];
            }
            return {
                ...state,
                checkAll: action.status,
                ids: deletesAll,
            };

        default:
            return state;
    }
};

export default reducer;
