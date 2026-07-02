"use client";

import Image, { ImageProps } from "next/image";
import { optimizeImageUrl } from "@/utils/image-optimizer";
import { useState } from "react";

interface OptimizedImageProps extends Omit<ImageProps, "src"> {
  src: string;
  width?: number;
  height?: number;
  optimizeWidth?: number;
  optimizeHeight?: number;
  optimizeQuality?: number;
  fallbackSrc?: string;
}

/**
 * Component OptimizedImage - Tối ưu hóa ảnh tự động
 * 
 * @example
 * ```tsx
 * <OptimizedImage
 *   src={item.image}
 *   alt="Course image"
 *   fill
 *   optimizeWidth={560}
 *   optimizeQuality={85}
 *   className="object-cover"
 * />
 * ```
 */
export function OptimizedImage({
  src,
  alt,
  optimizeWidth,
  optimizeHeight,
  optimizeQuality = 85,
  fallbackSrc = "/images/placeholder.png",
  className,
  loading = "lazy",
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(
    optimizeImageUrl(src, {
      width: optimizeWidth,
      height: optimizeHeight,
      quality: optimizeQuality,
    })
  );
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && fallbackSrc) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      className={className}
      loading={loading}
      quality={optimizeQuality}
      onError={handleError}
    />
  );
}

