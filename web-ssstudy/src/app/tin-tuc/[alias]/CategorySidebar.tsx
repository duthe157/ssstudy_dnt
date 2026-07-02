"use client";

import { useEffect, useState } from "react";
import { apiService } from '../../../services/api';

export default function CategorySidebar() {
  const [categories, setCategories] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);

  const normalizeString = (str: string) => str.toLowerCase().trim();

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Fetch danh mục
        const jsonCat = await apiService.post('blog-category/list', {}) as any;

        const excluded = [
          "Về Chúng Tôi",
          "Báo chí nói về thầy Nguyễn Tiến Đạt",
          "Đối tác",
          "Chính sách",
          "Chính Sách",
          "Báo chí nói về SSStudy",
          "Về SSStudy"
        ];

        const excludedNormalized = excluded.map(normalizeString);
        const filteredCategories = jsonCat.data.records.filter(
          (cat: any) => cat.status === true && !excludedNormalized.includes(normalizeString(cat.name))
        );

        // 2. Fetch bài viết
        const jsonPost = await apiService.post('blog/list-public', {}) as any;

        setCategories(filteredCategories);
        setPosts(jsonPost.data.records);
      } catch (err) {
        console.error("Error fetching data", err);
      }
    }

    fetchData();
  }, []);

  // 3. Tính số bài viết cho từng danh mục
  const getPostCountByCategory = (cat_name: string) => {
    return posts.filter((post) => post.category?.name === cat_name).length;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="font-bold text-[#1E2A5E] mb-4">Danh mục</h3>
      <ul className="divide-y divide-gray-200">
        {categories.map((cat, idx) => (
          <li key={idx}>
            <a
              href={`/${cat.alias}`}
              className="group flex justify-between text-gray-600 hover:text-blue-600 cursor-pointer py-2"
            >
              <span className="flex items-center gap-2">
                <img
                  src="/imgs/tin-tuc/arrow-right-contained-02.svg"
                  alt=""
                  className="w-4 h-4 block group-hover:hidden"
                />
                <img
                  src="/imgs/tin-tuc/arrow-right-contained-01.svg"
                  alt=""
                  className="w-4 h-4 hidden group-hover:block"
                />
                {cat.name}
              </span>
              <span className="text-sm text-gray-400">
                ({getPostCountByCategory(cat.name)})
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
