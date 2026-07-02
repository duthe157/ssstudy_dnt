"use client";

import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog";
import type { RenewalCourse } from "@/hooks/useRenewalNotification";

interface Props {
  courses: RenewalCourse[];
  isOpen: boolean;
  onClose: () => void;
}

function formatDate(date: Date) {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

export function RenewalNotificationPopup({ courses, isOpen, onClose }: Props) {
  if (!courses.length) return null;

  const allExpired = courses.every((c) => c.isExpired);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-[480px] p-0 overflow-hidden"
        showCloseButton={false}
        onBackClick={onClose}
      >
        {/* Header */}
        <div className="bg-[#235CD0] px-6 py-4 flex items-center justify-between">
          <DialogTitle className="text-white font-bold text-base tracking-wide m-0">
            THÔNG BÁO
          </DialogTitle>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Đóng"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-3">
          {allExpired ? (
            <>
              <div className="space-y-2 text-[14px] text-gray-800 leading-relaxed">
                {courses.map((course) => (
                  <p key={course.id}>
                    Khóa học sách ID {" "}
                    <span className="font-bold">{course.name}</span> đã hết hạn
                    gia hạn.
                  </p>
                ))}
              </div>
              <p className="text-[14px] text-gray-700 leading-relaxed">
                Học sinh có thể đăng ký lại để học tiếp các khóa học trong sách
                nếu có nhu cầu.
              </p>
            </>
          ) : (
            <>
              <div className="space-y-2 text-[14px] text-gray-800 leading-relaxed">
                {courses
                  .filter((c) => !c.isExpired)
                  .map((course) => (
                    <p key={course.id}>
                      Khóa học sách ID {" "}
                      <span className="font-bold">{course.name}</span> sẽ hết
                      hạn gia hạn vào ngày{" "}
                      <span className="font-bold text-[#F03E3E]">
                        {formatDate(course.expiredDate)}
                      </span>
                      .
                    </p>
                  ))}
                {courses
                  .filter((c) => c.isExpired)
                  .map((course) => (
                    <p key={course.id}>
                      Khóa học sách ID {" "}
                      <span className="font-bold">{course.name}</span> đã hết
                      hạn gia hạn.
                    </p>
                  ))}
              </div>
              <p className="text-[14px] text-gray-700 leading-relaxed">
                Vui lòng gia hạn để tiếp tục học tập không gián đoạn.
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
