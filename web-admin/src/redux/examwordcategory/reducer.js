import * as ActionTypes from './type';

const initState = {
    examCategories: [],
    examCategory: null,
    total: 0,
    page: 1,
    limit: 20,
    ids: [],
    checkAll: false,
    redirect: false,
    dataRemoveExamCategory: null,
    partsActive: [],
    partsHidden: [],
    partsDeleted: [],
};

const reducer = (state = initState, action) => {
    switch (action.type) {
        case ActionTypes.LIST_EXAM_WORD_CATEGORY:
            return {
                ...state,
                examCategories: action.examCategories,
                total: action.total,
                limit: action.limit,
                ids: [],
                checkAll: false,
                redirect: false,
            };
        case 'EXAMWORDCATEGORY_PAGING':
            return {
                ...state,
                page: action.page,
            };
        case ActionTypes.CREATE_EXAM_WORD_CATEGORY:
            return {
                ...state,
            };
        case ActionTypes.SHOW_EXAM_WORD_CATEGORY: {
            const examCategory = action.examCategory;
            const parts = Array.isArray(examCategory && examCategory.parts) ? examCategory.parts : [];
            const partsActive = [];
            const partsHidden = [];
            const partsDeleted = [];
            parts.forEach((p, idx) => {
                const normalized = {
                    id: p.id || p._id || `part_${idx}`,
                    name: p && p.name ? p.name : '',
                    hidden: !!(p && p.hidden),
                    deleted: !!(p && p.deleted),
                    isNew: false,
                };
                if (normalized.deleted) {
                    partsDeleted.push(normalized);
                } else if (normalized.hidden) {
                    partsHidden.push(normalized);
                } else {
                    partsActive.push(normalized);
                }
            });
            return {
                ...state,
                examCategory: action.examCategory,
                partsActive,
                partsHidden,
                partsDeleted,
            };
        }
        case ActionTypes.UPDATE_EXAM_WORD_CATEGORY: {
            const newArr = state.examCategories.filter(
                category => category._id !== action.examCategory._id
            );
            newArr.unshift(action.examCategory);
            return {
                ...state,
                examCategories: newArr,
            };
        }
        case ActionTypes.EXAMWORDCATEGORY_ADD_DELETE: {
            let updatedIds = [];
            if (action.mode === 'add') {
                updatedIds = state.ids.concat([action.id]);
            } else if (action.mode === 'remove') {
                updatedIds = state.ids.filter(existingId => existingId !== action.id);
            } else {
                updatedIds = [action.id];
            }
            return {
                ...state,
                ids: updatedIds,
            };
        }
        case ActionTypes.DELETE_EXAM_WORD_CATEGORY:
            return {
                ...state,
                ids: [],
                checkAll: false,
            };
        case ActionTypes.EXAMWORDCATEGORY_CHECK_ALL: {
            const deletesAll = action.status
                ? Array.from(state.examCategories, category => category._id)
                : [];
            return {
                ...state,
                checkAll: action.status,
                ids: deletesAll,
            };
        }
        case ActionTypes.DATA_REMOVE_EXAM_WORD_CATEGORY:
            return {
                ...state,
                dataRemoveExamCategory: action.dataRemoveExamCategory,
            };

        case ActionTypes.EXAMWORDCATEGORY_SET_PART_LISTS:
            return {
                ...state,
                partsActive: action.partsActive || [],
                partsHidden: action.partsHidden || [],
                partsDeleted: action.partsDeleted || [],
            };
        case ActionTypes.EXAMWORDCATEGORY_PART_ADD:
            return {
                ...state,
                partsActive: [...state.partsActive, { ...action.part, hidden: false, deleted: false, isNew: true }],
            };
        case ActionTypes.EXAMWORDCATEGORY_PART_HIDE: {
            const found = state.partsActive.find(p => p.id === action.id);
            if (!found) return state;
            const moved = { ...found, hidden: true };
            return {
                ...state,
                partsActive: state.partsActive.filter(p => p.id !== action.id),
                partsHidden: [...state.partsHidden, moved],
            };
        }
        case ActionTypes.EXAMWORDCATEGORY_PART_UNHIDE: {
            const found = state.partsHidden.find(p => p.id === action.id);
            if (!found) return state;
            const moved = { ...found, hidden: false };
            return {
                ...state,
                partsHidden: state.partsHidden.filter(p => p.id !== action.id),
                partsActive: [...state.partsActive, moved],
            };
        }
        case ActionTypes.EXAMWORDCATEGORY_PART_DELETE: {
            const inActive = state.partsActive.find(p => p.id === action.id);
            const inHidden = state.partsHidden.find(p => p.id === action.id);
            const found = inActive || inHidden;
            if (!found) return state;
            const moved = { ...found, deleted: true };
            return {
                ...state,
                partsActive: state.partsActive.filter(p => p.id !== action.id),
                partsHidden: state.partsHidden.filter(p => p.id !== action.id),
                partsDeleted: [...state.partsDeleted, moved],
            };
        }
        case ActionTypes.EXAMWORDCATEGORY_PART_RESTORE: {
            const found = state.partsDeleted.find(p => p.id === action.id);
            if (!found) return state;
            const moved = { ...found, deleted: false, hidden: false };
            return {
                ...state,
                partsDeleted: state.partsDeleted.filter(p => p.id !== action.id),
                partsActive: [...state.partsActive, moved],
            };
        }
        case ActionTypes.EXAMWORDCATEGORY_PART_RENAME: {
            const { id, name } = action;
            const rename = (arr) => arr.map(p => p.id === id ? { ...p, name } : p);
            return {
                ...state,
                partsActive: rename(state.partsActive),
                partsHidden: rename(state.partsHidden),
                partsDeleted: rename(state.partsDeleted),
            };
        }
        case ActionTypes.EXAMWORDCATEGORY_PART_PURGE: {
            return {
                ...state,
                partsDeleted: state.partsDeleted.filter(p => p.id !== action.id),
            };
        }
        default:
            return state;
    }
};

export default reducer;
