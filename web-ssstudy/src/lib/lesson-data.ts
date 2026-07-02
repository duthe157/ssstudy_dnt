import {
  CategoryListPayload,
  LessonDetailPayload,
  lessonService,
  ClassroomViewPayload,
  ClassroomChapterCategoryPayload,
  BookIdCourseViewPayload,
} from "@/services/lessonService";

import { cache } from "react";

export const getCategories = cache(async (payload: CategoryListPayload) => {
  try {
    const response = await lessonService.getCategories(payload);
    if (response.code === 200) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return null;
  }
});

export const getLessonDetail = async (payload: LessonDetailPayload) => {
  try {
    const response = await lessonService.getLessonDetail(payload);
    if (response.code === 200) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return null;
  }
};

// API mới: Lấy thông tin khóa học
export const getClassroomView = async (payload: ClassroomViewPayload) => {
  try {
    const response = await lessonService.getClassroomView(payload);
    if (response.code === 200) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching classroom view:", error);
    return null;
  }
};

// API mới: Lấy danh sách chương và bài học
export const getClassroomChapterCategory = async (
  payload: ClassroomChapterCategoryPayload
) => {
  try {
    const response = await lessonService.getClassroomChapterCategory(payload);
    if (response.code === 200) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching classroom chapter category:", error);
    return null;
  }
};

export const getBookIdCourseView = async (payload: BookIdCourseViewPayload) => {
  try {
    const response = await lessonService.getBookIdCourseView(payload);
    if (response.code === 200) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching book-id course view:", error);
    return null;
  }
};

