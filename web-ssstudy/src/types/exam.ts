export interface ExamPart {
  _id: string;
  id: string;
  name: string;
  time?: number; // thời gian làm bài theo phần (phút)
  type?: string; // Loại phần thi (NHOM_CHU_DE, DEFAULT, etc.)
  subpart?: ExamSubpart[];
}

export interface ExamSubpart {
  _id: string;
  id: string;
  name: string;
  children: ExamChild[];
  isMain?: boolean; // Thuộc tính để xác định subpart chính hay phụ
}

export interface ExamChild {
  _id: string;
  id: string;
  name: string;
  time?: number;
  score?: number;
  questions: ExamQuestion[];
}

export interface ExamQuestion {
  _id: string;
  number?: number | string;
  question_type?: string;
  type?: string;
  __originalIndex?: number;
  questionId?: string;
  parentId?: string;
  plainText?: string;
  question?: string;
  question_text?: string;
  rawHtml?: string;
  question_json?: string;
  choices?: QuestionChoice[];
  correctAnswers?: string[];
  images?: string[];
  __partId?: string;
  __partName?: string;
  __subpartId?: string;
  __subpartName?: string;
  __isMain?: boolean;
  __childId?: string;
  __childName?: string;
  __showPartHeader?: boolean;
  __isCluster?: boolean;
  __clusterQuestions?: ExamQuestion[];
  isTestQuestion?: boolean;
  searchId?: string;
}

export interface QuestionChoice {
  label: string;
  text: string;
  images?: string[];
}

export interface WordExamData {
  _id: string;
  id?: string; // Alternative ID field
  name: string;
  title?: string; // Alternative name field
  practiceConfig?: {
    status?: string | boolean;
    startDate?: string;
    start_date?: string;
    endDate?: string;
    end_date?: string;
    result_display?: "IMMEDIATELY" | "LATER";
    answer_display?: "IMMEDIATELY" | "LATER";
    required_passwword?: boolean;
    required_password?: boolean;
    password?: string;
  };
  e_cheating?: boolean; // Chặn thao tác gian lận (true = bật chặn)
  subject?: {
    _id: string;
    name: string;
  };
  time?: number; // thời gian tổng (phút)
  total_questions?: number; // Tổng số câu hỏi
  questions?: ExamQuestion[]; // Câu hỏi trực tiếp (không qua parts)
  parts: ExamPart[];
  categoryExam?: Array<{
    config?: Array<{
      viewExamPerPart?: boolean;
      timePerPart?: boolean;
      viewOneQuestion?: boolean;
    }>;
  }>;
}

export interface UserAnswer {
  question_id: string;
  value: any;
  isTestQuestion?: boolean; // Câu hỏi thử nghiệm không tính điểm
}

export interface ExamConfig {
  viewExamPerPart?: boolean;
  timePerPart?: boolean;
  viewOneQuestion?: boolean;
}

export type QuestionType =
  | "TN_SINGLE_CHOICE"
  | "TN_MULTI_CHOICE"
  | "TRUE_FALSE"
  | "TN_TRUE_FALSE"
  | "TRUE_FALSE_STATEMENTS"
  | "SHORT_ANSWER"
  | "FILL_BLANK"
  | "DRAG_DROP"
  | "CLUSTER_QUESTION"
  | "ESSAY";

export interface QuestionResponse {
  [questionId: string]: {
    answer: any;
  };
}
