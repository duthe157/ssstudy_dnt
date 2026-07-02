"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { notificationService, NotificationItem } from "@/services/notificationService";
import baseHelper from "@/components/helpers/baseHelper";
import Breadcrumb from "@/components/ui/breadcrumb";

interface NotificationDetailClientProps {
  notificationId: string;
  messageUserId?: string;
}

export default function NotificationDetailClient({
  notificationId,
  messageUserId,
}: NotificationDetailClientProps) {
  const router = useRouter();
  const [notification, setNotification] = useState<NotificationItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotification = async () => {
      if (!notificationId) {
        setError("ID thông báo không hợp lệ");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);



        // Thử lấy từ API detail trước
        try {
          const response = await notificationService.getMessageDetail(notificationId, messageUserId || "");
         
          
          if (response?.data) {
            setNotification(response.data);
            setLoading(false);
            return;
          }
        } catch (detailError: any) {
          console.warn("Detail endpoint error:", detailError);
          // Nếu endpoint không tồn tại (404), thử fallback
          if (detailError?.response?.status !== 404) {
            throw detailError;
          }
        }

        // Fallback: Lấy từ danh sách thông báo
      
        const listResponse = await notificationService.getMyMessages();
     
        
        const records = listResponse?.data?.records || [];
        const foundNotification = records.find(
          (item) => item._id === notificationId
        );

        if (foundNotification) {
         
          setNotification(foundNotification);
        } else {
          console.error("Notification not found in list. Available IDs:", records.map(r => r._id));
          setError("Không tìm thấy thông báo");
        }
      } catch (err: any) {
        console.error("Error fetching notification:", err);
        const errorMessage = err?.response?.data?.message || err?.message || "Có lỗi xảy ra khi tải thông báo";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchNotification();
  }, [notificationId, messageUserId]);

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#F5F6FA" }}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Breadcrumb Skeleton */}
          <div className="bg-blue-50 px-4 py-3 rounded mb-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-8 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#F5F6FA" }}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#F5F6FA" }}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 mb-4">Không tìm thấy thông báo</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen  !p-0">
      <div className="w-full">
        {/* Breadcrumb */}
        <div className="w-full px-4 py-3 rounded mb-6">
          <div className="max-w-4xl mx-auto">
            <Breadcrumb
              items={[
                { label: "Trang chủ", href: "/" },
                { label: "Thông báo", href: "#" },
                { label: notification.name || "Chi tiết thông báo" },
              ]}
            />
          </div>
        </div>

        {/* Main Content Card */}
        <div className="w-full px-4 pb-6">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              {notification.name || "Không có tiêu đề"}
            </h1>

            {/* Metadata Row */}
            <div className="flex items-center mb-6 pb-6 gap-x-2">
              {/* Date with icon */}
              <div className="flex items-center text-sm text-gray-600">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {notification.created_at ? (
                  <span>{baseHelper?.formatDateCustom(notification.created_at)}</span>
                ) : (
                  <span>Chưa có ngày</span>
                )}
              </div>

              {/* Link Button */}
              <button className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors">
                {notification.buttons && (
                  <Link href={notification.buttons[0].link} target="_blank">
                      {notification.buttons[0].title ? notification.buttons[0].title : "Tiêu đề liên kết"} 
                  </Link>
                )}
              </button>
            </div>

            {/* Content */}
            <div className="prose max-w-none">
              {(notification as any)?.content && (
                <div
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: (notification as any).content,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

