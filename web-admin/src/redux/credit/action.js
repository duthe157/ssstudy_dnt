import axios from 'axios';
import * as ActionTypes from './type';
import { initAPI, responseError, notify } from '../../config/api';

export function listCredit(data) {
    initAPI();
    return async (dispatch) => {
        await axios.post('/credit/list', data)
            .then((res) => {
                notify(res, false);
                if (res.data.code === 200) {
                    dispatch({ type: 'PAGING', page: data.page });
                    const credits = res.data.data.records;
					const total = res.data.data.totalRecord;
					const limit = res.data.data.perPage;
					dispatch({
						type: ActionTypes.LIST_CREDIT,
						credits,
						total,
						limit: limit,
					});
                } else {
                    console.log('falure!');
                }
            })
    }
}