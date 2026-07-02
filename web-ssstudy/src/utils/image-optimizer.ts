/**
 * Utility để tối ưu hóa URL ảnh
 * Thêm query parameters để resize/compress ảnh từ CDN
 */

interface ImageOptimizeOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "png";
}

/**
 * Tối ưu hóa URL ảnh bằng cách thêm query parameters
 * @param url - URL ảnh gốc
 * @param options - Các tùy chọn tối ưu hóa
 * @returns URL ảnh đã được tối ưu hóa
 */
export function optimizeImageUrl(
  url: string,
  options: ImageOptimizeOptions = {}
): string {
  if (!url) return "";

  const { width, height, quality = 80, format = "webp" } = options;

  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);

    // Thêm các query parameters để CDN tối ưu hóa
    // Nhiều CDN hỗ trợ các params này: Cloudflare, Cloudinary, ImageKit, etc.
    if (width) {
      params.set("w", width.toString());
    }
    if (height) {
      params.set("h", height.toString());
    }
    if (quality) {
      params.set("q", quality.toString());
    }
    if (format) {
      params.set("f", format);
      params.set("fm", format); // Một số CDN dùng fm thay vì f
    }

    // Thêm tham số để tối ưu hóa thêm
    params.set("fit", "cover"); // Crop ảnh để fit kích thước
    params.set("auto", "format,compress"); // Tự động chọn format và compress

    urlObj.search = params.toString();
    return urlObj.toString();
  } catch (error) {
    // Nếu URL không hợp lệ, thử thêm params theo cách đơn giản
    const separator = url.includes("?") ? "&" : "?";
    const params: string[] = [];

    if (width) params.push(`w=${width}`);
    if (height) params.push(`h=${height}`);
    if (quality) params.push(`q=${quality}`);
    if (format) params.push(`f=${format}`);

    return params.length > 0 ? `${url}${separator}${params.join("&")}` : url;
  }
}

/**
 * Tạo srcset cho responsive images
 * @param url - URL ảnh gốc
 * @param widths - Mảng các width cần tạo srcset
 * @returns String srcset
 */
export function generateSrcSet(url: string, widths: number[]): string {
  return widths
    .map((width) => {
      const optimizedUrl = optimizeImageUrl(url, { width, quality: 80 });
      return `${optimizedUrl} ${width}w`;
    })
    .join(", ");
}

/**
 * Lấy URL ảnh placeholder nhỏ để hiển thị khi loading
 * @param url - URL ảnh gốc
 * @returns URL ảnh placeholder với kích thước nhỏ
 */
export function getPlaceholderUrl(url: string): string {
  return optimizeImageUrl(url, {
    width: 40,
    quality: 30,
    format: "webp",
  });
}

