'use client';

import { FC, useState } from "react";
import Facebook from "../icons/FaceBook";
import Zalo from "../icons/Zalo";
import Youtube from "../icons/Youtube";
import Tiktok from "../icons/Tiktok";
import User from "../icons/User";
import Search from "../icons/Search";
import Dropdown from "../common/Dropdown";
import Pagination from "../common/Pagination";

const channels = [
  {
    id: "0",
    name: "Facebook",
    icon: <Facebook />,
    members: 5000,
    button: true,
    bg: '#E9EFFA'
  },
  {
    id: "1",
    name: "Zalo",
    icon: <Zalo />,
    members: 5000,
    button: true,
    bg: '#E9EFFA'
  },
  {
    id: "2",
    name: "Youtube",
    icon: <Youtube />,
    members: 5000,
    button: true,
    bg: '#FEECEB'
  },
  {
    id: "3",
    name: "Tiktok",
    icon: <Tiktok />,
    members: 5000,
    button: true,
    bg: '#F2F2FF'
  },
  {
    id: "4",
    name: "Facebook",
    icon: <Facebook />,
    members: 5000,
    button: true,
    bg: '#E9EFFA'
  },
  {
    id: "5",
    name: "Zalo",
    icon: <Zalo />,
    members: 5000,
    button: true,
    bg: '#E9EFFA'
  },
  {
    id: "6",
    name: "Youtube",
    icon: <Youtube />,
    members: 5000,
    button: true,
    bg: '#FEECEB'
  },
  {
    id: "7",
    name: "Tiktok",
    icon: <Tiktok />,
    members: 5000,
    button: true,
    bg: '#F2F2FF'
  },
];

// Mock data cho các options
const teacherOptions = [
  'Nguyễn Văn A',
  'Trần Thị B',
  'Lê Văn C',
  'Phạm Thị D',
  'Hoàng Văn E'
];

const gradeOptions = [
  'Lớp 1',
  'Lớp 2',
  'Lớp 3',
  'Lớp 4',
  'Lớp 5',
  'Lớp 6',
  'Lớp 7',
  'Lớp 8',
  'Lớp 9'
];

const subjectOptions = [
  'Toán học',
  'Vật lý',
  'Hóa học',
  'Sinh học',
  'Ngữ văn',
  'Tiếng Anh',
  'Lịch sử',
  'Địa lý'
];

const categoryOptions = [
  'Khóa học online',
  'Khóa học offline',
  'Tài liệu học tập',
  'Đề thi mẫu',
  'Bài giảng video'
];

const handlePageChange = (page: number): void => {
 
  // Thực hiện fetch data mới ở đây nếu cần
};

const StudentCommunities: FC = () => {
  // State để lưu giá trị được chọn
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Các hàm xử lý onChange
  const handleTeacherChange = (value: string) => {
    setSelectedTeacher(value);
 
   
  };

  const handleGradeChange = (value: string) => {
    setSelectedGrade(value);
  
   
  };

  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value);
  
   
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  
   
  };

  return (
    <section className="container mx-auto">
      <div className="flex items-center">
        <h2 className="flex-1 text-2xl md:text-3xl font-bold text-gray-900 mb-8">
          Cộng đồng dành cho học viên
        </h2>
      </div>

      <div className="flex">
        <div className="flex-1 flex items-center gap-4 mb-8">
          <div className="w-full flex flex-row items-center justify-between gap-4">
            <div className="w-[450px] relative">
              <input
                type="text"
                placeholder="Tìm kiếm cộng đồng"
                className="w-full pl-4 pr-10 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-700 bg-white"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-sm">Lọc theo</span>
              <div className="flex items-center gap-2">
                <Dropdown
                  label="Giáo viên"
                  options={teacherOptions}
                  value={selectedTeacher}
                  onChange={handleTeacherChange}
                />
                <Dropdown
                  label="Cấp học"
                  options={gradeOptions}
                  value={selectedGrade}
                  onChange={handleGradeChange}
                />
                <Dropdown
                  label="Môn học"
                  options={subjectOptions}
                  value={selectedSubject}
                  onChange={handleSubjectChange}
                />
                <Dropdown
                  label="Danh mục"
                  options={categoryOptions}
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 cursor-pointer">
        {channels.map((channel) => (
          <div
            key={channel.id}
            className="group relative flex flex-col gap-2 border border-gray-200 rounded-lg p-6 shadow-sm bg-white transition-all hover:shadow-md"
          >
            {/* Icon + Channel name */}
            <div className="flex items-center gap-3 mb-3">
            <div
                className="min-h-[49px] py-2 px-4 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: channel.bg }}
              >
                {channel.icon}
              </div>
              <span className="font-semibold text-blue-600">
                {channel.name}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Cộng đồng học tập của SSStudy
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-4 leading-relaxed transition-all duration-300 group-hover:line-clamp-2 group-hover:overflow-hidden group-hover:text-ellipsis">
              Chia sẻ phương pháp học tập hiệu quả và hữu ích, tham gia ngay để nhận được những tip học hành nhanh nhất và bám sát đề thi nhất.
            </p>

            {/* Members */}
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <User />
              {channel.members.toLocaleString()} thành viên
            </div>

            {/* Hover button wrapper */}
            <div className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {channel.button && (
                <button className="w-full bg-blue-600 text-white text-sm font-medium py-2 rounded-md">
                  Tham gia ngay
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Pagination totalPages={8} initialPage={2} onPageChange={handlePageChange} />
      </div>
    </section>
  );
};

export default StudentCommunities;
