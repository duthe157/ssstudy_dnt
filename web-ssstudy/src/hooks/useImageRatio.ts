"use client";

import { useState, useCallback } from "react";

// Tỉ lệ chuẩn: 279:210
const STANDARD_RATIO = 279 / 210; // 1.32857142857
// Cho phép sai số ±1% để đảm bảo chính xác
const TOLERANCE = 0.01;
const MIN_RATIO = STANDARD_RATIO * (1 - TOLERANCE); // ~1.315
const MAX_RATIO = STANDARD_RATIO * (1 + TOLERANCE); // ~1.342

interface ImageStyle {
  width: string;
  height: string;
  maxWidth?: string;
  maxHeight?: string;
  objectFit: "cover" | "contain";
  objectPosition: string;
}

export function useImageRatio() {
  const [imageStyle, setImageStyle] = useState<ImageStyle>({
    width: "100%",
    height: "100%",
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
    objectPosition: "center",
  });

  const handleImageLoad = useCallback(
    (naturalWidth: number, naturalHeight: number) => {
      if (naturalWidth > 0 && naturalHeight > 0) {
        const imageRatio = naturalWidth / naturalHeight;

        // Nếu tỉ lệ đúng (trong khoảng cho phép) thì dùng cover để hiển thị đẹp nhất
        // Nếu không đúng thì dùng contain để không mất nội dung (có khoảng trống)
        if (imageRatio >= MIN_RATIO && imageRatio <= MAX_RATIO) {
          // Tỉ lệ đúng → dùng cover để full khung, perfect fit
          setImageStyle({
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          });
        } else {
          // Tỉ lệ không đúng → dùng contain để không mất nội dung
          setImageStyle({
            width: "100%",
            height: "100%",
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            objectPosition: "center",
          });
        }
      }
    },
    []
  );

  const resetStyle = useCallback(() => {
    setImageStyle({
      width: "100%",
      height: "100%",
      maxWidth: "100%",
      maxHeight: "100%",
      objectFit: "contain",
      objectPosition: "center",
    });
  }, []);

  return {
    imageStyle,
    handleImageLoad,
    resetStyle,
  };
}
