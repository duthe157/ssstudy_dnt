"use client";

import {
  HTMLAttributes,
  ImgHTMLAttributes,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";

interface ResponsiveImageFrameProps {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  imgProps?: Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    "src" | "alt" | "className" | "onLoad"
  >;
  containerProps?: Omit<HTMLAttributes<HTMLDivElement>, "className">;
}

// Tỉ lệ chuẩn: 279:210
const STANDARD_RATIO = 279 / 210; // 1.32857142857
// Cho phép sai số ±1% để đảm bảo chính xác
const TOLERANCE = 0.01;
const MIN_RATIO = STANDARD_RATIO * (1 - TOLERANCE); // ~1.315
const MAX_RATIO = STANDARD_RATIO * (1 + TOLERANCE); // ~1.342

export function ResponsiveImageFrame({
  src,
  alt,
  className,
  imageClassName,
  imgProps,
  containerProps,
}: ResponsiveImageFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [objectFit, setObjectFit] = useState<"cover" | "contain">("contain");
  const [imageStyle, setImageStyle] = useState<React.CSSProperties>({
    width: "100%",
    height: "100%",
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
    objectPosition: "center",
  });

  const mergedClassName = useMemo(() => {
    if (!className) return "responsive-image-frame";
    return `responsive-image-frame ${className}`;
  }, [className]);

  const mergedImageClassName = useMemo(() => {
    if (!imageClassName) return "responsive-image-frame__image";
    return `responsive-image-frame__image ${imageClassName}`;
  }, [imageClassName]);

  // Check tỉ lệ ảnh khi load
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    if (naturalWidth > 0 && naturalHeight > 0) {
      const imageRatio = naturalWidth / naturalHeight;

      // Nếu tỉ lệ đúng (trong khoảng cho phép) thì dùng cover để hiển thị đẹp nhất
      // Nếu không đúng thì dùng contain để không mất nội dung (có khoảng trống)
      if (imageRatio >= MIN_RATIO && imageRatio <= MAX_RATIO) {
        // Tỉ lệ đúng → dùng cover để full khung, perfect fit
        setObjectFit("cover");
        setImageStyle({
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
        });
      } else {
        // Tỉ lệ không đúng → dùng contain để không mất nội dung
        // Nếu ảnh cao hơn (ratio nhỏ) → thừa 2 bên
        // Nếu ảnh rộng hơn (ratio lớn) → thừa trên dưới
        setObjectFit("contain");
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
  };

  // Reset khi src thay đổi
  useEffect(() => {
    setObjectFit("contain");
    setImageStyle({
      width: "100%",
      height: "100%",
      maxWidth: "100%",
      maxHeight: "100%",
      objectFit: "contain",
      objectPosition: "center",
    });
  }, [src]);

  return (
    <div ref={frameRef} className={mergedClassName} {...containerProps}>
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className={mergedImageClassName}
        style={imageStyle}
        onLoad={handleImageLoad}
        {...imgProps}
      />
    </div>
  );
}
