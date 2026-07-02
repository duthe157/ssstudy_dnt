import { apiService } from "./api";
import { getCookie, deleteSecureCookie } from "@/utils/cookie";

interface SignInPayload {
  email?: string;
  phone?: string;
  code?: string;
  password: string;
}

interface SignInResponse {
  data: {
    token: string;
    user_id: string;
    code: string;
    fullname: string;
    email: string;
    level: string | null;
    time_login: number;
    phone: string;
    avatar: string;
    user_group: string;
  };
  message: string;
  code: number;
}

interface SignUpPayload {
  fullname: string;
  email: string;
  phone: string;
  password: string;
}

interface SignUpResponse {
  code: number;
  message: string;
  data?: any;
}

interface GoogleAuthPayload {
  credential: string;
  client_id: string;
}

interface GoogleAuthResponse {
  code: number;
  message?: string;
  data?: {
    token?: string;
    user_id?: string;
    fullname?: string;
    email?: string;
    avatar?: string;
    phone?: string;
    user_group?: string;
  };
}

interface ForgotPasswordPayload {
  email: string;
}

interface ForgotPasswordResponse {
  data: boolean;
  message: string;
  code: number;
}

export const authService = {
  /**
   * Đăng nhập với email/số điện thoại và mật khẩu
   * @param payload - Thông tin đăng nhập bao gồm email hoặc số điện thoại và mật khẩu
   * @returns Dữ liệu phản hồi từ API
   */
  signIn: (payload: SignInPayload) => {
    return apiService.post<SignInResponse>("/auth/signin", payload);
  },

  /**
   * Đăng ký tài khoản mới
   * @param payload - Thông tin đăng ký
   * @returns Dữ liệu phản hồi từ API
   */
  signUp: (payload: SignUpPayload) => {
    return apiService.post<SignUpResponse>("/auth/signup", payload);
  },

  /**
   * Gửi yêu cầu khôi phục mật khẩu
   * @param payload - Email đã đăng ký
   * @returns Thông báo từ API
   */
  forgotPassword: (payload: ForgotPasswordPayload) => {
    return apiService.post<ForgotPasswordResponse>("/forgot-password", payload);
  },

  /**
   * Kiểm tra trạng thái đăng nhập hiện tại (matching web-user pattern)
   * Ưu tiên: SSSTUDY_SID > Cookie token > localStorage
   * @returns true nếu đã đăng nhập, false nếu chưa
   */
  isLoggedIn: (): boolean => {
    if (typeof window === "undefined") return false;

    // Ưu tiên 1: Check SSSTUDY_SID (Session ID)
    const sid = getCookie("SSSTUDY_SID");
    if (sid) return true;

    // Ưu tiên 2: Check cookie token (an toàn hơn, hoạt động trên tất cả subdomain)
    const cookieToken = getCookie("token");
    if (cookieToken) return true;

    // Ưu tiên 3: Check localStorage token (để backward compatibility)
    const token = localStorage.getItem("token");
    if (token) return true;

    // Ưu tiên 4: Check dataLogin (web-user pattern)
    try {
      const dataLogin = localStorage.getItem("dataLogin");
      if (dataLogin) {
        const parsed = JSON.parse(dataLogin);
        return !!parsed.token;
      }
    } catch (error) {
      console.warn("Error parsing dataLogin:", error);
    }

    return false;
  },

  /**
   * Lấy thông tin người dùng đã đăng nhập
   * Ưu tiên: Cookie > localStorage
   * @returns Thông tin người dùng hoặc null nếu chưa đăng nhập
   */
  getCurrentUser: () => {
    if (typeof window === "undefined") return null;

    // Ưu tiên 1: Try to get from cookie user (hoạt động trên tất cả subdomain)
    const cookieUserStr = getCookie("user");
    if (cookieUserStr) {
      try {
        return JSON.parse(cookieUserStr);
      } catch (error) {
        console.warn("Error parsing cookie user data:", error);
      }
    }

    // Ưu tiên 2: Try to get from localStorage user
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.warn("Error parsing user data:", error);
      }
    }

    // Ưu tiên 3: Try to get from dataLogin (web-user pattern)
    try {
      const dataLogin = localStorage.getItem("dataLogin");
      if (dataLogin) {
        const parsed = JSON.parse(dataLogin);
        return parsed;
      }
    } catch (error) {
      console.warn("Error parsing dataLogin:", error);
    }

    return null;
  },

  /**
   * Lấy SSSTUDY Session ID (token)
   */
  getSessionId: (): string | null => {
    if (typeof window === "undefined") return null;

    // Ưu tiên SSSTUDY_SID
    const sid = getCookie("SSSTUDY_SID");
    if (sid) return sid;

    // Fallback: cookie token
    const token = getCookie("token");
    if (token) return token;

    // Fallback: localStorage
    return localStorage.getItem("token");
  },

  /**
   * Lấy SSSTUDY User ID
   */
  getUserId: (): string | null => {
    if (typeof window === "undefined") return null;

    // Ưu tiên SSSTUDY_UID
    const uid = getCookie("SSSTUDY_UID");
    if (uid) return uid;

    // Fallback: từ user info
    const user = authService.getCurrentUser();
    return user?.id || user?.user_id || null;
  },

  /**
   * Đăng xuất người dùng hiện tại
   * Xóa cả cookie và localStorage
   */
  signOut: async () => {
    if (typeof window === "undefined") return;

    // Xóa cookie an toàn qua API route (bao gồm tất cả httpOnly cookies)
    try {
      await deleteSecureCookie();
    } catch (error) {
      console.error("Error deleting secure cookies:", error);
    }

    // Xóa localStorage (để backward compatibility)
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("dataLogin"); // Also remove dataLogin

    // Chuyển hướng về trang đăng nhập
    window.location.href = "/auth/signin";
  },
  googleAuth: (payload: GoogleAuthPayload) => {
    return apiService.post<GoogleAuthResponse>("/auth/google-auth", payload);
  },
};
