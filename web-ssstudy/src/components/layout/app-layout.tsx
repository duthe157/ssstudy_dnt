import React, { Suspense, useContext } from "react";
import { usePathname } from "next/navigation";
import { RootContext } from "@/contexts/RootContext";
import DynamicHeader from "./DynamicHeader";
import Footer from "./Footer";
import MobileBottomNav from "./mobile-bottom-nav";
import MobileTopMenu from "@components/layout/MobileTopMenu";
import ContactMenu from "@components/layout/ContactMenu";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  // Sử dụng rootContext từ context
  const rootContext = useContext(RootContext);

  const pathname = usePathname();
  const isExamRoute = pathname?.startsWith("/thi-thu/word-exam/");
  const isResultRoute = pathname?.startsWith("/thi-thu/result/");
  const isLessonRoute = pathname?.startsWith("/lesson/");
  const isNotificationRoute = pathname?.startsWith("/thong-bao/");
  const isReadyPage = pathname?.includes("/ready") || false;
  const isExplanationRoute = pathname?.includes("/loi-giai") || false;
  const showChrome =
    (!isExamRoute && !isLessonRoute && !isResultRoute) || isReadyPage; // header/footer/nav when not doing exam or lesson

  const isAboutMySelfPage = pathname?.startsWith("/ve-chung-toi");
  const isCourseOrBookPage =
    pathname?.startsWith("/khoa-hoc") ||
    pathname?.startsWith("/sach") ||
    pathname?.startsWith("/tim-kiem") ||
    pathname?.startsWith("/tai-lieu");

  // Check if it's a detail page (course or book detail)
  const isDetailPage =
    (pathname?.match(/^\/khoa-hoc\/[^/]+$/) &&
      !pathname?.includes("/khoa-hoc/page")) ||
    (pathname?.match(/^\/sach\/[^/]+$/) && !pathname?.includes("/sach/page"));

  // Mặc định giá trị rootContext cho Header khi không tìm thấy context
  const contextValue = rootContext || {
    cartCount: 0,
    notifications: [],
    isLogin: false,
    totalMessageUnread: 0,
    hideMobileNav: false,
    setHideMobileNav: () => {},
    handleLogout: () => {},
    handleAddCart: async () => {},
  };

  return (
    <div className={`min-h-screen bg-white flex flex-col app-layout ${isLessonRoute ? "is-lesson" : ""} ${isExamRoute ? "is-exam" : ""} ${isResultRoute ? "is-result" : ""}`}>
      {showChrome && (
        <div className="max-[1439px]:hidden">
          <Suspense fallback={<div className="hidden xl:block header-menu" />}>
            <DynamicHeader rootContext={contextValue} />
          </Suspense>
        </div>
      )}
      {showChrome && (
        <div className="min-[1440px]:hidden">
          <Suspense fallback={null}>
            <MobileTopMenu rootContext={contextValue} />
          </Suspense>
        </div>
      )}
      <main
        className={`${
          isExamRoute ||
          isResultRoute ||
          isLessonRoute ||
          isAboutMySelfPage ||
          isCourseOrBookPage ||
          isNotificationRoute
            ? "flex-grow w-full"
            : "flex-grow max-w-7xl mx-auto w-full"
        } ${showChrome ? "pt-12 min-[1440px]:pt-0" : ""}`}
      >
        <div
          className={`${
            (isExamRoute ||
              isResultRoute ||
              isLessonRoute ||
              isAboutMySelfPage ||
              isCourseOrBookPage ||
              isNotificationRoute) &&
            !isReadyPage
              ? "p-0"
              : "px-4 py-6 sm:px-0 pb-20 lg:pb-6"
          }`}
        >
          {children}
        </div>
      </main>
      {showChrome && <Footer />}
      {/* Mobile bottom nav: show on mobile, hide on exam doing and explanation screens */}
      {showChrome && !isExplanationRoute && <MobileBottomNav />}
      {showChrome && <ContactMenu />}
    </div>
  );
}
