"use client";

import { useContext } from "react";
import { useRouter } from "next/navigation";
import { RootContext } from "@/contexts/RootContext";
import { CDN_LINK } from "@/utils/constants";

interface RenewCourseParams {
  /** ID của khóa học sách ID (bookIdCourse.id) */
  item_id: string;
  name: string;
  price: number;
  image?: string;
}

/**
 * Hook dùng chung cho nút gia hạn ở trang "Khóa học của tôi"
 * và trang chi tiết khóa học sách ID.
 */
export function useRenewCourse() {
  const rootContext = useContext(RootContext);
  const router = useRouter();

  const handleRenew = async (params: RenewCourseParams) => {
    if (!rootContext?.handleAddCart) return;

    const imageUrl = params.image
      ? params.image.startsWith("http")
        ? params.image
        : `${CDN_LINK}${params.image}`
      : "/imgs/logo.png";

    try {
      await rootContext.handleAddCart({
        item_id: String(params.item_id || ""),
        name: params.name || "",
        price: Number(params.price) || 0,
        qty: 1,
        type: "EXTEND_BOOKID",
        image: imageUrl,
      });
      router.push("/gio-hang?renewal=1");
    } catch (error) {
      console.error("Error adding renewal to cart:", error);
    }
  };

  return { handleRenew };
}
