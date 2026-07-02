import { apiService } from "./api";

export interface ExamListPayload {
  exam_category_id: string | null;
  keyword: string | null;
  level: string | null;
  page: number;
  subject_id: string[] | null;
}

export interface ExamItem {
  _id: string;
  name: string;
  number_of_questions: number;
  duration: number;
  status: "not_started" | "doing" | "finished";
  score?: number;
  year: number;
  is_redo: boolean;
  type: string;
  doc_type: string;
  exam_total_score?: number;
  time: number;
  total_ques: number;
  total_time_doing?: number;
  creating_type?: string;
  is_take_section: boolean;
  exam_section: any[];
  exam_doc_link: string;
}

export interface SubjectItem {
  _id: string;
  name: string;
  // description: string;
}

export interface ExamDetailResponse {
  code: number;
  data: ExamItem;
  message: string;
}

export interface ExamQuestionsResponse {
  code: number;
  data: any; // Define a more specific type if known
  message: string;
}

export interface ExamListResponse {
  code: number;
  data: {
    records: ExamItem[];
    total_records: number;
  };
  message: string;
}

export interface ExamGetScoreResponse {
  code: number;
  data: any;
  message: string;
}

export interface SubjectListResponse {
  code: number;
  data: any;
  message: string;
}

export interface CompetitionPartListResponse {
  code: number;
  data: {
    records: CompetitionPart[];
  };
  message: string;
}

export interface CompetitionPart {
  type: string;
  hidden: boolean;
  _id: string;
  name: string;
  config: Config[];
  parts: Part[];
  created_at: string;
  updated_at: string;
  deleted_at: string;
  point_true_false: PointTrueFalse;
}

export interface Config {
  viewExamPerPart: boolean;
  timePerPart: boolean;
  viewOneQuestion: boolean;
  e_hidden_answer: boolean;
}

export interface Part {
  _id: string;
  hidden: boolean;
  deleted: boolean;
  name: string;
}

export interface PointTrueFalse {
  "1": number;
  "2": number;
  "3": number;
  "4": number;
}

export interface CategoryItem {
  _id: string;
  name: string;
  alias: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryListResponse {
  code: number;
  data: {
    records: CategoryItem[];
  };
  message: string;
}
export const examService = {
  verifyExam: (examId: string) => {
    return apiService.post("/exam/v2/verify-exam", {
      exam_id: examId,
    }) as Promise<any>;
  },
  getExamDetail: (payload: {
    id: string;
    classroom_id?: string;
    type?: string;
  }) => {
    return apiService.post(`/exam/detail`, {
      ...payload,
    }) as Promise<any>;
  },
  getExamQuestions: (payload: {
    exam_id: string;
    group_id?: string;
    section_id?: string;
    subject_in_group?: [];
  }) => {
    return apiService.post(`/exam/v2/let-question`, {
      ...payload,
    }) as Promise<ExamQuestionsResponse>;
  },
  getExamFile: (payload: {
    exam_id: string;
    group_id?: string;
    section_id?: string;
    subject_in_group?: [];
  }) => {
    return apiService.post(
      `/exam/v2/let-file`,
      { ...payload },
      { responseType: "blob" }
    ) as Promise<any>;
  },
  getExamList: (payload: ExamListPayload): Promise<ExamListResponse> => {
    return apiService.post("/exam-list", { ...payload });
  },
  scoring: (payload: {
    answers: any[];
    classroom_id: string;
    exam_id: string;
    exam_key: number;
    subject_in_group: any[];
    time_doing: number;
  }): Promise<any> => {
    return apiService.post("/exam/v2/scoring", { ...payload });
  },
  getScore: (payload: {
    exam_id: string;
    exam_key: string;
  }): Promise<ExamGetScoreResponse> => {
    return apiService.post("/exam/v2/get-score", { ...payload });
  },
  getScoreByClassroom: (payload: {
    exam_id: string;
    classroom_id: string;
  }): Promise<ExamGetScoreResponse> => {
    return apiService.post("/exam/v2/get-score", { ...payload });
  },
  getSubjectList: (): Promise<SubjectListResponse> => {
    return apiService.post("/subject-list", {});
  },
  getExamListWord: (payload: ExamListPayload): Promise<ExamListResponse> => {
    return apiService.post("/exam-word/list", { ...payload });
  },
  getCompetitionPartList: (): Promise<CompetitionPartListResponse> => {
    return apiService.post("/competition-part/list", { limit: 100 });
  },
  getCategoryList: (): Promise<CategoryListResponse> => {
    return apiService.post("/exam-word-category/list", { limit: 100 });
  },
};
