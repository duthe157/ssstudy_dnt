import axios, { AxiosRequestConfig } from "axios";
import https from "https";
import config from "@/config";
import { getCookie, deleteCookie } from "@/utils/cookie";

// Configure HTTPS agent to handle SSL certificate issues during build
// Only use this in server-side (build time) environment
// During build, we may need to accept self-signed certificates
const httpsAgent = typeof window === "undefined" 
  ? new https.Agent({
      rejectUnauthorized: false, // Allow self-signed certificates during build
    })
  : undefined;

const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
  httpsAgent,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from cookie or localStorage (matching web-user pattern)
    // Only access on client-side (browser)
    let token = null;

    if (typeof window !== "undefined") {
      try {
        // Ưu tiên 1: Get token from SSSTUDY_USER (chứa đầy đủ thông tin)
        const ssStudyUser = getCookie("SSSTUDY_USER");
        if (ssStudyUser) {
          try {
            const userData = JSON.parse(ssStudyUser);
            token = userData.token;
          } catch (e) {
            console.warn("Error parsing SSSTUDY_USER cookie:", e);
          }
        }
        
        if (!token) {
          // Ưu tiên 2: Get token from SSSTUDY_SID
          const sid = getCookie("SSSTUDY_SID");
          if (sid) {
            token = sid;
          } else {
            // Ưu tiên 3: Get token from cookie (an toàn hơn, hoạt động trên tất cả subdomain)
            const cookieToken = getCookie("token");
            if (cookieToken) {
              token = cookieToken;
            } else {
              // Ưu tiên 4: Fallback to localStorage token
              const storedToken = localStorage.getItem("token");
              if (storedToken) {
                token = storedToken;
              } else {
                // Ưu tiên 5: Try to get from dataLogin (web-user pattern)
                const dataLogin = localStorage.getItem("dataLogin");
                if (dataLogin) {
                  const parsed = JSON.parse(dataLogin);
                  token = parsed.token;
                }
              }
            }
          }
        }
      } catch (error) {
        console.warn("Error getting token:", error);
      }
    }

    if (token) {
      config.headers.Authorization = token;
    }
    config.headers["Accept"] = "application/json, text/plain, */*";
    config.headers["Accept-Language"] = "vi,en-US;q=0.9,en;q=0.8,ja;q=0.7";

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // Handle specific error codes
      if (error.response.status === 401) {
        // Handle unauthorized - xóa cả cookie và localStorage
        if (typeof window !== "undefined") {
          // Xóa cookie (cả client-side và server-side)
          const isProduction = process.env.NODE_ENV === "production";
          const domain = isProduction ? ".ssstudy.vn" : undefined;
          
          deleteCookie("token", { domain, path: "/" });
          deleteCookie("user", { domain, path: "/" });
          deleteCookie("SSSTUDY_SID", { domain, path: "/" });
          deleteCookie("SSSTUDY_UID", { domain, path: "/" });
          deleteCookie("SSSTUDY_USER", { domain, path: "/" });
          
          // Xóa localStorage (backward compatibility)
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("dataLogin");
        }
        // Redirect to login or show notification
      }
    }
    return Promise.reject(error);
  }
);

// Tạo các hàm API tiện ích
export const apiService = {
  /**
   * Thực hiện yêu cầu GET
   * @param url - Đường dẫn API endpoint
   * @param config - Cấu hình Axios tùy chọn
   * @returns Dữ liệu từ phản hồi API
   */
  get: <T>(url: string, config?: AxiosRequestConfig) => {
    return api.get<any, T>(url, config);
  },

  /**
   * Thực hiện yêu cầu POST
   * @param url - Đường dẫn API endpoint
   * @param data - Dữ liệu để gửi trong request body
   * @param config - Cấu hình Axios tùy chọn
   * @returns Dữ liệu từ phản hồi API
   */
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return api.post<any, T>(url, data, config);
  },

  /**
   * Thực hiện yêu cầu PUT
   * @param url - Đường dẫn API endpoint
   * @param data - Dữ liệu để gửi trong request body
   * @param config - Cấu hình Axios tùy chọn
   * @returns Dữ liệu từ phản hồi API
   */
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return api.put<any, T>(url, data, config);
  },

  /**
   * Thực hiện yêu cầu DELETE
   * @param url - Đường dẫn API endpoint
   * @param config - Cấu hình Axios tùy chọn
   * @returns Dữ liệu từ phản hồi API
   */
  delete: <T>(url: string, config?: AxiosRequestConfig) => {
    return api.delete<any, T>(url, config);
  },

  /**
   * Thực hiện yêu cầu PATCH
   * @param url - Đường dẫn API endpoint
   * @param data - Dữ liệu để gửi trong request body
   * @param config - Cấu hình Axios tùy chọn
   * @returns Dữ liệu từ phản hồi API
   */
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return api.patch<any, T>(url, data, config);
  },

  /**
   * Tạo axios instance mới
   * @param config - Cấu hình Axios
   * @returns Axios instance mới
   */
  create: (config?: any) => {
    return axios.create(config);
  },
};

export const fetcher = <T>([url, params]: [
  string,
  AxiosRequestConfig["params"]
]): Promise<T> => apiService.get<T>(url, { params });

export const poster = <T, TBody = Record<string, any>>(
  url: string,
  { arg }: { arg: TBody }
): Promise<T> => apiService.post<T>(url, arg);

export default api;
