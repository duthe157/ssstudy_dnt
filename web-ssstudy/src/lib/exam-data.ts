import {
  CategoryListResponse,
  CompetitionPartListResponse,
  ExamDetailResponse,
  ExamItem,
} from "@/services/examService";
import { ExamListPayload } from "@/services/examService";
import { ExamQuestionsResponse } from "@/services/examService";
import { examService } from "@/services/examService";

import { cache } from "react";

export const verifyExam = cache(async (examId: string) => {
  try {
    const rsVerifyExamData = await examService.verifyExam(examId);
    return rsVerifyExamData;
  } catch (error) {
    console.error("Error fetching home page data:", error);
    return null;
  }
});

export const getExamDetail = cache(
  async (payload: {
    creating_type: string;
    exam_id: string;
  }): Promise<ExamItem | null> => {
    try {
      const rsExamDetailData: ExamDetailResponse =
        await examService.getExamDetail(payload);
      if (rsExamDetailData.code === 200) {
        return rsExamDetailData.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching exam detail data:", error);
      return null;
    }
  }
);

export const getExamQuestions = cache(
  async (payload: {
    exam_id: string;
    group_id?: string;
    section_id?: string;
    subject_in_group?: [];
  }): Promise<any> => {
    try {
      const rsExamQuestionsData: ExamQuestionsResponse =
        await examService.getExamQuestions(payload);

      return rsExamQuestionsData.data;
    } catch (error) {
      console.error("Error fetching exam questions data:", error);
      return null;
    }
  }
);

export const getExamFile = cache(
  async (payload: {
    exam_id: string;
    group_id?: string;
    section_id?: string;
    subject_in_group?: [];
  }) => {
    try {
      const rsExamFileData = await examService.getExamFile(payload);
      return rsExamFileData;
    } catch (error) {
      console.error("Error fetching exam file data:", error);
      return null;
    }
  }
);

export const getExamList = cache(
  async (payload: ExamListPayload): Promise<any> => {
    try {
      const rsExamList = await examService.getExamList(payload);
      // Support both legacy { code, data } and new { data: { page, totalItems, totalPages, data: [] } }
      if (rsExamList && typeof (rsExamList as any).code !== "undefined") {
        return (rsExamList as any).code === 200
          ? (rsExamList as any).data
          : null;
      }
      // New API returns the payload under .data
      return (rsExamList as any)?.data ?? rsExamList ?? null;
    } catch (error) {
      console.error("Error fetching exam list:", error);
      return null;
    }
  }
);

export const getCompetitionPartList = cache(
  async (): Promise<CompetitionPartListResponse | null> => {
    try {
      const response = await examService.getCompetitionPartList();
      // Support both legacy { code, data } and new { data: { page, totalItems, totalPages, data: [] } }
      return response;
    } catch (error) {
      console.error("Error fetching exam list:", error);
      return null;
    }
  }
);

export const getCategoryList = cache(
  async (): Promise<CategoryListResponse | null> => {
    try {
      const response = await examService.getCategoryList();
      return response;
    } catch (error) {
      console.error("Error fetching exam list:", error);
      return null;
    }
  }
);

export const scoring = cache(
  async (payload: {
    answers: any[];
    classroom_id: string;
    exam_id: string;
    exam_key: number;
    subject_in_group: any[];
    time_doing: number;
  }) => {
    try {
      const rsScoring = await examService.scoring(payload);
      return rsScoring;
    } catch (error) {
      console.error("Error fetching home page data:", error);
      return null;
    }
  }
);

export const getScore = cache(
  async (payload: { exam_id: string; exam_key: string }): Promise<any> => {
    try {
      const rsGetScore = await examService.getScore(payload);
      if (rsGetScore.code === 200) {
        return rsGetScore.data;
      }
    } catch (error) {
      console.error("Error fetching home page data:", error);
      return null;
    }
  }
);

export const getSubjectList = cache(async (): Promise<any> => {
  try {
    const rsGetSubjectList = await examService.getSubjectList();
    if (rsGetSubjectList.code === 200) {
      return rsGetSubjectList.data;
    }
  } catch (error) {
    console.error("Error fetching subject list data:", error);
    return null;
  }
});
