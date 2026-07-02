import * as ActionTypes from './type';

const initState = {
    orders: [],
    total: 0,
    page: 1,
    limit: 20,
    ids: [],
    checkAll: false,
    redirect: false
}
const reducer = (state = initState, action) => {
    switch (action.type) {
        case ActionTypes.LIST_ORDER:
            return {
                ...state,
                orders: action.orders,
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
        case ActionTypes.SHOW_ORDER_DETAIL:
            return {
                ...state,
                order: action.order
            }

        case ActionTypes.UPDATE_ORDER_STATUS:
            return {
                ...state
            };

        default:
            return state;
    }
}

export default reducer;
