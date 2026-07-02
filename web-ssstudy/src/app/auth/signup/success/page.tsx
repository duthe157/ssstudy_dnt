"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export default function ActivationSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/"); // Chuyển về trang chủ
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-xl border shadow-sm">
        {/* Header */}
        <div className="bg-blue-600 text-white rounded-t-xl px-6 py-4">
          <h1 className="text-lg font-bold">Đăng ký</h1>
          <p className="text-xs mt-1">
            Tham gia cùng hàng ngàn học sinh đang học tập trên nền tảng chúng tôi
          </p>
        </div>

        <div className="px-6 py-10 text-center">
          {/* Thanh tiến trình (hoàn thành) */}
          {/* <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">1</div>
              <div className="w-16 h-1 bg-blue-600" />
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">2</div>
              <div className="w-16 h-1 bg-blue-600" />
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">3</div>
            </div>
          </div> */}

          <h2 className="text-2xl font-bold text-gray-800">
            Kích hoạt thành công
          </h2>
          <p className="text-gray-600 mt-2">
            Chào mừng đến với <span className="font-semibold text-blue-600">SSStudy</span>
          </p>

          <div className="my-8 flex justify-center">
            <CheckCircle2 className="w-20 h-20 text-blue-600" />
          </div>

          <p className="text-sm text-gray-500">
            Cửa sổ này sẽ đóng lại trong {countdown}s
          </p>
        </div>
      </div>
    </div>
  );
}