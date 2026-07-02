"use client";

import { useRouter } from "next/navigation";
import React, { useCallback, useState, useEffect, useRef } from "react";
import baseHelper from "../helpers/baseHelper";

interface Notification {
  _id: string;
  name: string;
  created_at: string; // Or Date object if parsed
  message_user_id?: string;
  is_read?: boolean;
}

type Props = {
  rootContext: any;
  handlePushRoute?: (url: string, query?: Record<string, string>) => void;
};
const NotificationUi = ({ rootContext, handlePushRoute }: Props) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handlePushRouteDefault = useCallback(
    (path: string, query?: Record<string, string>) => {
      let url = path;
      if (query && Object.keys(query).length > 0) {
        const params = new URLSearchParams(query);
        url += `?${params.toString()}`;
      }
      router.push(url);
    },
    [router]
  );

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        event.target instanceof Node &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button type="button" onClick={toggleDropdown} className="relative">
      <span className="flex flex-row items-center p-2 text-#292929 hover:text-orange-main">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.50763 17.1818H19.4933C19.9097 17.1818 20.1458 16.5379 19.9006 16.169C19.3329 15.3147 18.7814 14.0555 18.7814 12.537L18.8058 10.4599C18.8058 6.33993 15.7588 3 12 3C8.29581 3 5.29296 6.29145 5.29296 10.3517L5.26855 12.537C5.26855 14.0451 4.69736 15.2975 4.10557 16.1514C3.85054 16.5194 4.08602 17.1818 4.50763 17.1818Z"
            fill="#9A9DAC"
          />
          <path
            d="M9.33333 20.0909C10.041 20.6562 10.9755 21 12 21C13.0245 21 13.959 20.6562 14.6667 20.0909M4.50763 17.1818C4.08602 17.1818 3.85054 16.5194 4.10557 16.1514C4.69736 15.2975 5.26855 14.0451 5.26855 12.537L5.29296 10.3517C5.29296 6.29145 8.29581 3 12 3C15.7588 3 18.8058 6.33993 18.8058 10.4599L18.7814 12.537C18.7814 14.0555 19.3329 15.3147 19.9006 16.169C20.1458 16.5379 19.9097 17.1818 19.4933 17.1818H4.50763Z"
            stroke="#9A9DAC"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
        {(rootContext?.totalMessageUnread ?? 0) > 0 && (
          <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] text-white z-10">
            {rootContext?.totalMessageUnread}
          </div>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg p-4 z-50">
        <div className="text-center text-gray-500">
          {rootContext?.notifications &&
          rootContext.notifications.length > 0 ? (
            <div className="max-h-[300px] overflow-y-auto">
              {rootContext.notifications.map(
                (notification: Notification, index: number) => (
                  <div
                    key={index}
                    className="flex flex-col p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => {
                      setIsOpen(false);
                      if (handlePushRoute) {
                        handlePushRoute(`/thong-bao/${notification?._id}`, {
                          message_user_id: notification?.message_user_id || "",
                        });
                      } else {
                        handlePushRouteDefault(`/thong-bao/${notification?._id}`, {
                          message_user_id: notification?.message_user_id || "",
                        });
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setIsOpen(false);
                        if (handlePushRoute) {
                          handlePushRoute(`/thong-bao/${notification?._id}`, {
                            message_user_id: notification?.message_user_id || "",
                          });
                        } else {
                          handlePushRouteDefault(`/thong-bao/${notification?._id}`, {
                            message_user_id: notification?.message_user_id || "",
                          });
                        }
                      }
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2 py-1 text-xs font-medium text-white bg-orange-main rounded">
                        Thông báo
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-700">
                          {notification?.created_at
                            ? baseHelper?.formatDateCustom(
                                notification?.created_at
                              )
                            : null}
                        </span>
                        {!notification?.is_read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-800 line-clamp-2">
                      {notification?.name}
                    </p>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-gray-500">
              <svg
                className="w-12 h-12 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <p className="text-sm">Không có thông báo mới</p>
            </div>
          )}
        </div>
        </div>
      )}
    </div>
  );
};

export default NotificationUi;
