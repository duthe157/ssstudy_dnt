import { apiService } from './api';

export interface SubjectRecord {
  id?: string | number;
  _id?: string;
  name?: string;
}

export interface SubjectListResponse {
  code?: number;
  data?: { records: SubjectRecord[] };
  records?: SubjectRecord[];
}

export const subjectService = {
  list: (body: { limit: number; is_delete?: boolean }) =>
    apiService.post<SubjectListResponse>('/subject/list', body),
};

export default subjectService;


