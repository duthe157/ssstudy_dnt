import type { Metadata } from "next";
import Breadcrumbs from "../../../components/ui/breadcrumbs/Breadcrumbs";
import Script from "next/script";

import LiveStreamSideBar from "./LiveStreamSideBar";
import { LiveStreamProvider } from "./LiveStreamContext";
import LiveStreamList from "./LiveStreamList";
import { apiService } from "../../../services/api";

export const metadata: Metadata = {
  title: "Danh sách khóa học | SSStudy",
  description:
    "Khám phá các khóa học chất lượng cao tại SSStudy, nền tảng học tập trực tuyến hàng đầu Việt Nam",
  keywords: "khóa học, học trực tuyến, ssstudy, danh sách khóa học",
  openGraph: {
    title: "Danh sách khóa học | SSStudy",
    description:
      "Khám phá các khóa học chất lượng cao tại SSStudy, nền tảng học tập trực tuyến hàng đầu Việt Nam",
    url: "https://ssstudy.vn/khoa-hoc",
    siteName: "SSStudy",
    locale: "vi_VN",
    type: "website",
  },
};

// Force dynamic rendering to avoid build-time errors with SSL certificates
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Hàm fetch categories
async function getCategories() {
  try {
    const res = (await apiService.post("blog-category/list", {})) as any;
    return res || { data: { records: [] } };
  } catch (err) {
    console.error("Error fetching data", err);
    return { data: { records: [] } };
  }
}

// Hàm fetch và lọc posts
async function fetchBlogsByCategory(category_name: string) {
  try {
    const result = (await apiService.post("blog/list-public", {})) as any;

    if (!result?.data?.records) {
      return [];
    }

    const filtered = result.data.records.filter(
      (item: any) =>
        item.category?.name === category_name && item.status === true
    );

    return filtered || [];
  } catch (err: any) {
    console.error("Error fetching blogs by category", err);
    return [];
  }
}

export default async function LiveStreamSchedule() {
  const alias = "lich-livestream";
  const data = await getCategories();
  const category = data?.data?.records?.find(
    (item: any) => item.alias === alias
  );

  const postLiveStream = category?.name
    ? await fetchBlogsByCategory(category.name)
    : [];

  return (
    <div className="container mx-auto px-4 py-6 lg:py-10">
      <LiveStreamProvider>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar */}
          <aside
            id="sidebar"
            className="
          fixed top-0 left-0 h-full w-64 bg-white lg:bg-transparent z-50 p-1 transform transition-transform duration-300
          -translate-x-full
          lg:static lg:translate-x-0 lg:col-span-1 lg:block
        "
          >
            <button
              id="closeSidebar"
              className="lg:hidden mb-4 text-sm text-gray-600"
            >
              Đóng ✕
            </button>
            <LiveStreamSideBar />
          </aside>

          {/* Main Content */}
          <main className="order-1 lg:order-2 lg:col-span-4">
            <Breadcrumbs />

            {/* Toggle button for mobile/tablet */}
            <button
              id="openSidebar"
              className="lg:hidden mb-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Mở Sidebar
            </button>

            <LiveStreamList posts={postLiveStream} category_alias={alias} />
            {/* Pagination */}
            {/* <div className="mt-8 flex justify-center">
            <LiveStreamPagination />
          </div> */}
          </main>
        </div>

        {/* Overlay */}
        <div
          id="sidebarOverlay"
          className="fixed inset-0 bg-black bg-opacity-50 z-40 hidden lg:hidden"
        ></div>
      </LiveStreamProvider>

      {/* Scripts */}
      <Script id="sidebar-toggle" strategy="afterInteractive">
        {`
          const sidebar = document.getElementById("sidebar");
          const openBtn = document.getElementById("openSidebar");
          const closeBtn = document.getElementById("closeSidebar");
          const overlay = document.getElementById("sidebarOverlay");

          function openSidebar() {
            sidebar.classList.remove("-translate-x-full");
            sidebar.classList.add("translate-x-0");
            overlay.classList.remove("hidden");
          }

          function closeSidebar() {
            sidebar.classList.remove("translate-x-0");
            sidebar.classList.add("-translate-x-full");
            overlay.classList.add("hidden");
          }

          if (openBtn) openBtn.addEventListener("click", openSidebar);
          if (closeBtn) closeBtn.addEventListener("click", closeSidebar);
          if (overlay) overlay.addEventListener("click", closeSidebar);
        `}
      </Script>

      <Script id="change-bg" strategy="afterInteractive">
        {`
          const container = document.querySelector(".min-h-screen.bg-white");
          if (container) {
              container.style.backgroundColor = "hsla(228, 33%, 97%, 1)";
          }

          const nav = document.querySelector("nav");

          if (window.innerWidth >= 1024) {
            nav.style.marginLeft = "3rem"; 
          } else {
            nav.style.marginLeft = "0";   
          }
        `}
      </Script>
    </div>
  );
}
