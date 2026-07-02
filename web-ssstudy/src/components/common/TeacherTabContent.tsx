"use client";

import Link from "next/link";
import Image from "next/image";
import { CDN_LINK } from "@/utils/constants";

interface FeaturedStatBox {
  box1_num?: number;
  box1_text?: string;
  box1_img?: string;
  box2_num?: number;
  box2_text?: string;
  box2_img?: string;
  box3_num?: number;
  box3_text?: string;
  box3_img?: string;
  box4_num?: number;
  box4_text?: string;
  box4_img?: string;
  [key: string]: any;
}

interface FeaturedTextBox {
  box1_text?: string;
  box1_img?: string;
  box2_text?: string;
  box2_img?: string;
  box3_text?: string;
  box3_img?: string;
  [key: string]: any;
}

interface Teacher {
  _id?: string;
  fullname?: string;
  avatar?: string;
  profile_pic?: string;
  alias?: string;
  description?: string;
  content?: string;
  featured_stats_box?: FeaturedStatBox;
  featured_text_box?: FeaturedTextBox;
  link_fb?: string;
  total_classroom?: number;
  total_student?: number;
  [key: string]: any;
}

interface TeacherTabContentProps {
  teacher: Teacher | null | undefined;
}

export default function TeacherTabContent({ teacher }: TeacherTabContentProps) {
  if (!teacher || !teacher.fullname) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p>Thông tin giáo viên sẽ được cập nhật...</p>
      </div>
    );
  }

  // Get avatar URL
  const avatarUrl = teacher.profile_pic || teacher.avatar;
  const fullAvatarUrl = avatarUrl
    ? avatarUrl.startsWith("http")
      ? avatarUrl
      : `${CDN_LINK}${avatarUrl}`
    : "";

  // Get description only
  const description = teacher.description || "";

  return (
    <div className="teacher-tab-content space-y-6">
      {/* Teacher Header */}
      <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
        {fullAvatarUrl && (
          <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 relative">
            <Image
              src={fullAvatarUrl}
              alt={teacher.fullname}
              width={128}
              height={128}
              quality={95}
              className="w-full h-full object-cover"
              style={{
                imageRendering: "-webkit-optimize-contrast",
              }}
            />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {teacher.alias ? (
              <Link
                href={`/giao-vien/${teacher.alias}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-700 hover:underline"
              >
                {teacher.fullname}
              </Link>
            ) : (
              teacher.fullname
            )}
          </h3>
        </div>
      </div>

      {/* Description */}
      {description && (
        <div
          className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}
    </div>
  );
}
