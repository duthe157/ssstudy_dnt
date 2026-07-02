# Ví dụ Nhanh - Tối ưu hóa Ảnh

## Cách 1: Sử dụng OptimizedImage Component (Khuyên dùng - Đơn giản nhất)

### Trước:
```tsx
<img
  src={item.image}
  alt={item.title}
  className="w-full h-full object-cover"
/>
```

### Sau:
```tsx
import { OptimizedImage } from "@/components/ui";

<OptimizedImage
  src={item.image}
  alt={item.title}
  fill
  optimizeWidth={560}
  optimizeQuality={85}
  className="object-cover"
  loading="lazy"
/>
```

⚠️ **Lưu ý**: Phải wrap trong div có `position: relative` khi dùng `fill` prop:

```tsx
<div className="relative w-full h-full">
  <OptimizedImage
    src={item.image}
    alt={item.title}
    fill
    optimizeWidth={560}
    className="object-cover"
  />
</div>
```

## Cách 2: Sử dụng Next.js Image + optimizeImageUrl

```tsx
import Image from "next/image";
import { optimizeImageUrl } from "@/utils/image-optimizer";

<div className="relative w-full h-full">
  <Image
    src={optimizeImageUrl(item.image, { width: 560, quality: 85 })}
    alt={item.title}
    fill
    sizes="(max-width: 768px) 100vw, 560px"
    className="object-cover"
    loading="lazy"
  />
</div>
```

## Kích thước khuyên dùng

| Loại ảnh | Width | Quality | Ví dụ sử dụng |
|----------|-------|---------|---------------|
| Thumbnail nhỏ | 200 | 75 | Avatar, icon |
| Card/Item ảnh | 560 | 85 | Course cards, product cards |
| Banner trung bình | 1200 | 85 | Section banners |
| Hero image lớn | 1920 | 90 | Hero sections, full-width images |
| Background | 1920 | 75 | Background images |

## Props OptimizedImage

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `src` | string | required | URL ảnh gốc |
| `alt` | string | required | Alt text cho SEO |
| `optimizeWidth` | number | - | Chiều rộng tối ưu |
| `optimizeHeight` | number | - | Chiều cao tối ưu |
| `optimizeQuality` | number | 85 | Chất lượng ảnh (0-100) |
| `loading` | string | "lazy" | "lazy" hoặc "eager" |
| `fill` | boolean | false | Fill parent container |
| `className` | string | - | Tailwind classes |

## Kết quả

### Trước khi tối ưu:
- 📦 Dung lượng: ~500KB - 2MB
- ⏱️ Thời gian load: 2-5 giây
- 📷 Format: JPEG/PNG

### Sau khi tối ưu:
- 📦 Dung lượng: ~50KB - 200KB (↓ 80-90%)
- ⏱️ Thời gian load: 0.3-1 giây (↑ 3-5x nhanh hơn)
- 📷 Format: WebP/AVIF (tự động)
- ⚡ Lazy loading: Chỉ load khi cần

## Example từ dự án

Xem file `src/components/home/featured-courses-slider/item.tsx` để xem ví dụ hoàn chỉnh đã được implement.

