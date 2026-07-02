"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react"; // Icon ngày tháng
import { apiService } from '../../../../services/api';

interface RelatedPostsProps {
  currentSlug: string; // alias bài viết hiện tại
  category_name: string;
  category_alias: string;
}

interface Category {
  id: string;
  name: string;
}

interface Post {
  _id: string;
  name: string;
  alias: string;
  description: string;
  updated_at: string;
  image?: string;
  is_featured?: boolean;
  status: string | boolean | null;
  category: Category;
}

export default function RelatedPosts({
  currentSlug,
  category_name,
  category_alias,
}: RelatedPostsProps) {
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await apiService.post('blog/list-public', {}) as any;

        if (res?.data?.records) {
          const filtered = res.data.records
            // Lọc bỏ bài hiện tại và bài nổi bật
            .filter(
              (item: Post) =>
                item.alias !== currentSlug &&
                item.is_featured !== true &&
                item.status == true &&
                item.category?.name == category_name
            )
            // Sắp xếp theo updated_at giảm dần
            .sort(
              (a: Post, b: Post) =>
                new Date(b.updated_at).getTime() -
                new Date(a.updated_at).getTime()
            )
            // Lấy 4 bài đầu tiên
            .slice(0, 4);

          setRelatedPosts(filtered);
        }
      } catch (error) {
        console.error("Error fetching related posts:", error);
      }
    }

    fetchPosts();
  }, [currentSlug]);

  if (relatedPosts.length === 0) return null;

  return (
    <section className="py-10 mt-12 rounded-lg">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Bài viết liên quan
        </h2>

        <div
          className="grid gap-6 justify-center place-items-center"
          style={{
            gridTemplateColumns: relatedPosts.length >= 4 
              ? "repeat(4, 1fr)" 
              : `repeat(${relatedPosts.length}, 280px)`,
            justifyContent: "center", // Luôn căn giữa
            margin: "0 auto", // Căn giữa container
          }}
        >
          {relatedPosts.map((post) => (
            <div
              key={post._id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-300 overflow-hidden h-[390px] flex flex-col"
            >
              <div className="overflow-hidden flex-shrink-0">
                <a
                  href={`/${category_alias}/${post.alias}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={
                      post.image ||
                      "https://w.ladicdn.com/5e5bae5298a7e87bbed7582a/the-gioi-moi-20240328122107-onzj7.png"
                    }
                    alt={post.name}
                    className="w-full h-48 object-cover object-center transform hover:scale-105 transition-transform duration-300"
                  />
                </a>
              </div>

              <div className="p-4 flex flex-col flex-grow">
                <a
                  href={`/${category_alias}/${post.alias}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
                    {post.name}
                  </h3>
                </a>

                <p
                  className="text-sm text-gray-600 mb-3 line-clamp-3 overflow-hidden break-words"
                  style={{
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 3,
                    wordBreak: "break-word",
                  }}
                  dangerouslySetInnerHTML={{
                    __html:
                      post.description || "Nội dung đang được cập nhật...",
                  }}
                ></p>

                <div className="flex items-center text-gray-500 text-xs mt-auto">
                  <CalendarDays className="w-4 h-4 mr-1" />
                  {new Date(post.updated_at).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
