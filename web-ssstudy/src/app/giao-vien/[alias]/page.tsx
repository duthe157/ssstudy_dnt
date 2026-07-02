'use client';
import { use, useEffect, useState } from "react";
import Script from "next/script";
import Breadcrumbs from "../../../components/ui/breadcrumbs/Breadcrumbs";
import ClassroomList from "./ClassroomList";
import { apiService } from '../../../services/api';

interface FeaturedStatBox {
  box1_img?: string;
  box1_text?: string;
  box1_icon?: string;
  box2_img?: string;
  box2_text?: string;
  box2_icon?: string;
  box3_img?: string;
  box3_text?: string;
  box3_icon?: string;
  box4_img?: string;
  box4_text?: string;
  box4_icon?: string;
  [key: string]: any;
}

interface Teacher {
  fullname: string;
  description: string;
  content: string;
  featured_stats_box: FeaturedStatBox;
  profile_pic: string;
  avatar: string;
  alias: string;
  _id: string;
  education_philosophy_url: string;
}

interface TeacherResponse {
  data: {
    records: Teacher[];
    limit: number;
    totalRecord: number;
    perPage: number;
  };
  message: string;
  code: number;
}

export default function TeacherDetail({
  params,
}: {
  params: Promise<{ alias: string }>;
}) {
  // Unwrap params using React.use()
  const resolvedParams = use(params);
  
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const getYouTubeThumbnail = (url: string) => {
    const videoId = url.split('v=')[1]?.split('&')[0];
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
  };

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        setLoading(true);
        const res = await apiService.post<TeacherResponse>("teacher-list", {});
        const allTeachers: Teacher[] = res?.data?.records || [];
        
        const foundTeacher = allTeachers.find((t) => t.alias === resolvedParams.alias);
        
        if (foundTeacher) {
          setTeacher(foundTeacher);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Failed to fetch teacher data:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [resolvedParams.alias]);

  useEffect(() => {
    // Script logic để thay đổi background
    const container = document.querySelector(".min-h-screen.bg-white");
    if (container) {
      (container as HTMLElement).style.backgroundColor = "hsla(228, 33%, 97%, 1)";
    }

    const h1s = document.getElementsByTagName("h1");
    if (h1s[0]) {
      h1s[0].classList.remove("text-center");
      h1s[0].classList.add("text-left");
    }
  }, [teacher]);

  // Loading state
  if (loading) {
    return (
      <>
        <Breadcrumbs />
        <div className="flex flex-col md:flex-row items-stretch gap-6 p-6">
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="space-y-3 mt-6">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2 flex justify-end items-center">
            <div className="w-full max-w-[420px] h-[420px] bg-gray-200 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </>
    );
  }

  // Not found state
  if (notFound || !teacher) {
    return (
      <>
        <Breadcrumbs />
        <div className="flex flex-col items-center justify-center p-6 min-h-[400px]">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Không tìm thấy giáo viên
          </h2>
          <p className="text-gray-600">
            Giáo viên bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
        </div>
      </>
    );
  }

  // Convert object sang array
  const items = [
    {
      img: teacher.featured_stats_box?.box1_img,
      text: teacher.featured_stats_box?.box1_text,
    },
    {
      img: teacher.featured_stats_box?.box2_img,
      text: teacher.featured_stats_box?.box2_text,
    },
    {
      img: teacher.featured_stats_box?.box3_img,
      text: teacher.featured_stats_box?.box3_text,
    },
    {
      img: teacher.featured_stats_box?.box4_img,
      text: teacher.featured_stats_box?.box4_text,
    },
  ].filter((item) => item.text || item.img);

  const teacherContent = teacher.content?.trim() || "";

  return (
    <>
      <Breadcrumbs />

      <div className="flex flex-col md:flex-row items-stretch gap-6 p-6">
        {/* Left Section: Info */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1d2b53] mb-4">
            {teacher.fullname}
          </h2>

          {teacherContent && (
            <div
              className="text-[#888] text-base md:text-lg mb-4 mt-4 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: teacherContent }}
            />
          )}

          <div className="text-[#555] text-base md:text-lg leading-relaxed space-y-3 [&_svg]:inline-block [&_svg]:mr-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                {item.img && (
                  <img
                    src={`https://cdn.luyenthitiendat.vn/${item.img}`}
                    alt="icon"
                    width={38}
                    height={38}
                  />
                )}
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section: Video or Image */}
        <div className="w-full md:w-1/2 flex justify-end items-center">
          <div className="w-full max-w-[591px] h-[349px] rounded-2xl overflow-hidden">
            {teacher.education_philosophy_url ? (
              <div 
                className="w-full h-full cursor-pointer relative group"
                onClick={() => setIsVideoModalOpen(true)}
              >
                <img
                  src={teacher.avatar 
                    ? `https://cdn.luyenthitiendat.vn/${teacher.avatar}` 
                    : getYouTubeThumbnail(teacher.education_philosophy_url)
                  }
                  alt={teacher.fullname}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all"></div>
                <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 text-white z-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            ) : (
              <img
                src={`https://cdn.luyenthitiendat.vn/${teacher.avatar}`}
                alt={teacher.fullname}
                style={{
                  width: '100%',
                  height: '100%',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center center',
                }}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Video Modal */}
      {isVideoModalOpen && teacher.education_philosophy_url && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div 
            className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 hover:bg-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <iframe
              src={teacher.education_philosophy_url.replace('watch?v=', 'embed/')}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
      <ClassroomList teacher_id={teacher._id} />
    </>
  );
}