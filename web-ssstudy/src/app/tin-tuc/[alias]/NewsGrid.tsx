"use client";
import { useEffect, useState } from "react";
import NewsCard from "./NewsCard";
interface Category {
  id: string;
  name: string;
}
interface NewsRecord {
  _id: string;
  name: string;
  alias: string;
  description: string;
  external_link: string;
  image: string;
  status: string | boolean | null;
  created_at: string;
  category: Category;
  is_featured: boolean;
}

export default function NewsGrid({
  category_name,
  category_alias,
  posts,
}: {
  category_name: string;
  category_alias: string;
  posts: any;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 news-grid">
      {/* Bài lớn bên trái */}
      {posts[0] && (
        <NewsCard
          id={posts[0]._id}
          title={posts[0].name}
          date={posts[0].created_at}
          image={posts[0].image}
          alias={posts[0].alias}
          category_alias={category_alias}
          big
        />
      )}

      {/* 3 bài nhỏ bên phải */}
      <div className="grid grid-rows-2 gap-4">
        {/* ảnh trên cùng (full width) */}
        {posts[1] && (
          <NewsCard
            id={posts[1]._id}
            title={posts[1].name}
            date={posts[1].created_at}
            image={posts[1].image}
            alias={posts[1].alias}
            category_alias={category_alias}
          />
        )}

        {/* 2 ảnh dưới chia 2 cột */}
        <div className="grid grid-cols-2 gap-4">
          {posts[2] && (
            <NewsCard
              id={posts[2]._id}
              title={posts[2].name}
              date={posts[2].created_at}
              image={posts[2].image}
              alias={posts[2].alias}
              category_alias={category_alias}
            />
          )}

          {posts[3] && (
            <NewsCard
              id={posts[3]._id}
              title={posts[3].name}
              date={posts[3].created_at}
              image={posts[3].image}
              alias={posts[3].alias}
              category_alias={category_alias}
            />
          )}
        </div>
      </div>
    </div>
  );
}
