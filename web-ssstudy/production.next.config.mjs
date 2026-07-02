/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  env: {
    // Match web-user baseURL configuration
    // baseURL: "http://116.118.47.51:4548",
    baseURL: "https://api.luyenthitiendat.vn",
    // baseURL: "https://api.luyenthitiendat.vn",
    // baseURL: "http://localhost:4549",
    REACT_APP_GOOGLE_CLIEN_ID: process.env.REACT_APP_GOOGLE_CLIEN_ID,
  },
  images: {
    domains: [
      'cdn.luyenthitiendat.vn',
      'randomuser.me',
      'placekitten.com',
      'picsum.photos',
      "edmicro.edu.vn"
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 ngày cache
  },
  compress: true,
  eslint: {
    dirs: ["src"],
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Add rewrites to match web-user API proxy setup
  async rewrites() {
    return [
      {
        source: "/exam-word/:path*",
        destination:
          "https://api.luyenthitiendat.vn/exam-word/:path*",
      },
      {
        source: "/exam/:path*",
        destination: "https://api.luyenthitiendat.vn/exam/:path*",
      },
      {
        source:
          "/:alias((?!sach|khoa-hoc|lesson|thi-thu|giao-vien|thong-bao|thanh-toan|gio-hang|account|auth|tim-kiem|ban-tin|cong-dong|diem-review).*)",
        destination: "/tin-tuc/:alias",
      },
      {
        source:
          "/:alias((?!sach|khoa-hoc|lesson|thi-thu|giao-vien|thong-bao|thanh-toan|gio-hang|account|auth|tim-kiem|ban-tin|cong-dong|diem-review).*)/:slug",
        destination: "/tin-tuc/:alias/:slug",
      },
    ];
  },
};

export default nextConfig;
