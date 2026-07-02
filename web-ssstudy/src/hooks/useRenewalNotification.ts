"use client";

import { useState, useEffect, useCallback } from "react";
import { authService } from "@/services/authService";
import { accountService } from "@/services/accountService";
import { storage } from "@/utils/storage";

export interface RenewalCourse {
  id: string;
  name: string;
  price: number;
  image: string;
  /** Ngày hết hạn gia hạn */
  expiredDate: Date;
  /** true = đã qua ngày hết hạn gia hạn (today > expiredDate) */
  isExpired: boolean;
}

const STORAGE_KEY = "renewal_popup_shown";

/** Lấy key lưu trạng thái popup theo userId + ngày */
function getShownKey(userId: string, courseId: string, dateStr: string) {
  return `${userId}__${courseId}__${dateStr}`;
}

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/** Đọc map đã hiển thị từ localStorage */
function getShownMap(): Record<string, boolean> {
  try {
    return storage.getItem(STORAGE_KEY) || {};
  } catch {
    return {};
  }
}

/** Lưu map đã hiển thị vào localStorage */
function setShownMap(map: Record<string, boolean>) {
  try {
    storage.setItem(STORAGE_KEY, map);
  } catch {
    /* noop */
  }
}

/**
 * Đánh dấu popup đã hiển thị cho khóa học hôm nay
 */
export function markPopupShown(userId: string, courseId: string) {
  const map = getShownMap();
  map[getShownKey(userId, courseId, getTodayStr())] = true;
  setShownMap(map);
}

/**
 * Đánh dấu khóa học đã gia hạn thành công → xóa tất cả entry của khóa học này
 */
export function markCourseRenewed(userId: string, courseId: string) {
  const map = getShownMap();
  // Xóa tất cả ngày của khóa học này
  Object.keys(map).forEach((k) => {
    if (k.startsWith(`${userId}__${courseId}__`)) {
      delete map[k];
    }
  });
  // Đánh dấu "đã gia hạn" vĩnh viễn bằng key đặc biệt
  map[`${userId}__${courseId}__renewed`] = true;
  setShownMap(map);
}

function wasRenewed(userId: string, courseId: string): boolean {
  const map = getShownMap();
  return !!map[`${userId}__${courseId}__renewed`];
}

function wasShownToday(userId: string, courseId: string): boolean {
  const map = getShownMap();
  return !!map[getShownKey(userId, courseId, getTodayStr())];
}

export function useRenewalNotification() {
  const [courses, setCourses] = useState<RenewalCourse[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const checkAndShow = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (!authService.isLoggedIn()) return;

    const userId = authService.getUserId();
    if (!userId) return;

    try {
      // 1. Gọi API lấy danh sách cảnh báo gia hạn
      const res = await accountService.getRenewalNotifications();
      const notificationList = res?.data?.data || res?.data || [];

      if (!Array.isArray(notificationList)) return;

      const qualifying: RenewalCourse[] = [];

      for (const item of notificationList) {
        // Lấy thông tin từ cấu trúc mới
        const userBookDetail = item?.userBookDetail || item;

        // RULE 1: Nếu khóa học không cho gia hạn → không hiển thị popup
        const allowExtend =
          item?.allow_extend ?? userBookDetail?.allow_extend ?? true;
        if (allowExtend === false) continue;

        const courseId =
          item?.bookIdCourse?.id || item?.bookIdCourse?._id || item?._id || "";
        const courseName = item?.bookIdCourse?.name || "Khóa học";

        // RULE 2: Nếu hết lượt gia hạn (extendTimes = 0) → không hiển thị popup gia hạn
        const extendTimes =
          item?.extend_times ??
          userBookDetail?.extend_times ??
          item?.extendTimes ??
          userBookDetail?.extendTimes ??
          1;
        if (extendTimes === 0) continue;

        // final_expired là ngày gia hạn cuối cùng (Hết 23:59:59 ngày này là hết hạn hoàn toàn)
        const finalExpiredStr = item?.final_expired || item?.exprired_date;

        if (!courseId || !finalExpiredStr) continue;

        // RULE 3: Nếu học sinh gia hạn thành công → không hiển thị nữa
        if (wasRenewed(userId, courseId)) continue;

        // RULE 4: Chỉ hiển thị 1 lần / ngày / khóa học
        // if (wasShownToday(userId, courseId)) continue;

        // RULE 5 & 6: Dùng days_left từ API — không tự tính
        // days_left >= 1 && <= 3: sắp hết hạn → warning
        // days_left === -1: đúng ngày hôm sau ngày hết hạn → expired
        // days_left <= -2 hoặc > 3: không hiển thị
        const daysLeft = item?.days_left ?? null;
        if (daysLeft === null) continue;

        const isExpiredPopup = daysLeft === 0;
        const isWarningPopup = daysLeft >= 1 && daysLeft <= 3;

        if (isExpiredPopup || isWarningPopup) {
          qualifying.push({
            id: courseId,
            name: courseName,
            price: 0,
            image: "",
            expiredDate: new Date(finalExpiredStr),
            isExpired: isExpiredPopup,
          });
        }
      }

      if (qualifying.length > 0) {
        setCourses(qualifying);
        setIsOpen(true);
        // Đánh dấu đã hiển thị hôm nay cho từng khóa học
        qualifying.forEach((c) => markPopupShown(userId, c.id));
      }
    } catch (error) {
      console.warn("[RenewalHook] Error checking notifications:", error);
    }
  }, []);

  useEffect(() => {
    checkAndShow();
  }, [checkAndShow]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return { courses, isOpen, handleClose };
}
