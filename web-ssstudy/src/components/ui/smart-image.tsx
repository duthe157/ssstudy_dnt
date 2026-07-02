"use client";

import Image, { ImageProps } from "next/image";
import { useImageRatio } from "@/hooks/useImageRatio";
import { useEffect } from "react";

interface SmartImageProps extends Omit<ImageProps, "onLoadingComplete"> {
  onLoadingComplete?: (img: HTMLImageElement) => void;
}

export function SmartImage({
  src,
  alt,
  className = "",
  style,
  onLoadingComplete,
  fill,
  ...props
}: SmartImageProps) {
  const { imageStyle, handleImageLoad, resetStyle } = useImageRatio();

  useEffect(() => {
    resetStyle();
  }, [src, resetStyle]);

  const handleLoad = (img: HTMLImageElement) => {
    handleImageLoad(img.naturalWidth, img.naturalHeight);
    if (onLoadingComplete) {
      onLoadingComplete(img);
    }
  };

  // Merge styles: nếu có fill thì không cần width/height từ imageStyle
  const mergedStyle = fill
    ? { ...imageStyle, ...style, width: undefined, height: undefined }
    : { ...imageStyle, ...style };

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      style={mergedStyle}
      onLoadingComplete={handleLoad}
      fill={fill}
      {...props}
    />
  );
}
