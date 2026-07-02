"use client";

import { useState } from "react";
import CourseLeftbar from "./CourseLeftbar";
import CourseContent from "./CourseContent";
import Breadcrumb from "@/components/ui/breadcrumb";

export default function CoursesPageClient() {
  const [isLeftbarOpen, setIsLeftbarOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const toggleLeftbar = () => {
    setIsLeftbarOpen(!isLeftbarOpen);
  };

  const closeLeftbar = () => {
    setIsLeftbarOpen(false);
  };

  const toggleFilterDrawer = () => {
    setIsFilterDrawerOpen(!isFilterDrawerOpen);
  };

  const closeFilterDrawer = () => {
    setIsFilterDrawerOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-4 xl:py-8 pt-0">
      <div className="relative grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Leftbar */}
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
          `}
          >
            <CourseLeftbar onClose={closeLeftbar} />
          </div>
        </div>

        {/* Main content */}
        <div className="xl:col-span-3 relative z-10">
          <CourseContent
            isFilterDrawerOpen={isFilterDrawerOpen}
            onCloseFilterDrawer={closeFilterDrawer}
            onToggleLeftbar={toggleLeftbar}
            onToggleFilterDrawer={toggleFilterDrawer}
          />
        </div>
      </div>
    </div>
  );
}
