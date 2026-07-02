"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { RootContext } from "@/contexts/RootContext";
import { useContext } from "react";

interface MobilePurchaseButtonsProps {
  itemId: string;
  itemName: string;
  price: number;
  image: string;
  type: "BOOK" | "BOOKID" | "CLASSROOM";
  isAddingToCart?: boolean;
  isBuyingNow?: boolean;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
  isOwned?: boolean;
  courseId?: string;
  hideAddToCart?: boolean;
  showPrice?: boolean;
  buyNowText?: string;
  onActivate?: () => void;
  activateText?: string;
  isInGracePeriod?: boolean;
  isSearchId?: boolean;
}


export default function MobilePurchaseButtons({
  itemId,
  itemName,
  price,
  image,
  type,
  isAddingToCart = false,
  isBuyingNow = false,
  onAddToCart,
  onBuyNow,
  isOwned = false,
  courseId,
  hideAddToCart = false,
  showPrice = true,
  buyNowText = "Mua ngay",
  onActivate,
  activateText = "Kích hoạt",
  isInGracePeriod = false,
  isSearchId = false,
}: MobilePurchaseButtonsProps) {

  const router = useRouter();
  const rootContext = useContext(RootContext);

  const formatPrice = (n: number) =>
    `${new Intl.NumberFormat("vi-VN").format(n)}đ`;

  const handleAddToCart = async () => {
    if (onAddToCart) {
      onAddToCart();
      return;
    }

    if (!rootContext?.handleAddCart || isAddingToCart) return;

    try {
      await rootContext.handleAddCart({
        item_id: itemId,
        name: itemName,
        price,
        qty: 1,
        type,
        image,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const handleBuyNow = async () => {
    if (onBuyNow) {
      onBuyNow();
      return;
    }

    if (!rootContext?.handleAddCart || isBuyingNow) return;

    try {
      await rootContext.handleAddCart({
        item_id: itemId,
        name: itemName,
        price,
        qty: 1,
        type,
        image,
      });
      router.push("/gio-hang");
    } catch (error) {
      console.error("Error buying now:", error);
    }
  };

  const handleStartLearning = () => {
    if (courseId) {
      router.push(`/lesson/${courseId}${isSearchId ? "?isSearchId=true" : ""}`);
    }
  };


  // If user owns the course (CLASSROOM type only), show "Bắt đầu bài học" button
  if (isOwned && type === "CLASSROOM" && courseId) {
    return (
      <div className="mobile-purchase-buttons">
        <button
          onClick={isInGracePeriod ? (onActivate || handleStartLearning) : handleStartLearning}
          className="mobile-btn-start-learning"
          style={isInGracePeriod ? { backgroundColor: "#F03E3E" } : undefined}
        >
          {isInGracePeriod ? "Gia hạn" : "Bắt đầu vào học"}
        </button>
      </div>
    );
  }

  return (
    <div className="mobile-purchase-buttons">
      {onActivate && (
        <button
          onClick={onActivate}
          className="mobile-btn-activate"
        >
          {activateText}
        </button>
      )}
      {!hideAddToCart && !onActivate && (
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className="mobile-btn-add-cart"
        >
          <img src="/icon/ic_gio hang.svg" alt="Giỏ hàng" className="btn-icon" />
          {isAddingToCart ? "Đang thêm..." : "Thêm vào giỏ hàng"}
        </button>
      )}
      <button
        onClick={handleBuyNow}
        disabled={isBuyingNow}
        className="mobile-btn-buy-now"
        style={hideAddToCart ? { flex: 1 } : undefined}
      >
        <div className="mobile-btn-buy-now-content">
          <span>{isBuyingNow ? "Đang xử lý..." : buyNowText}</span>
          {showPrice && (
            <span className="mobile-btn-price">{formatPrice(price)}</span>
          )}
        </div>
      </button>
    </div>
  );
}
