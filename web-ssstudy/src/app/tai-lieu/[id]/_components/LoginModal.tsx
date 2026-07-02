"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog";
import { Lock } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectUrl: string;
}

export default function LoginModal({ isOpen, onClose, redirectUrl }: LoginModalProps) {
  const handleLogin = () => {
    // Chuyển sang sử dụng path /auth/signin và chỉ lấy phần path + search của URL để làm redirect
    const relativeUrl = typeof window !== "undefined" ? window.location.pathname + window.location.search : "";
    window.location.href = `/auth/signin?redirect=${encodeURIComponent(relativeUrl)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[900px] w-full p-0 overflow-hidden rounded-2xl border-none">
        <div className="p-8 flex flex-col items-center text-center">
          {/* Lock Icon */}
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-[#EE423E]" fill="currentColor" />
            </div>
          </div>

          {/* Title */}
          <DialogTitle className="text-3xl font-bold text-[#1F2937] mb-4">
            Thông báo
          </DialogTitle>

          {/* Description */}
          <p className="text-[#4B5563] text-lg mb-8">
            Đăng nhập để xem tiếp tài liệu!
          </p>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-full bg-[#4ADE40] hover:bg-[#42C93A] text-white font-bold py-4 rounded-xl transition-colors text-lg active:scale-[0.98]"
          >
            Đăng nhập
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}