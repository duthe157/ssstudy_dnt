"use client";

import { useEffect } from "react";

export default function LessonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Ẩn thanh scroll cho cả html và body khi vào trang lesson
    document.documentElement.style.overflowY = "hidden";
    document.body.style.overflowY = "hidden";

    // Khôi phục lại khi rời khỏi trang
    return () => {
      document.documentElement.style.overflowY = "";
      document.body.style.overflowY = "";
    };
  }, []);

  return <>{children}</>;
}

