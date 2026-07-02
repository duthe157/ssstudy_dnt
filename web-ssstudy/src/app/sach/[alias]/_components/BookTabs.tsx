"use client";

import { useState } from "react";
import { BookDetailData } from "./types";
import TeacherTabContent from "@/components/common/TeacherTabContent";

interface Teacher {
  _id?: string;
  fullname?: string;
  avatar?: string;
  profile_pic?: string;
  alias?: string;
  description?: string;
  content?: string;
  featured_stats_box?: any;
  featured_text_box?: any;
  link_fb?: string;
  total_classroom?: number;
  total_student?: number;
  [key: string]: any;
}

interface BookTabsProps {
  book: BookDetailData;
  teacher?: Teacher | null;
}

export default function BookTabs({ book, teacher }: BookTabsProps) {
  const [activeTab, setActiveTab] = useState("intro");

  const tabs = [
    {
      id: "intro",
      label: "Giới thiệu",
    },
    {
      id: "teacher",
      label: "Giáo viên",
    },
  ];

  return (
    <div className="book-tabs">
      {/* Tab Headers */}
      <div className="tabs-header">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tabs-content">
        {activeTab === "intro" && (
          <div
            className="tab-panel active"
            dangerouslySetInnerHTML={{
              __html: book.tabContent.introduction || book.content,
            }}
          />
        )}
        {activeTab === "teacher" && (
          <div className="tab-panel active">
            <TeacherTabContent teacher={teacher} />
          </div>
        )}
      </div>
    </div>
  );
}
