import * as ActionTypes from './type';

const initState = {
    adultEvals: [],
    review: null,
    total: 0,
    page: 1,
    limit: 20,
    ids: [],
    checkAll: false,
    redirect: false
}

const reducer = (state = initState, action) => {
    switch(action.type) {

        case ActionTypes.LIST_POST:
            return {
                ...state,
                posts: action.posts,
                total: action.total,
                limit: action.limit

            }
        case 'PAGING':
            return {
                ...state,
                page: action.page
            }
        case ActionTypes.SHOW_POST:
            return {
                ...state,
                post: action.post
            }
        case ActionTypes.CREATE_POST:
            var { post, redirect } = action;
            return {
                ...state,
                post,
                redirect,
            }
        case ActionTypes.UPDATE_POST:
            return {
                ...state,
                redirect: action.redirect
            }
        case ActionTypes.DATA_REMOVE_POST:
            return {
                ...state,
                dataRemovePost: action.dataRemovePost
            }
        case ActionTypes.DELETE_POST:
            return {
                ...state
            }

        default:
            return {
                ...state
            }
    }
}

export default reducer;