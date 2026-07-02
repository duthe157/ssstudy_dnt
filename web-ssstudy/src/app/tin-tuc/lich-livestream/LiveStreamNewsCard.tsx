'use client';
import Image from "next/image";
import { CalendarDays } from "lucide-react";
import Link from "next/link";

interface BlogPost {
  _id: string;
  name: string;
  alias: string;
  image: string;
  external_link: string;
  description: string;
  content: string;
  status: boolean;
  is_featured: boolean;
  category: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

interface LiveStreamNewsCardProps {
  post: BlogPost;
  category_alias: string;
}

export default function LiveStreamNewsCard({ post, category_alias }: LiveStreamNewsCardProps) {

  const postUrl = `${category_alias}/${post.alias}`;

  return (
    <div style={{ height: 188 }} className="flex flex-col lg:flex-row bg-white shadow-sm overflow-hidden w-full max-w-4xl mx-auto">
      {/* Left: Image */}
     <Link
        href={postUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative bg-[#F9B233] flex items-center justify-center group"
      >
        <Image
          src={post.image || "/imgs/home/course-1.png"}
          alt={post.name}
          width={286}
          height={188}
          className="object-none max-h-full group-hover:opacity-90 transition"
        />
      </Link>

      {/* Right: Content */}
      <div className="flex-1 p-6 lg:p-8 flex flex-col justify-center">
        <h2 className="text-xl lg:text-2xl font-bold text-[#666] mb-3 lg:mb-4">
          {post.name}
        </h2>
        <p
          className="text-sm lg:text-lg text-[#656D7A] mb-3 lg:mb-2 line-clamp-3 lg:line-clamp-none"
          dangerouslySetInnerHTML={{ __html: post?.description }}
        />
        <div className="flex items-center mt-2 lg:mt-4 text-[#656D7A] text-sm lg:text-xl font-medium">
          <CalendarDays className="w-5 h-5 lg:w-6 lg:h-6 mr-2" />
          {new Date(post.created_at).toLocaleDateString("vi-VN")}
        </div>
      </div>
    </div>
  );
}
