import { apiService } from "./api";

export interface BlogCategoryRecord {
  _id: string;
  name: string;
  alias?: string;
  status?: boolean;
}

export interface BlogCategoryWithCount extends BlogCategoryRecord {
  post_count?: number;
}

export interface BlogCategoryListPublicResponse {
  code: number;
  message?: string;
  data: {
    records: BlogCategoryRecord[];
  };
}

export const blogCategoryService = {
  listPublic: () =>
    apiService.post<BlogCategoryListPublicResponse>(
      "/blog-category/list-public"
    ),
  listWithCount: () =>
    apiService.post<{
      code?: number;
      data?: { records: BlogCategoryWithCount[] };
      records?: BlogCategoryWithCount[];
    }>("/blog-category/list-with-count"),
  detail: (body: { id: string }) =>
    apiService.post<{ code?: number; data?: BlogCategoryRecord }>(
      "/blog-category/detail",
      body
    ),
};

export default blogCategoryService;
