"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle } from "lucide-react";
import { setSecureCookie, setCookie, setSSStudyCookies } from "@/utils/cookie";

// Định nghĩa kiểu dữ liệu cho form đăng nhập
interface SignInFormData {
  emailOrPhone: string;
  password: string;
}

// Regex kiểm tra số điện thoại Việt Nam
const phoneRegExp = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
// Regex kiểm tra mã học sinh (4-11 chữ số)
const studentCodeRegExp = /^[0-9]{4,13}$/;

// Schema validation cho form đăng nhập
const schema = yup.object({
  emailOrPhone: yup
    .string()
    .required("Email, số điện thoại hoặc mã học sinh không được để trống")
    .test(
      "emailOrPhone",
      "Email, số điện thoại hoặc mã học sinh không đúng định dạng",
      (value) => {
        if (!value) return false;
        const trimmedValue = value.trim();
        const isValidEmail = yup.string().email().isValidSync(trimmedValue);
        const isValidPhone = phoneRegExp.test(trimmedValue);
        const isValidStudentCode = studentCodeRegExp.test(trimmedValue);
        return isValidEmail || isValidPhone || isValidStudentCode;
      }
    ),
  password: yup.string().required("Mật khẩu không được để trống"),
});

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams?.get("redirect") || "/";
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [apiError, setApiError] = useState<string>("");

  // Kiểm tra xem người dùng đã đăng nhập chưa khi trang được tải
  useEffect(() => {
    const checkAuthStatus = () => {
      const isLoggedIn = authService.isLoggedIn();

      if (isLoggedIn) {
        // Nếu đã đăng nhập, chuyển hướng
        toast.info("Bạn đã đăng nhập!", {
          position: "top-right",
          autoClose: 3000,
        });
        router.push(redirectParam || "/");
      }

      setIsCheckingAuth(false);
    };

    checkAuthStatus();
  }, [router, redirectParam]);

  // Sử dụng react-hook-form để quản lý form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: yupResolver(schema as any),
    defaultValues: {
      emailOrPhone: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    setApiError(""); // Clear lỗi cũ khi submit lại
    try {
      const payload = {
        email: data.emailOrPhone,
        password: data.password,
      };

      const response = await authService.signIn(payload);

      if (response.code === 200) {
        const userInfo = {
          id: response.data.user_id,
          fullname: response.data.fullname,
          email: response.data.email,
          avatar: response.data.avatar,
          phone: response.data.phone,
          user_group: response.data.user_group,
          level: response.data.level,
          code: response.data.code || response.data.phone,
        };

        // CÁCH 1 (KHUYẾN NGHỊ): Lưu cookie an toàn qua API route
        // Token sẽ được lưu với httpOnly flag, không thể truy cập từ JavaScript
        const cookieSet = await setSecureCookie(
          response.data.token,
          userInfo
        );

        if (!cookieSet) {
          // Fallback: Nếu API route fail, dùng client-side cookie
          console.warn("API cookie failed, using client-side cookie");
          
          // Xác định domain dựa trên môi trường
          const isProduction = process.env.NODE_ENV === "production";
          const domain = isProduction ? ".ssstudy.vn" : undefined;
          
          const cookieOptions = {
            domain: domain,
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 ngày
            secure: isProduction,
            sameSite: "lax" as const,
          };
          
          // Set cookie cho token (không httpOnly khi set từ client)
          setCookie("token", response.data.token, cookieOptions);
          
          // Set cookie cho user info
          setCookie("user", JSON.stringify(userInfo), cookieOptions);
          
          // Set SSSTUDY cookies (bao gồm SSSTUDY_USER)
          setSSStudyCookies(response.data.token, response.data.user_id, {
            fullname: response.data.fullname,
            email: response.data.email,
            avatar: response.data.avatar,
            phone: response.data.phone,
            user_group: response.data.user_group,
            level: response.data.level,
            code: response.data.code || response.data.phone,
          });
        }

        // Backup: Vẫn lưu vào localStorage để compatibility
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(userInfo));

        // Hiển thị toast thông báo thành công
        toast.success(response.message || "Đăng nhập thành công!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Kích hoạt sự kiện để cập nhật UI
        try {
          window.dispatchEvent(new Event("storage"));
          const updateLoginEvent = new CustomEvent("updateLoginStatus", {
            detail: { isLogin: true },
          });
          window.dispatchEvent(updateLoginEvent);
        } catch (e) {
          console.error("Không thể kích hoạt sự kiện cập nhật:", e);
        }

        // Chuyển hướng về trang redirect nếu có, mặc định về '/'
        setTimeout(() => {
          router.push(redirectParam || "/");
        }, 100);
      } else {
        const errorMessage = response.message || "Đăng nhập thất bại!";
        setApiError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại!";
      setApiError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Hiển thị loading khi đang kiểm tra trạng thái đăng nhập
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600">
            Đang kiểm tra thông tin đăng nhập...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-stretch">
      {/* Phần hình ảnh bên trái - chỉ hiển thị trên màn hình trung bình trở lên */}
      <div className="hidden md:flex md:w-1/2 bg-blue-50 items-center justify-center p-8">
        <div className="max-w-md">
          <Image
            src="/imgs/home/wellcome2.png"
            alt="Đăng nhập"
            width={500}
            height={500}
            className="w-full h-auto"
            priority
          />
          <h2 className="text-2xl font-bold text-center mt-6 text-gray-800">
            Chào mừng bạn đến với SSStudy
          </h2>
          <p className="text-center text-gray-600 mt-2">
            Nền tảng học trực tuyến hàng đầu
          </p>
        </div>
      </div>

      {/* Phần form đăng nhập bên phải */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <Image
                src="/imgs/logo.png"
                alt="SSStudy Logo"
                width={180}
                height={60}
                className="h-12 w-auto"
              />
            </Link>
            <h1 className="text-2xl font-bold mt-6 text-gray-800">Đăng nhập</h1>
            <p className="text-gray-600 mt-2">
              Đăng nhập để truy cập vào tài khoản của bạn
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="emailOrPhone"
                className="block text-sm font-medium text-gray-700"
              >
                Email, số điện thoại hoặc mã học sinh
              </label>
              <Input
                id="emailOrPhone"
                type="text"
                placeholder="Nhập email, số điện thoại hoặc mã học sinh của bạn"
                {...register("emailOrPhone")}
                onChange={(e) => {
                  register("emailOrPhone").onChange(e);
                  if (apiError) setApiError(""); // Clear lỗi API khi user nhập lại
                }}
                className={`w-full ${
                  errors.emailOrPhone ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                }`}
              />
              {errors.emailOrPhone && (
                <p className="text-red-500 text-sm mt-2 font-medium">
                  {errors.emailOrPhone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mật khẩu
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu của bạn"
                {...register("password")}
                onChange={(e) => {
                  register("password").onChange(e);
                  if (apiError) setApiError(""); // Clear lỗi API khi user nhập lại
                }}
                className={`w-full ${errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-2 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Hiển thị lỗi API */}
            {apiError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm md:text-base font-medium text-red-800">
                      {apiError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <Link
                href="/auth/signup"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
