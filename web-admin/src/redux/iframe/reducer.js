import * as ActionTypes from './type';

const initState = {
    iframes: [],
    total: 0,
    page: 1,
    limit: 20,
    ids: [],
    checkAll: false,
    redirect: false
}
const reducer = (state = initState, action) => {
    switch (action.type) {
        case ActionTypes.LIST_IFRAME:
            return {
                ...state,
                iframes: action.iframes,
                total: action.total,
                limit: action.limit,
                ids: [],
                checkAll: false,
                redirect: false,
            }
        case ActionTypes.LOGIN_IFRAME:
            let auth = {
                isAuthenticated: true,
                token: action.token,
                user: action.user,
            }
            return {
                ...state,
                auth,
            };
        case ActionTypes.SIGN_UP_IFRAME:
            let authSignUp = {
                isAuthenticated: true,
                token: action.token,
                user: action.user,
            }
            return {
                ...state,
                auth: authSignUp,
            };
        case ActionTypes.SIGN_UP_IFRAME_EMAIL:
            let authSignUpEmail = {
                code: action.code,
                message: action.message
            }
            return {
                ...state,
                authSignUpEmail: authSignUpEmail
            };
        case ActionTypes.DETAIL_IFRAME:
            return {
                ...state,
                iframeItem: action.iframeItem.iframe
            }
        case ActionTypes.DELETE_IFRAME:
            return {
                ...state,
                ids: [],
                checkAll: false
            }
        default:
            return state;
    }
}

export default reducer;