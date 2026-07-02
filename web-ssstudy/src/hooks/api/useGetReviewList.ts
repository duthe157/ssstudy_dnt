import { poster } from "@/services/api";
import { IApiRequest, IApiResponse } from "@/types";
import useSWRMutation from "swr/mutation";

export interface Parents {
  name: string;
  description: string;
  images: string;
  address: string;
  thumnailImg: string;
  source: string;
  links: string;
}

export interface Students {
  name: string;
  description: string;
  links: string;
  images: string;
}

export interface Classroom {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface ClassroomGroup {
  id: string;
  name: string;
}

export interface IReview {
  hiden: boolean;
  _id: string;
  comment: string;
  name:string;
  image:string;
  description:string;
  content:string;
  alias: string;
  parents?: Parents;
  students?: Students;
  type: string;
  classroom: Classroom;
  subject: Subject;
  classroom_group: ClassroomGroup;
  created_at: string;
  updated_at: string;
}

export interface IReviewRequest extends IApiRequest {
  type: 0 | 1 | 2;
}

export interface IReviewResponse extends IApiResponse<IReview[]> {}

export const useGetReviewList = () =>
  useSWRMutation<IReviewResponse, any, string, IReviewRequest>(
    "/adult-evalution/list",
    poster
  );
