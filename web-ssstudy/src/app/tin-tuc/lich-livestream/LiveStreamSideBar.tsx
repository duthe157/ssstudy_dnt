"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLiveStream } from "./LiveStreamContext";
import { apiService } from '../../../services/api';


const CLASS_OPTIONS = [
  { label: "Lớp 9", value: "9" },
  { label: "Lớp 10", value: "10" },
  { label: "Lớp 11", value: "11" },
  { label: "Lớp 12", value: "12" },
];

const ALLOWED_SUBJECT_alias = [
  "vat-li",
  "tieng-anh",
  "ngu-van",
  "toan",
  "hoa-hoc",
  "lich-su",
  "sinh-hoc",
  "dia-ly",
];

export default function LiveStreamSideBar() {
  const {
    selectedClass,
    setSelectedClass,
    selectedSubject,
    setSelectedSubject,
  } = useLiveStream();
  const [isClassOpen, setIsClassOpen] = useState(true);
  const [isSubjectOpen, setIsSubjectOpen] = useState(true);
  const [subjects, setSubjects] = useState<
    { name: string; alias: string; _id: string }[]
  >([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await apiService.post('subject/list', {limit: 999}) as any;

        if (res?.data?.records) {
          const filtered = res.data.records
            .filter((s: any) => ALLOWED_SUBJECT_alias.includes(s.alias))
            .map((s: any) => ({
              name: s.name,
              alias: s.alias,
              _id: s._id,
            }));

          setSubjects(filtered);
        }
      } catch (error) {
        console.error("Lỗi fetch danh sách môn:", error);
      }
    };

    fetchSubjects();
  }, []);

  // Xử lý chọn nhiều cấp học
  const handleClassToggle = (value: string) => {
    setSelectedClass((prev) => {
      const currentArray = prev || [];
      
      if (currentArray.includes(value)) {
        // Bỏ chọn - nếu array rỗng thì trả về null
        const newArray = currentArray.filter((v) => v !== value);
        return newArray.length > 0 ? newArray : null;
      } else {
        // Thêm vào
        return [...currentArray, value];
      }
    });
  };

  // Xử lý chọn nhiều môn học
  const handleSubjectToggle = (id: string) => {
    setSelectedSubject((prev) => {
      const currentArray = prev || [];
      
      if (currentArray.includes(id)) {
        // Bỏ chọn - nếu array rỗng thì trả về null
        const newArray = currentArray.filter((v) => v !== id);
        return newArray.length > 0 ? newArray : null;
      } else {
        // Thêm vào
        return [...currentArray, id];
      }
    });
  };

  // Kiểm tra xem có được chọn không
  const isClassSelected = (value: string) => {
    return selectedClass?.includes(value) || false;
  };

  const isSubjectSelected = (id: string) => {
    return selectedSubject?.includes(id) || false;
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-xs transition-all duration-300">
      {/* Lớp */}
      <div>
        <div
          className={`flex items-center justify-between mb-3 cursor-pointer px-4 py-2 rounded-t-lg ${
            isClassOpen ? "bg-[#235CD0]" : "bg-transparent"
          }`}
          onClick={() => setIsClassOpen((o) => !o)}
        >
          <span className={`font-bold ${isClassOpen ? "text-white" : "text-gray-600"}`}>
            Cấp học
          </span>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${
              isClassOpen ? "rotate-180 text-white" : "text-gray-600"
            }`}
          />
        </div>

        {isClassOpen && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {CLASS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`py-2 rounded-md border font-medium text-sm ${
                  isClassSelected(opt.value)
                    ? "bg-[#235CD0] text-white border-[#235CD0]"
                    : "bg-white text-gray-600 border-gray-300"
                }`}
                onClick={() => handleClassToggle(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-t my-6"></div>

      {/* Môn học */}
      <div>
        <div
          className={`flex items-center justify-between mb-3 cursor-pointer px-4 py-2 rounded-t-lg ${
            isSubjectOpen ? "bg-[#235CD0]" : "bg-transparent"
          }`}
          onClick={() => setIsSubjectOpen((o) => !o)}
        >
          <span className={`font-bold ${isSubjectOpen ? "text-white" : "text-gray-600"}`}>
            Môn học
          </span>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${
              isSubjectOpen ? "rotate-180 text-white" : "text-gray-600"
            }`}
          />
        </div>

        {isSubjectOpen && (
          <div className="grid grid-cols-2 gap-2">
            {subjects.length > 0 ? (
              subjects.map((subject) => (
                <button
                  key={subject.alias}
                  className={`py-2 rounded-md border font-medium text-sm ${
                    isSubjectSelected(subject._id)
                      ? "bg-[#235CD0] text-white border-[#235CD0]"
                      : "bg-white text-gray-600 border-gray-300"
                  }`}
                  onClick={() => handleSubjectToggle(subject._id)}
                >
                  {subject.name}
                </button>
              ))
            ) : (
              <p className="text-sm text-gray-400 col-span-2">Đang tải...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}