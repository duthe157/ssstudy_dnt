import * as ActionTypes from './type';

const initState = {
    paymentLinks: [],
    statistics: {},
    total: 0,
    page: 1,
    limit: 10,
    creators: []
}
const reducer = (state = initState, action) => {
    switch (action.type) {
        case ActionTypes.LIST_PAYMENT_LINKS:
            return {
                ...state,
                paymentLinks: action.paymentLinks,
                total: action.total,
                limit: action.limit,
            }
        case ActionTypes.LIST_PAYMENT_STATISTIC:
          return {
            ...state,
            statistics: action.statistics
          }
        case 'PAGING':
            return {
                ...state,
                total: action.total,
                limit: action.limit,
                page: action.page
            }
        case ActionTypes.LIST_CREATOR: 
            return {
                ...state,
                creators: action.creators
            }
        default:
            return state;
    }
}

export default reducer;
