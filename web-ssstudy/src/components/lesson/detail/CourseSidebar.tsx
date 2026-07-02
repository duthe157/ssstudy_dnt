"use client";

import { ScrollArea, Typography } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/cn";
import { Search } from "lucide-react";
import { CourseList } from "./CourseList";
import { Subjects } from "./Subjects";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useLessonDetail } from ".";

type Props = {
  className?: string;
};
export const CourseSidebar = ({ className }: Props) => {
  const [activeGroupTab, setActiveGroupTab] = useState<string>("");
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const searchParams = useSearchParams();
  const chapterIdFromUrl = searchParams?.get("chapterId") as string;
  const { chaptersData } = useLessonDetail();
  const hasSyncedGroupTab = useRef(false);

  // Tự động chọn đúng tab nhóm chứa bài học khi navigate từ trang chi tiết khóa học
  useEffect(() => {
    if (!chapterIdFromUrl || !chaptersData || hasSyncedGroupTab.current) return;

    const matchedChapter = chaptersData.find(
      (chapter) => chapter._id === chapterIdFromUrl
    );

    if (matchedChapter) {
      const groupId = (matchedChapter as any).group_id;
      setActiveGroupTab(groupId ? String(groupId) : "undefined");
      hasSyncedGroupTab.current = true;
    }
  }, [chapterIdFromUrl, chaptersData]);

  return (
    <ScrollArea
      className={cn(
        "h-[calc(100vh-var(--header-height)-var(--footer-height))] p-6",
        "[&_[data-radix-scroll-area-viewport]>div:first-child]:!block",
        className
      )}
    >
      <div className={cn("flex flex-col gap-4 pb-4 lg:pb-0")}>
        <Typography variant={"sm16"} className="text-blue-500 font-bold">
          Nội dung khóa học
        </Typography>
        <div className="sticky top-1 z-20 relative">
          <Input
            className="pr-9 rounded-full pl-4"
            placeholder="Tìm kiếm đề thi - bài học ở đây"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <Search className="absolute top-1/2 -translate-y-1/2 right-[10px] size-5 text-foundation-200" />
        </div>
        <div className="min-w-0">
          <Subjects
            activeGroupTab={activeGroupTab}
            setActiveGroupTab={setActiveGroupTab}
          />
        </div>
        <CourseList
          activeGroupTab={activeGroupTab}
          searchKeyword={searchKeyword}
        />
      </div>
    </ScrollArea>
  );
};
