import { apiService } from './api';

export const aboutService = {
  getAboutPageData: () => {
    return apiService.post<any>('/about/detail');
  },

  getBlog: (page: number, size: number, category_name: string = 'Về SSStudy', options = {}) => {
    return apiService.post<any>('/blog/list-public', {
      page,
      limit: size,
      category_name,
      ...options,
    });
  },

  getEvaluation: (
    keyword: string = '',
    limit: number = 2,
    page: number = 1,
    type: string = 'DANHGIA_HOCSINH'
  ) => {
    return apiService.post<any>('/adult-evalution/list', {
      page,
      limit,
      keyword,
      type,
    });
  },
};
