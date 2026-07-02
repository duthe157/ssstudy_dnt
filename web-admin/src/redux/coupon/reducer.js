import * as ActionTypes from './type';

const initState = {
    coupons: [],
    total: 0,
    page: 1,
    limit: 20,
    ids: [],
    checkAll: false,
    redirect: false
}
const reducer = (state = initState, action) => {
    switch (action.type) {
        case ActionTypes.LIST_COUPON:
            return {
                ...state,
                coupons: action.coupons,
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
        case ActionTypes.CREATE_COUPON: 
            return {
                ...state,
                redirect: action.redirect,
                coupon: action.coupon
            }
        case ActionTypes.DETAIL_COUPON:
            return {
                ...state,
                redirect: action.redirect,
                couponDetail: action.couponDetail
            }
        case ActionTypes.UPDATE_COUPON: 
            const arr = state.coupons;
            const newArr = arr.filter((ele) => ele._id !== action.coupon._id);
            newArr.unshift(action.coupon);
            return {
                ...state,
                coupons: newArr,
            }
        case ActionTypes.DATA_REMOVE_COUPON: 
            return {
                ...state,
                dataRemoveCoupon: action.dataRemoveCoupon
            }

        default:
            return state;
    }
}

export default reducer;
