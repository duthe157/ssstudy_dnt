export interface IApiRequest {
  page?: number;
  limit?: number;
}

export interface IApiResponseDetail<T> {
  status: number;
  message: string;
  data: T;
}

export interface IApiResponse<T> {
  status: number;
  message: string;
  data: {
    data: T;
    records: T;
    limit: number;
    page: number;
    perPage: number;
    totalRecord: number;
    totalItems: number;
    totalPages: number;
  };
}
