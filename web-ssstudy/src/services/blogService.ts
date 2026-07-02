import { apiService } from "./api";

export interface BlogCategory {
  id?: string;
  name?: string;
  alias?: string;
}

export interface BlogRecord {
  _id: string;
  name: string;
  alias: string;
  content: string;
  description?: string;
  external_link?: string;
  image?: string;
  status?: boolean | string | null;
  created_at?: string;
  updated_at?: string;
  category?: BlogCategory;
  is_featured?: boolean;
}

export interface BlogListFilterRequest {
  category_name?: string | null;
  status?: boolean | null;
  is_featured?: boolean | null;
  page?: number;
  limit?: number;
}

export interface BlogListFilterResponse {
  code: number;
  message?: string;
  data: {
    perPage?: number;
    records: BlogRecord[];
  };
}

export interface TopCategoriesPostsGroup {
  category: { id: string; name: string; alias?: string };
  posts: BlogRecord[];
}

export interface TopCategoriesPostsResponse {
  code: number;
  message?: string;
  data: {
    groups: TopCategoriesPostsGroup[];
  };
}

export interface LatestByCategoryResponse {
  code: number;
  data: {
    records: BlogRecord[];
  };
}

export interface FeaturedByCategoryResponse {
  code?: number;
  data?: { records: BlogRecord[] };
  records?: BlogRecord[];
}

export interface BlogDetailResponse {
  code?: number;
  data?: (BlogRecord & { content?: string; view_count?: number }) | null;
}

export interface RandomByCategoryExcludeResponse {
  code?: number;
  data?: { records: BlogRecord[] };
  records?: BlogRecord[];
}

export const blogService = {
  listFilter: (body: BlogListFilterRequest) =>
    apiService.post<BlogListFilterResponse>("/blog/list-filter", body),
  topCategoriesPosts: (body: any) =>
    apiService.post<TopCategoriesPostsResponse>("/blog/top-categories-posts", body),
  listPublic: (body: {
    keyword: string | null;
    limit: number;
    page: number;
    category_id?: string | null;
    level?: string | number | null;
    subject_id?: string | null;
  }) =>
    apiService.post<{
      code: number;
      data: { records: BlogRecord[]; perPage?: number; total?: number };
    }>("/blog/list-public", body),
  latestByCategory: (body: { category_id: string }) =>
    apiService.post<LatestByCategoryResponse>("/blog/latest-by-category", body),
  featuredByCategory: (body: { category_id: string }) =>
    apiService.post<FeaturedByCategoryResponse>(
      "/blog/featured-by-category",
      body
    ),
  detail: (body: { id: string }) =>
    apiService.post<BlogDetailResponse>("/blog/detail", body),
  randomByCategoryExclude: (body: {
    category_id: string;
    exclude_ids: string[];
  }) =>
    apiService.post<RandomByCategoryExcludeResponse>(
      "/blog/random-by-category-exclude",
      body
    ),
};

export default blogService;
