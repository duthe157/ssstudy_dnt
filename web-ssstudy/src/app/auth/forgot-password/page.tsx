"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { KeyRound, Loader2, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";

interface ForgotPasswordFormData {
  email: string;
}

const schema = yup.object({
  email: yup
    .string()
    .required("Vui lòng nhập email đã đăng ký")
    .email("Địa chỉ email không hợp lệ"),
});

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(schema as any),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      router.push("/auth/signin");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => {
        if (prev === null) return prev;
        return prev > 0 ? prev - 1 : 0;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router]);

  const onSubmit = async (values: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      const response = await authService.forgotPassword({
        email: values.email.trim(),
      });

      if (response.code === 200) {
        const message =
          response.message ||
          "Vui lòng kiểm tra email để đặt lại mật khẩu.";
        // toast.success(message);
        setSuccessMessage(message);
        reset();
        setCountdown(10);
      } else {
        const errorMessage =
          response.message || "Yêu cầu khôi phục mật khẩu thất bại!";
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "Đã có lỗi xảy ra. Vui lòng thử lại!";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white px-4 py-12">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#dfe9ff] text-[#235CD0]">
          <KeyRound className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-3xl font-bold uppercase text-[#235CD0]">
          Bạn quên mật khẩu
        </h1>
        <p className="mt-3 inline-flex items-center text-center text-base text-gray-600">
          <span className="mr-2 text-xl text-[#8fb3ff]">◆</span>
          <span className="whitespace-nowrap">
            Chúng tôi sẽ gửi email khôi phục qua bạn, vui lòng nhập địa chỉ email đã đăng ký
          </span>
          <span className="ml-2 text-xl text-[#8fb3ff]">◆</span>
        </p>
      </div>

      <div className="mx-auto mt-10 w-full max-w-lg rounded-[32px] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.1)]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-semibold text-gray-700"
            >
              Nhập địa chỉ email
            </label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="Nhập địa chỉ email"
                className={`h-12 bg-white pl-12 pr-4 text-base ${
                  errors.email
                    ? "border-red-400 focus-visible:ring-red-500"
                    : "focus-visible:ring-[#235CD0]"
                }`}
                {...register("email")}
                disabled={isSubmitting}
              />
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
            {errors.email && (
              <p className="text-sm font-medium text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-2xl bg-gradient-to-r from-[#235CD0] to-[#1a4bb3] text-base font-semibold text-white shadow-lg transition hover:opacity-90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi yêu cầu...
              </>
            ) : (
              <>
                Khôi phục mật khẩu
                <Mail className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {successMessage && (
          <div className="border-pulse mt-6 rounded-2xl border bg-blue-50 p-4 text-sm text-blue-700">
            {successMessage}
          </div>
        )}

        {countdown !== null && (
          <p className="mt-4 text-center text-sm font-semibold text-gray-700">
            Chuẩn bị điều hướng về trang đăng nhập trong{" "}
            <span className="text-lg font-bold text-blue-500">{countdown}s</span>
          </p>
        )}
      </div>

        <p className="mt-8 text-center text-sm text-gray-600">
          Nhớ mật khẩu rồi?{" "}
          <Link href="/auth/signin" className="font-semibold text-[#235CD0]">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
      <style jsx>{`
        @keyframes borderPulse {
          0%,
          100% {
            border-color: #bfdbfe;
            box-shadow: 0 0 0 0 rgba(35, 92, 208, 0.12);
          }
          50% {
            border-color: #235cd0;
            box-shadow: 0 0 0 6px rgba(35, 92, 208, 0.08);
          }
        }

        .border-pulse {
          animation: borderPulse 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}


