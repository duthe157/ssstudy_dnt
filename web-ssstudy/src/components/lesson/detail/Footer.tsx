import { Button, Typography } from "@/components/ui";
import { useIsTablet } from "@/hooks/useIsTablet";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ChevronFirst,
  ChevronLast,
  Menu,
} from "lucide-react";
import React, { useMemo } from "react";
import { CourseSidebar } from "./CourseSidebar";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useLessonDetail } from ".";
import { useQueryString } from "@/hooks/useQueryString";
import { useSearchParams } from "next/navigation";

type Props = {
  isOpenSlideBar: boolean;
  onToggleSidebar: () => void;
};
export const Footer = ({ onToggleSidebar, isOpenSlideBar }: Props) => {
  const isTablet = useIsTablet();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(false);
  const searchParams = useSearchParams();

  const {
    prevCurrent,
    nextCurrent,
    otherVideos,
    activeVideo,
    goToNext,
    goToPrev,
  } = useLessonDetail();

  const hasPrevVideo = useMemo(() => {
    if (otherVideos.length > 0 && activeVideo) {
      const currentIndex = otherVideos.findIndex(
        (v: any) => v._id === activeVideo._id,
      );
      return currentIndex > 0;
    }
    return false;
  }, [otherVideos, activeVideo]);

  const hasNextVideo = useMemo(() => {
    if (otherVideos.length > 0 && activeVideo) {
      const currentIndex = otherVideos.findIndex(
        (v: any) => v._id === activeVideo._id,
      );
      return currentIndex !== -1 && currentIndex < otherVideos.length - 1;
    }
    return false;
  }, [otherVideos, activeVideo]);

  return (
    <footer
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      className="fixed bottom-0 border-t shadow-2xl left-0 right-0 h-[var(--footer-height)] bg-white flex items-center z-[100]"
    >
      <div className="flex items-center gap-2 sm:gap-4 w-full px-3 sm:px-4">
        <Button
          variant={"outline"}
          size={isMobile ? "sm" : "large"}
          className="border-blue-500 text-blue-500 font-normal shrink-0"
          disabled={!hasPrevVideo && (!prevCurrent || prevCurrent.length === 0)}
          onClick={goToPrev}
        >
          <ChevronFirst className="size-4" />
          <span className="hidden xs:inline">BÀI TRƯỚC</span>
        </Button>
        <Button
          size={isMobile ? "sm" : "large"}
          className="bg-blue-500 text-white font-normal shrink-0"
          onClick={goToNext}
          disabled={!hasNextVideo && !nextCurrent}
        >
          BÀI TIẾP THEO
          <ChevronLast className="size-4" />
        </Button>

        <div className="flex-1" />

        <div className="flex items-center gap-2 shrink-0">
          {!isTablet && (
            <Button
              className="p-2 bg-foundation-50 rounded-full group"
              onClick={onToggleSidebar}
            >
              {isOpenSlideBar ? (
                <ArrowRight className="size-5 text-blue-500 group-hover:text-white" />
              ) : (
                <ArrowLeft className="size-5 text-blue-500 group-hover:text-white" />
              )}
            </Button>
          )}

          {isTablet && (
            <Button
              className="p-2 bg-foundation-50 rounded-full group"
              onClick={() => setIsOpen(!isOpen)}
            >
              {!isOpen ? (
                <Menu className="size-5 text-blue-500 group-hover:text-white" />
              ) : (
                <ArrowRight className="size-5 text-blue-500 group-hover:text-white" />
              )}
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div className="fixed top-0 left-0 h-[calc(100dvh-var(--footer-height))] w-screen z-20">
            <motion.div
              key="backdrop"
              className="absolute h-full w-full bg-black/40 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              key="drawer"
              className="bg-white h-full w-full sm:w-[400px] absolute right-0 top-0 z-10"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
            >
              <CourseSidebar className="h-[calc(100dvh-64px)] p-4" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
};
