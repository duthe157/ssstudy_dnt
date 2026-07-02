import { poster } from "@/services/api";
import { IApiResponseDetail } from "@/types";
import useSWRMutation from "swr/mutation";
import { IReview } from "./useGetReviewList";

export interface IIReviewDetailRequest {
  id: string;
}

export interface IReviewDetailResponse extends IApiResponseDetail<IReview> {}

export const useReviewDetail = () =>
  useSWRMutation<IReviewDetailResponse, any, string, IIReviewDetailRequest>(
    "/review/detail",
    poster
  );
