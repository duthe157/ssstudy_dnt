"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export default function VerifyPhonePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = React.useMemo(
    () => searchParams?.get("email") ?? "",
    [searchParams]
  );
  const phone = React.useMemo(
    () => searchParams?.get("phone") ?? "",
    [searchParams]
  );

  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const inputsRef = useRef<HTMLInputElement[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [resendCountdown, setResendCountdown] = useState(60);
  const canResend = resendCountdown === 0;

  useEffect(() => {
    setResendCountdown(60);
  }, []);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const id = setInterval(() => setResendCountdown((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [resendCountdown]);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[index] = digit || "";
      return next;
    });
    if (digit) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index]) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft") inputsRef.current[index - 1]?.focus();
    if (e.key === "ArrowRight") inputsRef.current[index + 1]?.focus();
  };

  const handleResend = () => {
    if (!canResend) return;
    setResendCountdown(60);
    toast.info("Đã gửi lại mã xác thực.");
  };

  const handleConfirm = async () => {
    const code = otp.join("");
    if (code.length !== 4) {
      toast.error("Vui lòng nhập đủ 4 số của mã xác thực.");
      return;
    }
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800)); // Giả lập gọi API
      toast.success("Xác thực thành công!");
      
      // Chuyển hướng đến trang thành công
      router.push("/auth/signup/success");

    } catch (e: any) {
      toast.error("Xác thực thất bại. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-xl border shadow-sm">
        {/* Header xanh giống ảnh */}
        <div className="bg-blue-600 text-white rounded-t-xl px-6 py-4">
          <h1 className="text-lg font-bold">Đăng ký</h1>
          <p className="text-xs mt-1">
            Tham gia cùng hàng ngàn học sinh đang học tập trên nền tảng chúng
            tôi
          </p>
        </div>

        <div className="px-6 py-6">
          {/* Thanh tiến trình 1-2-3 (bước 2) */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                1
              </div>
              <div className="w-16 h-1 bg-blue-600" />
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                2
              </div>
              <div className="w-16 h-1 bg-gray-200" />
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-semibold">
                3
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-center text-gray-800">
            Xác thực số điện thoại
          </h2>
          <p className="text-center text-gray-600 mt-2">
            Để sử dụng tài khoản{" "}
            <span className="font-semibold">{email || "ABC@gmail.com"}</span>.
            Hãy nhập vào mã kích hoạt mà{" "}
            <span className="font-semibold">SSStudy</span> đã gửi tới cho bạn
            theo số di động{" "}
            <span className="font-semibold">{phone || "0123456789"}</span>
          </p>

          {/* OTP inputs */}
          <div className="mt-6 flex items-center justify-center gap-4">
            {otp.map((digit, idx) => (
              <Input
                key={idx}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                ref={(el) => {
                  if (el) inputsRef.current[idx] = el;
                }}
                inputMode="numeric"
                maxLength={1}
                className="w-14 h-14 text-2xl text-center font-semibold rounded-lg border-gray-300"
                placeholder=""
              />
            ))}
          </div>

          {/* Resend */}
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend}
              className={`text-sm ${
                canResend ? "text-blue-600" : "text-gray-400"
              }`}
            >
              {canResend ? "Gửi lại mã" : `Gửi lại mã (${resendCountdown}s)`}
            </button>
          </div>

          {/* Confirm button */}
          <div className="mt-5">
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xác nhận...
                </>
              ) : (
                "XÁC NHẬN"
              )}
            </Button>
          </div>

          {/* Change email/phone */}
          <p className="text-center text-sm text-gray-600 mt-4">
            Click{" "}
            <Link href="/auth/signup" className="text-blue-600 font-medium">
              Vào đây
            </Link>{" "}
            để đổi email đăng ký, số điện thoại.
          </p>
        </div>
      </div>
    </div>
  );
}
