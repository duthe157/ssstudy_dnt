import * as ActionTypes from './type';
import { isUndefined } from 'util';

const initState = {
	categories: [],
	categoriesFilter: [],
	categoryVideo: null,
	categoryVideos: [],
	category: null,
	total: 0,
	image: null,
	page: 1,
	limit: 20,
	ids: [],
	checkAll: false,
	redirect: false,
	count: 0,
	initCategory: [],
	configs: [],
	chapter_ids: [],
};
const reducer = (state = initState, action) => {
	switch (action.type) {
		case ActionTypes.LIST_CATEGORY_VIDEO:
			return {
				...state,
				categoryVideos: action.categoryVideos,
				total: action.total,
				limit: action.limit,
				ids: [],
				checkAll: false,
				redirect: false,
				categoriesFilter: [],
				initCategory: [],
				chapter_ids: [],
			};

		case ActionTypes.LIST_CATEGORY:
			return {
				...state,
				categories: action.categories,
				total: action.total,
				limit: action.limit,
				ids: [],
				checkAll: false,
				redirect: false,
				categoriesFilter: [],
				initCategory: [],
				chapter_ids: [],
			};
		case 'PAGING':
			return {
				...state,
				page: action.page,
			};
		case 'FILTER':
			const beforeFilter = state.categories;
			const afterFilter = beforeFilter.filter((obj, i) => {
				if (action.data.includes(obj.chapter.id)) {
					return obj;
				}
			});
			const chapter_ids = state.chapter_ids;
			var temps1 = state.initCategory;
			var configs1 = state.configs;

			return {
				...state,
				categoriesFilter: afterFilter,
				chapter_ids: action.data,
				initCategory: [],
				configs: [],
			};
		case 'CHECK_COUNT':
			var temps = state.initCategory;
			var configs = state.configs;

			const check = temps.find(
				({ category_id }) => category_id === action.data.category_id,
			);
			const check2 = configs.find(
				({ category_id }) => category_id === action.data.category_id,
			);

			var test = null;
			var test2 = null;
			if (isUndefined(check)) {
				test = Object.assign(temps, temps.push(action.data));
				test2 = Object.assign(configs, configs.push(action.config));
			} else {
				const copy = Object.assign(check, action.data);
				test = Object.assign([copy], temps);

				const copy2 = Object.assign(check2, action.config);
				test2 = Object.assign([copy2], configs);
			}

			const count = test.reduce(
				(accumulator, currentValue) =>
					accumulator + (currentValue.total || 0),
				0,
			);
			return {
				...state,
				initCategory: test,
				configs: test2,
				count: count,
			};
		case ActionTypes.CREATE_CATEGORY_VIDEO:
			return {
				...state,
				redirect: action.redirect,
			};
		case ActionTypes.CREATE_CATEGORY:
			return {
				...state,
				redirect: action.redirect,
			};
		case ActionTypes.SHOW_CATEGORY_VIDEO:
			return {
				...state,
				categoryVideo: action.categoryVideo,
			};
		case ActionTypes.SHOW_CATEGORY:
			return {
				...state,
				category: action.category,
			};

		case ActionTypes.ASSIGN:
			return {
				...state,
				categoriesFilter: action.data,
				initCategory: action.initCategory,
				configs: action.configs,
				chapter_ids: action.chapter_ids,
				diff_chapter: action.chapter_ids,
			};

		case ActionTypes.UPDATE_CATEGORY_VIDEO:
			const arr1 = state.categoryVideos;
			const newArr1 = arr1.filter(ele => ele._id !== action.categoryVideo._id);
			newArr1.unshift(action.categoryVideo);
			return {
				...state,
				categoryVideos: newArr1,
				redirect: action.redirect,
			};

		case ActionTypes.UPDATE_CATEGORY:
			const arr = state.categories;
			const newArr = arr.filter(ele => ele._id !== action.category._id);
			newArr.unshift(action.category);
			return {
				...state,
				// categories: newArr,
				redirect: action.redirect,
			};
		case ActionTypes.UPDATE_META_DATA:
			return {
				...state,
				categories: action.category,
				redirect: action.redirect,
			};
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
				ids: deletes,
			};
		case ActionTypes.DELETE_CATEGORY:
			return {
				...state,
				ids: [],
				checkAll: false,
			};
		case ActionTypes.DELETE_CATEGORY_VIDEO:
			return {
				...state,
				ids: [],
				checkAll: false,
			};
		case ActionTypes.CHECK_ALL:
			const categories = state.categories;
			var deletesAll = [];
			if (action.status) {
				deletesAll = Object.assign(
					[],
					Array.from(categories, ele => ele._id),
				);
			} else {
				deletesAll = [];
			}
			return {
				...state,
				checkAll: action.status,
				ids: deletesAll,
			};
		case "UPLOAD_IMAGE":
			return {
				...state,
				image: action.data[0],
			};
		default:
			return state;
	}
};

export default reducer;
