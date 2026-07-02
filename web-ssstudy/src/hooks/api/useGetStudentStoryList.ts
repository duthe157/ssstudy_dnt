import { poster } from "@/services/api";
import { IApiRequest, IApiResponse } from "@/types";
import useSWRMutation from "swr/mutation";

export interface IStudentStory {
  _id: string;
  name: string;
  image?: string;
  alias: string;
  external_link: string;
  description: string;
  content: string;
  status: boolean;
  is_featured: boolean;
  level: string;
  subject_id: string;
  category: Category;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface IStudentStoryRequest extends IApiRequest {
  category_id?: string;
  category_name?: string;
  page?: number;
  limit?: number;
}

export interface IStudentStoryResponse extends IApiResponse<IStudentStory[]> {}

export const useGetStudentStoryList = () =>
  useSWRMutation<IStudentStoryResponse, any, string, IStudentStoryRequest>(
    "/blog/list-student-story",
    poster
  );
