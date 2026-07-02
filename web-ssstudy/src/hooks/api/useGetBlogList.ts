import { poster } from "@/services/api";
import { IApiRequest, IApiResponse } from "@/types";
import useSWRMutation from "swr/mutation";

export interface IBlog {
  _id: string;
  name: string;
  alias: string;
  external_link: string;
  description: string;
  content: string;
  status: boolean;
  is_featured: boolean;
  level: string;
  subject_id: string;
  category: Category;
  image: string;
  created_at: string;
  updated_at: string;
  view_count: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface IBlogRequest extends IApiRequest {
  keyword?: string;
}

export interface IBlogResponse extends IApiResponse<IBlog[]> {}

export const useGetBlogList = () =>
  useSWRMutation<IBlogResponse, any, string, IBlogRequest>(
    "/blog/list",
    poster
  );
