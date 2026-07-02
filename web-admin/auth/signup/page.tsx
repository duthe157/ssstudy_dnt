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
import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
export default function SignUp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams?.get("redirect") || "/";
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

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
  } = useForm<SignUpFormData>({
    resolver: yupResolver(schema as any),
    defaultValues: {
      fullname: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const checkAuthStatus = () => {
      const isLoggedIn = authService.isLoggedIn();
      if (isLoggedIn) {
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

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      const payload = {
        fullname: data.fullname,
        email: data.email,
        phone: data.phone,
        password: data.password,
      };

      const response = await authService.signUp(payload);

      if (response.code === 200) {
        toast.success(response.message || "Đăng ký thành công!");

        // Lưu thông tin điền sẵn cho trang đăng nhập (không qua URL)
        try {
          sessionStorage.setItem(
            "prefillSignIn",
            JSON.stringify({
              emailOrPhone: data.email || data.phone,
              password: data.password,
            })
          );
        } catch {}

        // Chuyển sang trang đăng nhập, kèm email/phone để prefill
        const qs = new URLSearchParams({
          email: data.email || "",
          phone: data.phone || "",
        }).toString();
        router.push(`/auth/signin?${qs}`);
      } else {
        toast.error(response.message || "Đăng ký thất bại!");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại!"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      const payload = {
        credential: "",
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
      };

      const res = await authService.googleAuth(payload);

      if (res.code === 200) {
        if (res.data?.token) {
          localStorage.setItem("token", res.data.token);
          localStorage.setItem(
            "user",
            JSON.stringify({
              id: res.data.user_id,
              fullname: res.data.fullname,
              email: res.data.email,
              avatar: res.data.avatar,
              phone: res.data.phone,
              user_group: res.data.user_group,
            })
          );
          toast.success(res.message || "Đăng ký Google thành công!");
          try {
            window.dispatchEvent(new Event("storage"));
            const updateLoginEvent = new CustomEvent("updateLoginStatus", {
              detail: { isLogin: true },
            });
            window.dispatchEvent(updateLoginEvent);
          } catch {}
          router.push(redirectParam || "/");
        } else {
          toast.success(
            res.message || "Đăng ký Google thành công! Vui lòng xác thực số điện thoại."
          );
          const qs = new URLSearchParams({
            email: res.data?.email || "",
            phone: res.data?.phone || "",
          }).toString();
          router.push(`/auth/signup/verify?${qs}`);
        }
      } else {
        toast.error(res.message || "Đăng ký Google thất bại!");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Đã có lỗi xảy ra khi đăng ký Google!"
      );
    } finally {
      setIsLoading(false);
    }
  };

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
      {/* Bên trái - hình ảnh */}
      <div className="hidden md:flex md:w-1/2 bg-blue-50 items-center justify-center p-8">
        <div className="max-w-md">
          <Image
            src="/imgs/home/wellcome2.png"
            alt="Đăng ký"
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

      {/* Bên phải - form đăng ký */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <Link href="/" className="inline-block">
              <Image
                src="/imgs/logo.png"
                alt="SSStudy Logo"
                width={180}
                height={60}
                className="h-12 w-auto"
              />
            </Link>
            <h1 className="text-2xl font-bold mt-6 text-gray-800">Đăng ký</h1>
            <p className="text-gray-600 mt-2">
              Tham gia cùng hàng ngàn học sinh đang học tập trên nền tảng chúng
              tôi
            </p>
          </div>

          {/* Thanh bước 1-2-3 */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                1
              </div>
              <div className="w-12 h-1 bg-gray-200" />
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-semibold">
                2
              </div>
              <div className="w-12 h-1 bg-gray-200" />
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-semibold">
                3
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
            {/* Họ và tên */}
            <div className="space-y-2">
              <label
                htmlFor="fullname"
                className="block text-sm font-medium text-gray-700"
              >
                Họ và tên
              </label>
              <Input
                id="fullname"
                type="text"
                placeholder="Họ và tên"
                {...register("fullname")}
                className={`w-full ${errors.fullname ? "border-red-500" : ""}`}
              />
              {errors.fullname && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.fullname.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Địa chỉ email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                {...register("email")}
                className={`w-full ${errors.email ? "border-red-500" : ""}`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Số điện thoại */}
            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Số điện thoại
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="Số điện thoại"
                {...register("phone")}
                className={`w-full ${errors.phone ? "border-red-500" : ""}`}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Mật khẩu */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mật khẩu
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mật khẩu"
                    {...register("password")}
                    className={`w-full pr-10 ${
                      errors.password ? "border-red-500" : ""
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <FaEyeSlash size={18} />
                    ) : (
                      <FaEye size={18} />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Xác nhận mật khẩu */}
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nhập lại mật khẩu
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Xác nhận mật khẩu"
                    {...register("confirmPassword")}
                    className={`w-full pr-10 ${
                      errors.confirmPassword ? "border-red-500" : ""
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label="Toggle password visibility"
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash size={18} />
                    ) : (
                      <FaEye size={18} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {/* Nút Đăng ký */}
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
                "ĐĂNG KÝ"
              )}
            </Button>
          </form>

          {/* Đăng ký qua Google */}
          <div className="mt-6">
            <button
              type="button"
              onClick={onGoogleSignUp}
              disabled={isLoading}
              className={`w-full border rounded-lg p-3 flex items-center justify-center bg-white ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <span className="mr-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-white border text-gray-800">
                <FcGoogle size={18} />
              </span>
              <span className="font-medium text-gray-700">
                ĐĂNG KÝ QUA GOOGLE
              </span>
            </button>
          </div>

          {/* Chuyển sang đăng nhập */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Đã có tài khoản?{" "}
              <Link
                href="/auth/signin"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SignUpFormData {
  fullname: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const phoneRegExp = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;

const schema = yup.object({
  fullname: yup.string().required("Họ và tên không được để trống"),
  email: yup
    .string()
    .email("Email không đúng định dạng")
    .required("Email không được để trống"),
  phone: yup
    .string()
    .matches(phoneRegExp, "Số điện thoại không đúng định dạng")
    .required("Số điện thoại không được để trống"),
  password: yup
    .string()
    .min(6, "Mật khẩu phải ít nhất 6 ký tự")
    .required("Mật khẩu không được để trống"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Mật khẩu xác nhận không khớp")
    .required("Vui lòng xác nhận mật khẩu"),
});
