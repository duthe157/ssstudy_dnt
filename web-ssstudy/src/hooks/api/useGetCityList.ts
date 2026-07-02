import { IApiRequest, IApiResponse } from "@/types";
import useSWR, { SWRConfiguration } from "swr";

export interface ICity {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  phone_code: number;
  wards: any[];
}

export interface ICityRequest extends IApiRequest {}

export type ICityResponse = ICity[];

const fetcher = async <T>([url, params]: [
  string,
  Record<string, any>
]): Promise<T> => {
  const queryString = params
    ? "?" + new URLSearchParams(params).toString()
    : "";

  const res = await fetch(url + queryString, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error(`Fetch error: ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as T;
};

export const useGetCityList = (
  params?: ICityRequest,
  options?: SWRConfiguration<ICityResponse>
) =>
  useSWR<ICityResponse>(
    ["https://provinces.open-api.vn/api/v2/p", params],
    fetcher,
    options
  );
