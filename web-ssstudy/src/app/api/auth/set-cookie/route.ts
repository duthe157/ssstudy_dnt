import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, user } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token is required" },
        { status: 400 }
      );
    }

    // Tạo response
    const response = NextResponse.json({
      success: true,
      message: "Cookies set successfully",
    });

    // Xác định domain dựa trên môi trường
    const isProduction = process.env.NODE_ENV === "production";
    
    // Lấy domain từ request header để đảm bảo cookie hoạt động đúng
    let domain = "localhost";
    if (isProduction) {
      const host = request.headers.get("host") || "";
      console.log("🔍 [SET-COOKIE] Host:", host);
      
      // Nếu đang truy cập từ subdomain của ssstudy.vn, set domain là .ssstudy.vn
      // Điều này đảm bảo cookie hoạt động trên www.ssstudy.vn và tất cả subdomain
      if (host.includes("ssstudy.vn")) {
        domain = ".ssstudy.vn";
        console.log("✅ [SET-COOKIE] Setting domain:", domain);
      } else {
        domain = host; // Fallback về host hiện tại
        console.log("⚠️ [SET-COOKIE] Using fallback domain:", domain);
      }
    }

    // Cookie options chung cho httpOnly cookies
    const secureCookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax" as const,
      domain: domain,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 ngày
    };

    // Set cookie cho token với các options bảo mật
    response.cookies.set({
      name: "token",
      value: token,
      ...secureCookieOptions,
    });

    // Set SSSTUDY_SID - Session ID (token)
    response.cookies.set({
      name: "SSSTUDY_SID",
      value: token,
      ...secureCookieOptions,
    });

    // Set SSSTUDY_UID - User ID
    if (user?.id || user?.user_id) {
      response.cookies.set({
        name: "SSSTUDY_UID",
        value: String(user.id || user.user_id),
        ...secureCookieOptions,
      });
    }

    // Set cookie cho user info (không httpOnly vì cần đọc từ client)
    if (user) {
      response.cookies.set({
        name: "user",
        value: JSON.stringify(user),
        httpOnly: false, // Client cần đọc được để hiển thị UI
        secure: isProduction,
        sameSite: "lax",
        domain: domain,
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 ngày
      });
    }

    // Set SSSTUDY_USER - Toàn bộ thông tin user (để dùng chung với các service khác)
    if (user && token) {
      const userData = {
        token: token,
        user_id: String(user.id || user.user_id || ""),
        code: user.code || user.phone || "",
        fullname: user.fullname || "",
        email: user.email || "",
        level: user.level || "",
        time_login: Date.now(),
        phone: user.phone || "",
        avatar: user.avatar || null,
        user_group: user.user_group || "",
      };
      
      const userDataString = JSON.stringify(userData);
      
      // Log cookie size để debug
      console.log("📦 [SSSTUDY_USER] Cookie size:", userDataString.length, "bytes");
      if (userDataString.length > 4000) {
        console.warn("⚠️ [SSSTUDY_USER] Cookie size is large (>4KB), may cause issues");
      }
      
      // Log sample data (không log token đầy đủ vì bảo mật)
      console.log("📦 [SSSTUDY_USER] Data:", {
        user_id: userData.user_id,
        email: userData.email,
        token_length: userData.token.length,
        domain: domain,
        secure: isProduction,
      });
      
      response.cookies.set({
        name: "SSSTUDY_USER",
        value: userDataString,
        httpOnly: false, // Client cần đọc được
        secure: isProduction,
        sameSite: "lax",
        domain: domain,
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 ngày
      });
      
      console.log("✅ [SSSTUDY_USER] Cookie set successfully");
    }

    console.log("✅ [SET-COOKIE] All cookies set successfully");
    return response;
  } catch (error) {
    console.error("Error setting cookies:", error);
    return NextResponse.json(
      { success: false, message: "Failed to set cookies" },
      { status: 500 }
    );
  }
}

// API để xóa cookie khi logout
export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: "Cookies cleared successfully",
  });

  const isProduction = process.env.NODE_ENV === "production";
  
  // Lấy domain từ request header
  let domain = "localhost";
  if (isProduction) {
    const host = request.headers.get("host") || "";
    if (host.includes("ssstudy.vn")) {
      domain = ".ssstudy.vn";
    } else {
      domain = host;
    }
  }

  const clearOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    domain: domain,
    path: "/",
    maxAge: 0, // Xóa ngay lập tức
  };

  // Xóa cookie token
  response.cookies.set({
    name: "token",
    value: "",
    ...clearOptions,
  });

  // Xóa SSSTUDY_SID
  response.cookies.set({
    name: "SSSTUDY_SID",
    value: "",
    ...clearOptions,
  });

  // Xóa SSSTUDY_UID
  response.cookies.set({
    name: "SSSTUDY_UID",
    value: "",
    ...clearOptions,
  });

  // Xóa cookie user (không httpOnly)
  response.cookies.set({
    name: "user",
    value: "",
    httpOnly: false,
    secure: isProduction,
    sameSite: "lax",
    domain: domain,
    path: "/",
    maxAge: 0,
  });

  // Xóa SSSTUDY_USER
  response.cookies.set({
    name: "SSSTUDY_USER",
    value: "",
    httpOnly: false,
    secure: isProduction,
    sameSite: "lax",
    domain: domain,
    path: "/",
    maxAge: 0,
  });

  return response;
}

