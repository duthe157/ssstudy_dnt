import { fetcher } from "@/services/api";
import { IApiRequest, IApiResponse } from "@/types";
import useSWR, { SWRConfiguration } from "swr";

export interface IHonorBoard {
  _id: string;
  name: string;
  avatar: string;
  address: string;
  score: number;
}

export interface IHonorBoardRequest extends IApiRequest {}

export interface IHonorBoardResponse extends IApiResponse<IHonorBoard[]> {}

export const useGetHonorBoard = (
  params?: IHonorBoardRequest,
  options?: SWRConfiguration<IHonorBoardResponse>
) =>
  useSWR<IHonorBoardResponse>(
    ["/review/achievementBoard", params],
    fetcher,
    options
  );
