import axios from "axios";
import config from "@/config";
import { DocumentListRequest, DocumentListResponse } from "@/types/document";

/**
 * Service xử lý các nghiệp vụ liên quan đến Tài liệu
 * Đồng bộ cách gọi giống bookService và courseService
 * - List/Category: Dùng port 3013 (Legacy Server)
 * - Detail/Related: Dùng port 4549 (Main Server)
 */
export const documentService = {
  /**
   * Lấy danh sách tài liệu với bộ lọc (Dùng port 3013)
   */
  getDocumentList: async (payload: DocumentListRequest) => {
    let token: string | null = null;
    try {
      const storedToken = localStorage.getItem("token");
      if (storedToken) token = storedToken;
      else {
        const dataLogin = localStorage.getItem("dataLogin");
        if (dataLogin) token = JSON.parse(dataLogin)?.token ?? null;
      }
    } catch {}

    const instance = axios.create({
      baseURL: (config.legacyApiUrl || "https://api.luyenthitiendat.vn").replace(/\/$/, ""),
    });

    const newPayload = {
      page: payload.page?.toString() || "",
      limit: payload.limit?.toString() || "",
      keyword: payload.keyword || "",
      main_category_id: payload.group_id || "",
      sub_category_id: payload.category_id || "",
      document_type: payload.type || "",
    };

    return instance.post("/document/list-public", newPayload, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
      },
    }).then(res => res.data);
  },

  /**
   * Lấy chi tiết tài liệu theo id (Dùng port 4549)
   */
  getDocumentDetail: async (id: string) => {
    let token: string | null = null;
    try {
      const storedToken = localStorage.getItem("token");
      if (storedToken) token = storedToken;
      else {
        const dataLogin = localStorage.getItem("dataLogin");
        if (dataLogin) token = JSON.parse(dataLogin)?.token ?? null;
      }
    } catch {}

    const instance = axios.create({
      baseURL: config.apiUrl,
    });
    return instance.post(
      "/document/show",
      { id },
      {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: token } : {}),
        },
      }
    ).then(res => res.data);
  },

  /**
   * Lấy danh sách tài liệu liên quan (Dùng port 3013)
   */
  getRelatedDocuments: async (document_id: string) => {
    let token: string | null = null;
    try {
      const storedToken = localStorage.getItem("token");
      if (storedToken) token = storedToken;
      else {
        const dataLogin = localStorage.getItem("dataLogin");
        if (dataLogin) token = JSON.parse(dataLogin)?.token ?? null;
      }
    } catch {}

    const instance = axios.create({
      baseURL: (config.legacyApiUrl || "https://api.luyenthitiendat.vn").replace(/\/$/, ""),
    });
    return instance.post("/document/list-related", { document_id }, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
      },
    }).then(res => res.data);
  },

  /**
   * Lấy danh mục tài liệu (Dùng port 3013)
   */
  getDocumentCategoryList: async (payload: {
    page: string;
    limit: string;
    keyword: string;
  }) => {
    let token: string | null = null;
    try {
      const storedToken = localStorage.getItem("token");
      if (storedToken) token = storedToken;
      else {
        const dataLogin = localStorage.getItem("dataLogin");
        if (dataLogin) token = JSON.parse(dataLogin)?.token ?? null;
      }
    } catch {}

    const instance = axios.create({
      baseURL: (config.legacyApiUrl || "https://api.luyenthitiendat.vn").replace(/\/$/, ""),
    });
    return instance.post("/document-category/list-public", payload, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
      },
    }).then(res => res.data);
  },
};
