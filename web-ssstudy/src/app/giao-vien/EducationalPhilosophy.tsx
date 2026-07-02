'use client';

import { useState, useMemo, useCallback, useEffect } from "react";
import Image from "next/image";
import { PlayCircle, X } from "lucide-react";
import { apiService } from '../../services/api';

interface Teacher {
  _id: string;
  fullname: string;
  avatar: string;
  education_philosophy_url?: string;
  education_philosophy_source?: string;
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

export default function EducationalPhilosophy() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; name: string } | null>(null);
  const pageSize = 8;

  // Hàm lấy YouTube video ID từ URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Hàm lấy YouTube thumbnail URL
  const getYouTubeThumbnail = (url: string): string => {
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return `https://cdn.luyenthitiendat.vn/default-thumbnail.jpg`; // fallback
  };

  // Hàm lấy YouTube embed URL
  const getYouTubeEmbedUrl = (url: string): string => {
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    return url;
  };

  // Fetch teachers có education_philosophy_url
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await apiService.post<TeacherResponse>("teacher-list", {});
        const records: Teacher[] = res?.data?.records || [];
        
        // Lọc chỉ lấy teacher có education_philosophy_url
        const filteredTeachers = records.filter(
          teacher => teacher.education_philosophy_url && teacher.education_philosophy_url.trim() !== ''
        );
        
        setTeachers(filteredTeachers);
      } catch (err) {
        console.error('Lỗi khi tải danh sách giáo viên:', err);
      }
    };

    fetchTeachers();
  }, []);

  // Tổng số trang
  const totalPages = useMemo(() => Math.ceil(teachers.length / pageSize), [teachers.length, pageSize]);

  // Data hiển thị theo trang
  const paginatedTeachers = useMemo(() => {
    return teachers.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [teachers, currentPage, pageSize]);

  // Hàm tạo mảng phân trang
  const generatePagination = useCallback((totalPages: number, currentPage: number): (number | string)[] => {
    let pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages = [1, 2, 3, "...", totalPages - 1, totalPages];
      } else if (currentPage >= totalPages - 2) {
        pages = [1, 2, "...", totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
      }
    }
    return pages;
  }, []);

  const paginationItems = useMemo(() => generatePagination(totalPages, currentPage), [totalPages, currentPage, generatePagination]);

  // Hàm mở video modal
  const handleVideoClick = (url: any, name: string) => {
    setSelectedVideo({ url, name });
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  };

  // Hàm đóng modal
  const closeModal = () => {
    setSelectedVideo(null);
    document.body.style.overflow = 'unset';
  };

  // Không hiển thị section nếu không có teacher nào
  if (teachers.length === 0) {
    return null;
  }

  return (
    <>
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Title */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-10">
            Triết lý giáo dục của SSStudy
          </h2>

          {/* Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedTeachers.map((teacher) => (
              <div key={teacher._id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                <div 
                  className="relative aspect-[4/3] rounded-t-lg overflow-hidden cursor-pointer"
                  onClick={() => teacher.education_philosophy_url && handleVideoClick(teacher.education_philosophy_url, teacher.fullname)}
                >
                  {teacher.education_philosophy_url && teacher.education_philosophy_source === 'Youtube' ? (
                    <img 
                      src={getYouTubeThumbnail(teacher.education_philosophy_url)} 
                      alt={teacher.fullname} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    null
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 hover:bg-opacity-30 transition">
                    <PlayCircle className="w-12 h-12 text-white drop-shadow-lg opacity-90 hover:scale-110 transition-transform" />
                  </div>
                </div>
                <div className="p-3 text-center">
                  <p className="text-gray-800 font-medium">{teacher.fullname}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination - chỉ hiển thị nếu có nhiều hơn 1 trang */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2">
              {/* Prev */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ←
              </button>

              {paginationItems.map((item, idx) =>
                item === "..." ? (
                  <span key={idx} className="px-2 text-gray-500">...</span>
                ) : (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(Number(item))}
                    className={`w-9 h-9 rounded-md ${
                      currentPage === item ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}

              {/* Next */}
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Video Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div 
            className="relative w-full max-w-4xl bg-black rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2 transition"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Video Title */}
            <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 px-4 py-2 rounded">
              <p className="text-white font-medium">{selectedVideo.name}</p>
            </div>

            {/* YouTube Video */}
            <div className="relative pt-[56.25%]">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={getYouTubeEmbedUrl(selectedVideo.url)}
                title={selectedVideo.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}