import { poster } from "@/services/api";
import { IApiRequest, IApiResponseDetail } from "@/types";
import useSWRMutation from "swr/mutation";

export interface ICheckAnswer {
  hasTaken: boolean;
  latestScore: LatestScore;
}

export interface LatestScore {
  id: string;
  total_score_achieve: number;
  total_exam_point: number;
  total_question: number;
  time_doing: number;
  ques_answer_doing: number;
  created_at: string;
  exam_section: ExamSection[];
  question_logs: QuestionLog[];
  questions_correct: number;
}

export interface ExamSection {
  part_name: string;
  total_question: number;
  part_type: string;
  correct: number;
  wrong: number;
  total_point: number;
  score_achieve: number;
  childLogs: ChildLog[];
}

export interface ChildLog {
  child_name: string;
  total_question: number;
  total_child_point: number;
  score_achieve: number;
  correct: number;
  subpart_name: string;
  isMain: boolean;
  wrong: number;
}

export interface QuestionLog {
  question_id: string;
  question_text: string;
  score: number;
  is_test_question: boolean;
  user_answer: string[];
  correct_answer: CorrectAnswer[];
}

export interface CorrectAnswer {
  _id: string;
  value: string;
  label?: string;
}

export interface ICheckAnswerRequest extends IApiRequest {
  user_id: string;
  exam_id: string;
}

export interface ICheckAnswerResponse
  extends IApiResponseDetail<ICheckAnswer> {}

export const useCheckAnswer = () =>
  useSWRMutation<ICheckAnswerResponse, any, string, ICheckAnswerRequest>(
    "/exam-word/check-answer",
    poster
  );
