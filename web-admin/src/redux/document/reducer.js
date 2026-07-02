import * as ActionTypes from './type';

const initState = {
    documents: [],
    document: null,
    total: 0,
    page: 1,
    limit: 20,
    ids: [],
    checkAll: false,
    redirect: false,
    main_categories: [],
    main_category: null,
    main_categories_total: 0,
    main_categories_limit: 20,
    main_categories_ids: [],
    main_categories_checkAll: false,
    main_categories_redirect: false
}
const reducer = (state = initState, action) => {
    switch (action.type) {
        case ActionTypes.LIST_DOCUMENT:
            return {
                ...state,
                documents: action.documents,
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
        case ActionTypes.CREATE_DOCUMENT:
            return {
                ...state,
                redirect: action.redirect
            }
        case ActionTypes.SHOW_DOCUMENT:
            return {
                ...state,
                document: action.document
            }
        case ActionTypes.UPDATE_DOCUMENT:
            const arr = state.documents;
            const newArr = arr.filter((ele) => ele._id !== action.document._id);
            newArr.unshift(action.document);
            return {
                ...state,
                documents: newArr,
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
        case ActionTypes.DELETE_DOCUMENT:
            return {
                ...state,

                ids: [],
                checkAll: false
            }
        case ActionTypes.CHECK_ALL:
            const documents = state.documents;
            var deletesAll = [];
            if (action.status) {
                deletesAll = Object.assign([], Array.from(documents, ele => ele._id));
            } else {
                deletesAll = [];
            }
            return {
                ...state,
                checkAll: action.status,
                ids: deletesAll
            }
        case ActionTypes.ADD_DATA_REMOVE_DOCUMENT: 
            return {
                ...state,
                dataRemoveDocument: action.dataRemoveDocument
            }
        case ActionTypes.LIST_DOCUMENT_CATEGORY:
            return {
                ...state,
                main_categories: action.main_categories,
                main_categories_total: action.total,
                main_categories_limit: action.limit,
                main_categories_ids: [],
                main_categories_checkAll: false,
                main_categories_redirect: false,
            }
        case ActionTypes.CREATE_DOCUMENT_CATEGORY:
            return {
                ...state,
                main_categories_redirect: action.redirect
            }
        case ActionTypes.SHOW_DOCUMENT_CATEGORY:
            return {
                ...state,
                main_category: action.document
            }
        case ActionTypes.UPDATE_DOCUMENT_CATEGORY:
            const categoryArr = state.main_categories;
            const newCategoryArr = categoryArr.filter((ele) => ele._id !== action.document._id);
            newCategoryArr.unshift(action.document);
            return {
                ...state,
                main_categories: newCategoryArr,
            }
        case ActionTypes.DELETE_DOCUMENT_CATEGORY:
            return {
                ...state,
                main_categories_ids: [],
                main_categories_checkAll: false
            }
        default:
            return state;
    }
}

export default reducer;