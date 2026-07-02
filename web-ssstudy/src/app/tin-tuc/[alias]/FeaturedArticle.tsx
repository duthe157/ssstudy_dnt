'use client';

import { useEffect, useState } from 'react';
import Script from "next/script";

interface FeaturedArticleProps {
  category_name: string;
  category_alias: string;
  posts: any;
}

export default function FeaturedArticle({ category_name, category_alias, posts }: FeaturedArticleProps) {

 return (
  <>
    {posts?.length > 0 && (
      <>
        <h2 className="text-xl font-bold text-[#1E2A5E] mb-4 mt-5">Bài viết nổi bật</h2>

        <div className="space-y-4">
          {posts.map((item: any) => (
            <a
              key={item._id}
              href={`/${category_alias}/${item.alias}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="bg-white rounded-lg shadow-sm flex overflow-hidden hover:shadow-md transition">
                {/* Ảnh bên trái */}
                <div className="relative w-40 h-28 flex-shrink-0">
                  <img
                    src={item.image || 'https://w.ladicd2n.com/5e5bae5298a7e87bbed7582a/the-gioi-moi-20240328122107-onzj7.png'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Nội dung bên phải */}
                <div className="p-3 flex flex-col justify-center">
                  <h3 className="font-medium text-[17px] text-gray-800 leading-snug line-clamp-3">
                    {item.name}
                  </h3>
                  <div className="flex items-center text-gray-500 text-sm mt-1">
                    <span className="mr-1">📅</span>
                    {new Date(item.created_at).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </>
    )}
  </>
);

}
