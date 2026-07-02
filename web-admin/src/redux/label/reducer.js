import * as ActionTypes from './type';

const initialState = {
    labels: [],
    label: null,
    total: 0,
    page: 1,
    limit: 20,
    ids: [],
    checkAll: false,
    loading: false,
    countAll: 0,
    countHidden: 0,
    countDeleted: 0,
    labelsByItem: [],
    assignItems: [],
    assignTotal: 0,
    assignPage: 1,
    assignLimit: 20,
    assignLoading: false,
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.LABEL_LOADING:
            return { ...state, loading: true };

        case ActionTypes.LIST_LABEL:
            return {
                ...state,
                loading: false,
                labels: action.labels,
                total: action.total,
                page: action.page,
                limit: action.limit,
            };

        case ActionTypes.COUNT_LABEL_BY_STATUS:
            return {
                ...state,
                countAll: action.counts?.active || 0,
                countHidden: action.counts?.hidden || 0,
                countDeleted: action.counts?.deleted || 0,
            };

        case ActionTypes.LIST_LABEL_ASSIGN:
            return {
                ...state,
                assignLoading: false,
                assignItems: action.items,
                assignTotal: action.total,
                assignPage: action.page,
                assignLimit: action.limit,
            };

        case ActionTypes.LIST_LABELS_BY_ITEM:
            return {
                ...state,
                labelsByItem: action.labels,
            };

        case ActionTypes.LABEL_ASSIGN_LOADING:
            return {
                ...state,
                assignLoading: true,
            };

        case ActionTypes.BULK_UPDATE_LABEL_ITEMS:
            return state;
        
        case ActionTypes.CREATE_LABEL:
            return {
                ...state,
                label: action.label,
            };

        default:
            return state;
    }
};

export default reducer;