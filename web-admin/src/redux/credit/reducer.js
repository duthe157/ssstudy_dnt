import * as ActionTypes from './type';

const initState = {
    credits: [],
    total: 0,
    page: 1,
    limit: 20,
    ids: [],
    checkAll: false,
    redirect: false
}
const reducer = (state = initState, action) => {
    switch (action.type) {
        case ActionTypes.LIST_CREDIT:
            return {
                ...state,
                credits: action.credits,
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

        default:
            return state;
    }
}

export default reducer;
