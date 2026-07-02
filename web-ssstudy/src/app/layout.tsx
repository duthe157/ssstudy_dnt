import { HomeProvider } from "@/contexts/HomeContext";
import "antd/dist/reset.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/global.css";
import { Providers } from "./providers";
import { Suspense } from "react";
import Script from "next/script";
import config from "@/config";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    config.siteUrl?.replace(/\/$/, "") ||
    config.siteUrl ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://ssstudy.vn"
  ),
  title: "SSStudy | Hệ thống giáo dục & Luyện thi toàn diện Online - Offline",
  description: "Ứng dụng học tập trực tuyến",
  icons: {
    icon: [
      { url: "/imgs/ssstudy.png", type: "image/png" },
    ],
    apple: [
      { url: "/imgs/logo.png" },
    ],
    shortcut: ["/favicon.ico"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className} suppressHydrationWarning>
        <HomeProvider>
          <Providers>
            <Suspense fallback={null}>{children}</Suspense>
          </Providers>
        </HomeProvider>


      </body>
    </html>
  );
}
