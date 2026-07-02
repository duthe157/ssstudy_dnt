/**
 * Utility functions để làm việc với cookies
 * Không dùng js-cookie, chỉ dùng vanilla JavaScript
 */

interface CookieOptions {
  domain?: string;
  path?: string;
  maxAge?: number;
  expires?: Date;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

/**
 * Set cookie từ client-side (dùng cho non-sensitive data)
 * LÀM VIỆC trên tất cả subdomain nếu domain bắt đầu bằng dấu chấm
 */
export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
) {
  const {
    domain = "",
    path = "/",
    maxAge,
    expires,
    secure = false,
    sameSite = "lax",
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (domain) {
    cookieString += `; domain=${domain}`;
  }

  if (path) {
    cookieString += `; path=${path}`;
  }

  if (maxAge) {
    cookieString += `; max-age=${maxAge}`;
  }

  if (expires) {
    cookieString += `; expires=${expires.toUTCString()}`;
  }

  if (secure) {
    cookieString += "; secure";
  }

  if (sameSite) {
    cookieString += `; samesite=${sameSite}`;
  }

  document.cookie = cookieString;
}

/**
 * Đọc cookie từ client-side
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const nameEQ = encodeURIComponent(name) + "=";
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(
        cookie.substring(nameEQ.length, cookie.length)
      );
    }
  }

  return null;
}

/**
 * Xóa cookie
 */
export function deleteCookie(name: string, options: CookieOptions = {}) {
  setCookie(name, "", {
    ...options,
    maxAge: -1,
    expires: new Date(0),
  });
}

/**
 * Kiểm tra xem cookie có tồn tại không
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== null;
}

/**
 * Đọc tất cả cookies
 */
export function getAllCookies(): Record<string, string> {
  if (typeof document === "undefined") {
    return {};
  }

  const cookies: Record<string, string> = {};
  const cookieStrings = document.cookie.split(";");

  for (const cookieString of cookieStrings) {
    const [name, value] = cookieString.split("=").map((c) => c.trim());
    if (name) {
      cookies[decodeURIComponent(name)] = decodeURIComponent(value || "");
    }
  }

  return cookies;
}

/**
 * Helper để set cookie an toàn thông qua API route
 * Đây là cách KHUYẾN NGHỊ cho sensitive data như token
 */
export async function setSecureCookie(
  token: string,
  user: Record<string, unknown>
) {
  try {
    const response = await fetch("/api/auth/set-cookie", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, user }),
      credentials: "include", // Quan trọng: để browser gửi và nhận cookies
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error setting secure cookie:", error);
    return false;
  }
}

/**
 * Helper để xóa cookie an toàn thông qua API route
 */
export async function deleteSecureCookie() {
  try {
    const response = await fetch("/api/auth/set-cookie", {
      method: "DELETE",
      credentials: "include",
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error deleting secure cookie:", error);
    return false;
  }
}

/**
 * Helper để set SSSTUDY cookies từ client-side (fallback)
 */
export function setSSStudyCookies(
  token: string,
  userId: string,
  userInfo?: Record<string, unknown>
) {
  const isProduction = process.env.NODE_ENV === "production";
  const domain = isProduction ? ".ssstudy.vn" : undefined;

  const cookieOptions = {
    domain: domain,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 ngày
    secure: isProduction,
    sameSite: "lax" as const,
  };

  // Set SSSTUDY_SID (token)
  setCookie("SSSTUDY_SID", token, cookieOptions);

  // Set SSSTUDY_UID (user_id)
  setCookie("SSSTUDY_UID", userId, cookieOptions);

  // Set SSSTUDY_USER (toàn bộ thông tin user bao gồm token)
  if (userInfo) {
    const userData = {
      token: token,
      user_id: userId,
      code: userInfo.code || userInfo.phone || "",
      fullname: userInfo.fullname || "",
      email: userInfo.email || "",
      level: userInfo.level || "",
      time_login: Date.now(),
      phone: userInfo.phone || "",
      avatar: userInfo.avatar || null,
      user_group: userInfo.user_group || "",
    };
    setCookie("SSSTUDY_USER", JSON.stringify(userData), cookieOptions);
  }
}

/**
 * Helper để xóa SSSTUDY cookies
 */
export function deleteSSStudyCookies() {
  const isProduction = process.env.NODE_ENV === "production";
  const domain = isProduction ? ".ssstudy.vn" : undefined;

  const cookieOptions = {
    domain: domain,
    path: "/",
  };

  deleteCookie("SSSTUDY_SID", cookieOptions);
  deleteCookie("SSSTUDY_UID", cookieOptions);
  deleteCookie("SSSTUDY_USER", cookieOptions);
}

/**
 * Helper để get SSSTUDY cookies
 */
export function getSSStudyCookies() {
  const userCookie = getCookie("SSSTUDY_USER");
  let userData = null;

  if (userCookie) {
    try {
      userData = JSON.parse(userCookie);
    } catch (error) {
      console.error("Error parsing SSSTUDY_USER cookie:", error);
    }
  }

  return {
    sid: getCookie("SSSTUDY_SID"),
    uid: getCookie("SSSTUDY_UID"),
    user: userData,
  };
}

/**
 * Helper để get SSSTUDY_USER cookie
 */
export function getSSStudyUser() {
  const userCookie = getCookie("SSSTUDY_USER");
  
  if (!userCookie) {
    return null;
  }

  try {
    return JSON.parse(userCookie);
  } catch (error) {
    console.error("Error parsing SSSTUDY_USER cookie:", error);
    return null;
  }
}

/**
 * Debug function để kiểm tra cookies
 */
export function debugCookies() {
  if (typeof window === "undefined") {
    console.log("❌ Not in browser environment");
    return;
  }

  console.log("🍪 === DEBUG COOKIES ===");
  console.log("📍 Current domain:", window.location.hostname);
  console.log("🔐 Current protocol:", window.location.protocol);
  
  const allCookies = getAllCookies();
  console.log("\n📦 All cookies:", allCookies);
  
  const ssStudyCookies = getSSStudyCookies();
  console.log("\n🎯 SSSTUDY cookies:");
  console.log("  - SSSTUDY_SID:", ssStudyCookies.sid ? "✅ Present" : "❌ Missing");
  console.log("  - SSSTUDY_UID:", ssStudyCookies.uid ? "✅ Present" : "❌ Missing");
  console.log("  - SSSTUDY_USER:", ssStudyCookies.user ? "✅ Present" : "❌ Missing");
  
  if (ssStudyCookies.user) {
    console.log("\n👤 User data:");
    console.log("  - User ID:", ssStudyCookies.user.user_id);
    console.log("  - Email:", ssStudyCookies.user.email);
    console.log("  - Full name:", ssStudyCookies.user.fullname);
    console.log("  - Token length:", ssStudyCookies.user.token?.length || 0);
    console.log("  - Login time:", new Date(ssStudyCookies.user.time_login).toLocaleString());
  }
  
  console.log("🍪 === END DEBUG ===");
}

