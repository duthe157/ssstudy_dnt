"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Breadcrumb from "@/components/ui/breadcrumb";
import BookLeftbar from "@/app/sach/_components/BookLeftbar";
import CourseLeftbar from "@/app/khoa-hoc/_components/CourseLeftbar";

// Dynamically import with no SSR to avoid hydration issues
const BookSearchContent = dynamic(() => import("./BookSearchContent"), {
  ssr: false,
});
const CourseSearchContent = dynamic(() => import("./CourseSearchContent"), {
  ssr: false,
});

export default function SearchPageClient() {
  const [activeTab, setActiveTab] = useState<"CLASSROOM" | "BOOK">("CLASSROOM");
  const [isLeftbarOpen, setIsLeftbarOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const keyword = searchParams?.get("keyword") || "";
  const typeParam = searchParams?.get("type") || "CLASSROOM";

  // Set active tab based on URL parameter
  useEffect(() => {
    if (typeParam === "BOOK") {
      setActiveTab("BOOK");
    } else {
      setActiveTab("CLASSROOM");
    }
  }, [typeParam]);

  const toggleLeftbar = () => {
    setIsLeftbarOpen(!isLeftbarOpen);
  };

  const closeLeftbar = () => {
    setIsLeftbarOpen(false);
  };

  const handleTabChange = (tab: "CLASSROOM" | "BOOK") => {
    setActiveTab(tab);
    // Update URL with type parameter
    const newSearchParams = new URLSearchParams(searchParams?.toString());
    newSearchParams.set("type", tab);
    router.push(`/tim-kiem?${newSearchParams.toString()}`);
  };

  return (
    <div
      className="container mx-auto px-4 py-4 xl:py-8 pt-0"
      style={{ backgroundColor: "#F5F6FA" }}
    >
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Tìm kiếm", href: "/tim-kiem" },
          { label: activeTab === "CLASSROOM" ? "Khóa học" : "Sách" },
        ]}
      />

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => handleTabChange("CLASSROOM")}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              activeTab === "CLASSROOM"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Khóa học
          </button>
          <button
            onClick={() => handleTabChange("BOOK")}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              activeTab === "BOOK"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Sách
          </button>
        </div>
      </div>

      <div className="relative grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Leftbar - Desktop: luôn hiển thị, Mobile/Tablet: toggle */}
        <div
          className={`
          xl:col-span-1 xl:block
          ${isLeftbarOpen ? "block" : "hidden"}
          xl:relative absolute inset-0 z-50 xl:z-auto
        `}
        >
          {/* Overlay cho mobile/tablet */}
          {isLeftbarOpen && (
            <div
              className="xl:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={closeLeftbar}
            />
          )}

          {/* Leftbar content */}
          <div
            className={`
            xl:relative xl:transform-none xl:transition-none
            fixed left-0 top-0 h-full w-80 max-w-[80vw] z-50
            transform transition-transform duration-300 ease-in-out
            ${
              isLeftbarOpen
                ? "translate-x-0"
                : "-translate-x-full xl:translate-x-0"
            }
            [&>div]:shadow-none
          `}
          >
            {activeTab === "CLASSROOM" ? (
              <CourseLeftbar onClose={closeLeftbar} basePath="/tim-kiem" />
            ) : (
              <BookLeftbar onClose={closeLeftbar} basePath="/tim-kiem" />
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="xl:col-span-3 relative z-10">
          {activeTab === "CLASSROOM" ? (
            <CourseSearchContent
              isLeftbarOpen={isLeftbarOpen}
              toggleLeftbar={toggleLeftbar}
              closeLeftbar={closeLeftbar}
            />
          ) : (
            <BookSearchContent
              isLeftbarOpen={isLeftbarOpen}
              toggleLeftbar={toggleLeftbar}
              closeLeftbar={closeLeftbar}
            />
          )}
        </div>
      </div>
    </div>
  );
}
