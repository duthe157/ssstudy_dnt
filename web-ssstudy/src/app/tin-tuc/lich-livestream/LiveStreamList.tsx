"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import LiveStreamPagination from "./LiveStreamPagination";
import { useLiveStream } from "./LiveStreamContext";

interface BlogPost {
  _id: string;
  name: string;
  image: string;
  alias: string;
  external_link: string;
  description: string;
  content: string;
  status: boolean;
  is_featured: boolean;
  level: string;
  subject_id: string;
  category: { id: string; name: string };
  created_at: string;
  updated_at: string;
}

interface LiveStreamListProps {
  posts: BlogPost[];
  category_alias: string;
}

const LiveStreamNewsCard = dynamic(() => import("./LiveStreamNewsCard"), {
  ssr: false,
});

export default function LiveStreamList({
  posts,
  category_alias,
}: LiveStreamListProps) {
  const { selectedClass, selectedSubject } = useLiveStream();
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 9;

  //  Lọc bài viết theo subject_id và level
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Nếu không có filter nào, hiển thị tất cả
      const matchLevel =
        selectedClass && selectedClass.length > 0
          ? selectedClass.includes(post.level)
          : true;

      const matchSubject =
        selectedSubject && selectedSubject.length > 0
          ? selectedSubject.includes(post.subject_id)
          : true;

      return matchLevel && matchSubject;
    });
  }, [posts, selectedClass, selectedSubject]);

  const pageCount = Math.ceil(filteredPosts.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentItems = filteredPosts.slice(offset, offset + itemsPerPage);

  return (
    <>
      <div className="grid gap-6 mt-6 grid-cols-1">
        {currentItems.map((post) => (
          <LiveStreamNewsCard
            key={post._id}
            post={post}
            category_alias={category_alias}
          />
        ))}
        {filteredPosts.length === 0 && (
          <p className="text-gray-500 text-center py-6">
            Không có bài livestream nào phù hợp.
          </p>
        )}
      </div>

      {pageCount > 1 && (
        <div className="mt-8 flex justify-center">
          <LiveStreamPagination
            pageCount={pageCount}
            onPageChange={({ selected }) => setCurrentPage(selected)}
          />
        </div>
      )}
    </>
  );
}
