import { AppConfig } from "@/types";

export const config: AppConfig = {
  env: "development",
  apiUrl:
    process.env.baseURL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://116.118.47.51:4549",
  cdnUrl: process.env.NEXT_PUBLIC_CDN_URL || "https://cdn.luyenthitiendat.vn/",
  legacyApiUrl:
    process.env.NEXT_PUBLIC_LEGACY_API_URL || "https://api.luyenthitiendat.vn/",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://ssstudy.vn/",
  examUrl: process.env.NEXT_PUBLIC_EXAM_URL || "https://baitap.ssstudy.vn/",
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "https://www.ssstudy.vn",
  appTitle: process.env.NEXT_PUBLIC_APP_NAME || "Web Study App",
  debug: true,
  features: {
    authentication: true,
    darkMode: true,
    analytics: false,
  },
};
