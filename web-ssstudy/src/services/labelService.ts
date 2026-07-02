import { apiService } from "./api";

export interface LabelItem {
  parent_id: string | null;
  status: string;
  is_primary: boolean;
  ordering: number;
  num_item: number;
  deleted_at: string | null;
  _id: string;
  name: string;
  alias: string;
  created_at: string;
  updated_at: string;
  children?: LabelItem[];
}

export const labelService = {
  getPublicLabels: (): Promise<{
    data?: {
      record?: LabelItem;
      records?: LabelItem[];
    };
    code: number;
    message: string;
  }> => {
    return apiService.post("/label/list-public");
  },
};
