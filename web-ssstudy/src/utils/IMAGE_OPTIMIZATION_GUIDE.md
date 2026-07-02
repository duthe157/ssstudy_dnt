# Hướng dẫn Tối ưu hóa Ảnh

## Tổng quan

Utility `image-optimizer.ts` giúp tối ưu hóa việc load ảnh trong ứng dụng bằng cách:
- Thêm query parameters để resize/compress ảnh từ CDN
- Tự động chuyển đổi sang format WebP
- Giảm dung lượng ảnh mà không làm mất chất lượng đáng kể
- Tăng tốc độ load trang

## Cách sử dụng

### 1. Import utility function

```typescript
import Image from "next/image";
import { optimizeImageUrl } from "@/utils/image-optimizer";
```

### 2. Thay thế thẻ `<img>` bằng Next.js `<Image>` component

#### Trước khi tối ưu:

```tsx
<img
  src={item.image}
  alt={item.title}
  className="w-full h-full object-cover"
/>
```

#### Sau khi tối ưu:

```tsx
<div className="relative w-full h-full">
  <Image
    src={optimizeImageUrl(item.image, { width: 560, quality: 85 })}
    alt={item.title || "Image"}
    fill
    sizes="(max-width: 768px) 279px, 279px"
    className="object-cover"
    loading="lazy"
    quality={85}
  />
</div>
```

### 3. Tùy chọn tối ưu hóa

```typescript
interface ImageOptimizeOptions {
  width?: number;        // Chiều rộng mong muốn (px)
  height?: number;       // Chiều cao mong muốn (px)
  quality?: number;      // Chất lượng ảnh (0-100), mặc định: 80
  format?: "webp" | "jpeg" | "png";  // Format ảnh, mặc định: webp
}
```

### 4. Các hàm utility khác

#### generateSrcSet
Tạo srcset cho responsive images:

```typescript
import { generateSrcSet } from "@/utils/image-optimizer";

const srcSet = generateSrcSet(imageUrl, [320, 640, 960, 1280]);
// Kết quả: "url?w=320 320w, url?w=640 640w, ..."
```

#### getPlaceholderUrl
Lấy URL ảnh placeholder nhỏ để hiển thị khi loading:

```typescript
import { getPlaceholderUrl } from "@/utils/image-optimizer";

const placeholder = getPlaceholderUrl(imageUrl);
// Trả về URL ảnh với kích thước 40px, quality 30%
```

## Best Practices

### 1. Chọn kích thước phù hợp

```typescript
// Cho thumbnail nhỏ
optimizeImageUrl(url, { width: 200, quality: 75 })

// Cho ảnh bìa trung bình
optimizeImageUrl(url, { width: 560, quality: 85 })

// Cho ảnh hero lớn
optimizeImageUrl(url, { width: 1920, quality: 90 })
```

### 2. Sử dụng attribute `sizes` đúng cách

```tsx
<Image
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  // ↑ Mobile: full width, Tablet: 50%, Desktop: 33%
/>
```

### 3. Thêm `loading="lazy"` cho ảnh không ở above the fold

```tsx
<Image
  loading="lazy"  // Lazy load cho ảnh ở dưới
  priority={false}
/>

// Hoặc cho ảnh quan trọng ở trên:
<Image
  priority={true}  // Load ngay lập tức
/>
```

### 4. Luôn cung cấp `alt` text hợp lý

```tsx
<Image
  alt={item.title || item.name || "Course image"}
  // ↑ Tốt cho SEO và accessibility
/>
```

## Cấu hình Next.js

File `next.config.mjs` đã được cấu hình để hỗ trợ:
- Format AVIF và WebP
- Cache ảnh 30 ngày
- Hỗ trợ nhiều remote image domains
- Device sizes và image sizes tối ưu

```javascript
images: {
  formats: ["image/avif", "image/webp"],
  minimumCacheTTL: 60 * 60 * 24 * 30,
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
}
```

## Hiệu suất

### Trước khi tối ưu:
- Kích thước ảnh gốc: ~500KB - 2MB
- Thời gian load: 2-5 giây (mạng chậm)
- Format: JPEG/PNG

### Sau khi tối ưu:
- Kích thước ảnh: ~50KB - 200KB (giảm 80-90%)
- Thời gian load: 0.3-1 giây (mạng chậm)
- Format: WebP/AVIF (tự động)
- Lazy loading: Chỉ load ảnh khi cần

## Ví dụ thực tế

Xem file `src/components/home/featured-courses-slider/item.tsx` để tham khảo implementation hoàn chỉnh.

## Các component cần tối ưu thêm

Các component sau vẫn đang dùng thẻ `<img>` và có thể được tối ưu hóa tương tự:
- `src/components/home/achievement-board/item.tsx`
- `src/components/home/teaching-staff/item.tsx`
- Các component khác có sử dụng ảnh

## Lưu ý

1. **CDN hỗ trợ**: Utility này hoạt động tốt nhất khi CDN hỗ trợ image transformation qua query params
2. **Fallback**: Nếu CDN không hỗ trợ, Next.js Image sẽ tự động tối ưu hóa ảnh
3. **Build time**: Next.js Image optimization chỉ hoạt động khi app đang chạy (dev hoặc production)

