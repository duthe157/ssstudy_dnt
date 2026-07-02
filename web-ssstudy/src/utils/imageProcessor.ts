/**
 * Utility functions for processing different image formats from API
 */

// Danh sách các định dạng ảnh được hỗ trợ
export const SUPPORTED_IMAGE_FORMATS = [
  "image/png",
  "image/jpg",
  "image/jpeg",
  "image/gif",
  "image/bmp",
  "image/svg+xml",
  "image/wmf",
] as const;

export type SupportedImageFormat = (typeof SUPPORTED_IMAGE_FORMATS)[number];

/**
 * Kiểm tra xem định dạng ảnh có được hỗ trợ không
 */
export function isSupportedImageFormat(
  format: string
): format is SupportedImageFormat {
  return SUPPORTED_IMAGE_FORMATS.includes(format as SupportedImageFormat);
}

/**
 * Tạo data URL từ base64 content và image format
 */
export function createDataUrl(format: string, content: string): string {
  if (isSupportedImageFormat(format)) {
    return `data:${format};base64,${content}`;
  }

  // Fallback cho các định dạng không được hỗ trợ
  console.warn(`Unsupported image format: ${format}`);
  return `data:image/png;base64,${content}`;
}

/**
 * Xử lý HTML content để thay thế các ảnh base64 với responsive styling
 * Hỗ trợ tất cả các định dạng: png, jpg, jpeg, gif, bmp, svg+xml, wmf
 */
export function processBase64Images(htmlContent: string): string {
  if (!htmlContent) return htmlContent;

  // Xử lý tất cả các định dạng ảnh base64 được hỗ trợ
  return htmlContent.replace(
    /<img([^>]*src="data:image\/(png|jpg|jpeg|gif|bmp|svg\+xml|wmf)[^"]*"[^>]*)>/gi,
    '<img$1 style="max-width: 100%; height: auto; display: block; margin: 10px 0;" class="img-fluid responsive-image exam-image">'
  );
}

/**
 * Xử lý question object để render ảnh base64
 */
export function renderQuestionImage(question: {
  kind: string;
  content: string;
}): string {
  const { kind, content } = question;

  if (isSupportedImageFormat(kind)) {
    const base64Image = createDataUrl(kind, content);
    return `<img src="${base64Image}" alt="" class="inline-block" style="max-width: 100%; height: auto;"/>`;
  }

  return "";
}

/**
 * Xử lý mảng images từ question
 */
export function processQuestionImages(images: string[]): string[] {
  if (!images || !Array.isArray(images)) return [];

  return images.map((img) => {
    // Nếu đã là data URL thì giữ nguyên
    if (img.startsWith("data:")) {
      return img;
    }

    // Nếu là URL thông thường thì giữ nguyên
    if (img.startsWith("http")) {
      return img;
    }

    // Nếu là base64 thuần thì thêm prefix
    if (img.match(/^[A-Za-z0-9+/=]+$/)) {
      return `data:image/png;base64,${img}`;
    }

    return img;
  });
}

/**
 * Xử lý đặc biệt cho WMF và các định dạng không được hỗ trợ bởi trình duyệt
 */
export function processUnsupportedImageFormats(
  kind: string,
  content: string
): string {
  // WMF không được hỗ trợ bởi trình duyệt web
  if (kind === "image/wmf") {
    console.warn(
      "WMF format detected - not supported by browsers, showing placeholder"
    );
    return `<div class="unsupported-image-placeholder" data-format="wmf" data-content="${content}">
      <div class="text-center">
        <div class="text-sm font-medium text-gray-600 mb-1">WMF Image</div>
        <div class="text-xs text-gray-500">Format not supported by browser</div>
        <div class="text-xs text-gray-400 mt-1">Click to download</div>
      </div>
    </div>`;
  }

  // Fallback cho các định dạng khác không được hỗ trợ
  return `<div class="unsupported-image-placeholder" data-format="${kind}" data-content="${content}">
    <div class="text-center">
      <div class="text-sm font-medium text-gray-600 mb-1">Unsupported Format</div>
      <div class="text-xs text-gray-500">${kind}</div>
      <div class="text-xs text-gray-400 mt-1">Click to download</div>
    </div>
  </div>`;
}

/**
 * Cập nhật renderQuestionImage để xử lý WMF
 */
export function renderQuestionImageWithFallback(question: {
  kind: string;
  content: string;
}): string {
  const { kind, content } = question;

  if (isSupportedImageFormat(kind)) {
    // Kiểm tra đặc biệt cho WMF
    if (kind === "image/wmf") {
      return processUnsupportedImageFormats(kind, content);
    }

    const base64Image = createDataUrl(kind, content);
    return `<img src="${base64Image}" alt="" class="inline-block exam-image" style="max-width: 100%; height: auto; display: block; margin: 10px 0;"/>`;
  }

  // Xử lý các định dạng không được hỗ trợ
  return processUnsupportedImageFormats(kind, content);
}

/**
 * Setup event listeners cho các placeholder không được hỗ trợ
 */
export function setupUnsupportedImageHandlers(): void {
  if (typeof window === "undefined") return;

  // Xử lý click vào placeholder để download
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const placeholder = target.closest(".unsupported-image-placeholder");

    if (placeholder) {
      const format = placeholder.getAttribute("data-format");
      const content = placeholder.getAttribute("data-content");

      if (format && content) {
        downloadUnsupportedImage(format, content);
      }
    }
  });
}

/**
 * Download file từ base64 content
 */
function downloadUnsupportedImage(format: string, content: string): void {
  try {
    const dataUrl = createDataUrl(format, content);
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `image.${format.split("/")[1]}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error downloading image:", error);
    alert("Không thể tải xuống file. Vui lòng thử lại.");
  }
}
