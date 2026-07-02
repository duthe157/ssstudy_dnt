import axios from 'axios';
import * as ActionTypes from './type';
import { initAPI, responseError, notify } from '../../config/api';

export function listDashboard(data) {
	initAPI();
	return async dispatch => {
		await axios
			.post(`/app/dashboard`, data)
			.then(res => {
				notify(res, false);
				if (res.data.code === 200) {
					dispatch({ type: 'PAGING', page: data.page });
					const total = res.data.data.totalRecord;
					const limit = res.data.data.perPage;
                    const dashboard = res.data.data;
					dispatch({
						type: ActionTypes.LIST_DASH_BOARD,
						total,
						limit,
                        dashboard
					});
				}
			})
			.catch(async err => {
				responseError(err);
			});
	};
}