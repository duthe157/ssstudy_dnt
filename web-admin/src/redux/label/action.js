import * as ActionTypes from './type';
import axios from 'axios';
import { initAPI, responseError, notify } from '../../config/api';

// ─── Action creators ──────────────────────────────────────────────────────────
export function listLabel(params) {
    initAPI();
    return async (dispatch) => {
        dispatch({ type: ActionTypes.LABEL_LOADING });
        try {
            const res = await axios.post(`/label/list`, params);
            
            if (res.data.code === 200) {
                const labels = res.data.data.records;
                const total = res.data.data.totalRecord;
                const limit = res.data.data.perPage;
                dispatch({
                    type: ActionTypes.LIST_LABEL,
                    labels, 
                    total,
                    limit,
                    page: params.page || 1,
                });
            }
        } catch (err) {
            console.error('listLabel error:', err);
        }
    };
}

export function countLabelByStatus() {
    initAPI();
    return async (dispatch) => {
        try {
            const res = await axios.post(`/label/count`);
            if (res.data.code === 200) {
                dispatch({
                    type: ActionTypes.COUNT_LABEL_BY_STATUS,
                    counts: res.data.data,
                });
            }
        } catch (err) {
            console.error('countLabelByStatus error:', err);
        }
    };
}

export function createLabel(data) {
    initAPI(); 
    return async dispatch => {
        await axios.post(`/label/create`, data)
            .then((res) => {
                notify(res); 
                if (res.data.code === 200) {
                    let label = res.data.data; 
                    dispatch({
                        type: ActionTypes.CREATE_LABEL,
                        label, 
                    })
                }
            }).catch(async (err) => {
                responseError(err);
            })
    }
}

export function updateLabel(data) {
    initAPI();
    return async dispatch => {
        await axios.post(`/label/update`, data)
            .then((res) => {
                notify(res);
                if (res.data.code === 200) {
                    dispatch(listLabel({ page: 1, limit: 20 }));
                }
            }).catch(async (err) => {
                responseError(err);
            })
    }
}

export function deleteLabel(id, force = false) {
    initAPI();
    const url = force ? `/label/permanent-delete` : `/label/delete`;
    return async dispatch => {
        await axios.post(url, { id })
            .then((res) => {
                notify(res);
                if (res.data.code === 200) {
                    dispatch(listLabel({ page: 1, limit: 20 }));
                }
            }).catch(async (err) => {
                responseError(err);
            })
    }
}

export function restoreLabel(id) {
    initAPI();
    return async dispatch => {
        await axios.post(`/label/restore`, { id })
            .then((res) => {
                notify(res);
                if (res.data.code === 200) {
                    dispatch(listLabel({ page: 1, limit: 20, deleted: true }));
                }
            }).catch(async (err) => {
                responseError(err);
            })
    }
}

export function updateStatusLabel(id, status) {
    initAPI();
    return async dispatch => {
        await axios.post(`/label/update-status`, { id, status })
            .then((res) => {
                notify(res);
                if (res.data.code === 200) {
                    dispatch(listLabel({ page: 1, limit: 20, status: 'ACTIVE' }));
                }
            }).catch(async (err) => {
                responseError(err);
            })
    }
}

// Update order of children under a parent tag
export function updateLabelOrder(parentId, orderedChildren) {
    initAPI();
    return async () => {
        try {
            const children = (orderedChildren || [])
                .map((child, index) => ({
                    id: child && (child._id || child.id || child),
                    ordering: index + 1,
                }))
                .filter((child) => child.id);

            const res = await axios.post(`/label/update-children-ordering`, {
                parent_id: parentId,
                children,
            });
            notify(res);
            return res;
        } catch (err) {
            responseError(err);
        }
    }
}

export function listLabelAssign(params) {
    initAPI();
    return async (dispatch) => {
        dispatch({ type: ActionTypes.LABEL_ASSIGN_LOADING });
        try {
            const res = await axios.post(`/label/items`, params); 
            if (res.data.code === 200) {
                dispatch({
                    type: ActionTypes.LIST_LABEL_ASSIGN,
                    items: res.data.data,
                    total: res.data.totalRecord,
                    page: params.page || 1,
                    limit: res.data.perPage || 20,
                });
            }
        } catch (err) {
            console.error('listLabelAssign error:', err);
        }
    };
}

export function listLabelsByItem(params) {
    initAPI();
    return async (dispatch) => {
        try {
            const res = await axios.post(`/label/labels-by-item`, params);
            if (res.data.code === 200) {
                const labels = res.data.data?.records || res.data.data?.labels || res.data.data || [];
                dispatch({
                    type: ActionTypes.LIST_LABELS_BY_ITEM,
                    labels,
                });
                return labels;
            }
        } catch (err) {
            console.error('listLabelsByItem error:', err);
        }

        return [];
    };
}

export function syncLabels(params) {
    initAPI();
    return async () => {
        try {
            const res = await axios.post(`/label/sync-labels`, params);
            notify(res, false);
            return res;
        } catch (err) {
            responseError(err);
        }
    };
}

export function assignLabel(params) {
    return async (dispatch) => {
        try {
            const res = await axios.post(`/label/add-item`, params);
            if (res.data.code === 200) {
                dispatch({ type: ActionTypes.ASSIGN_LABEL, payload: params });
            }
        } catch (err) {
            console.error('assignLabel error:', err);
        }
    };
}

export function bulkUpdateLabelItems(params) {
    initAPI();
    return async (dispatch) => {
        try {
            const res = await axios.post(`/label/bulk-update-items`, params);
            notify(res);
            if (res.data.code === 200) {
                dispatch({ type: ActionTypes.BULK_UPDATE_LABEL_ITEMS, payload: params });
            }
        } catch (err) {
            responseError(err);
        }
    };
}

export function unassignLabel(params) {
    return async (dispatch) => {
        try {
            const res = await axios.post(`/label/remove-item`, params);
            if (res.data.code === 200) {
                dispatch({ type: ActionTypes.UNASSIGN_LABEL, payload: params });
            }
        } catch (err) {
            console.error('unassignLabel error:', err);
        }
    };
}
