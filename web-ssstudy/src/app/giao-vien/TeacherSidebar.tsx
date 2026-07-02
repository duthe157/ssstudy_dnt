"use client";

import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useTeacherContext } from "../giao-vien//TeacherContext";
import { apiService } from '../../services/api';

export default function TeacherSidebar() {
  const { filters, setFilters } = useTeacherContext();
  const groups = [
    "Luyện thi vào 10",
    "Lớp 10 - Lớp 11",
    "Lớp 12 - Luyện thi ĐH",
    "Luyện thi ĐGNL-ĐGTD",
    "Đại học - Cao đẳng",
  ];

  const [originalClasslist, setOriginalClasslist] = useState<any[]>([]);
  const [groupSubjects, setGroupSubjects] = useState<any[]>([]);

  const [open, setOpen] = useState(false);

  // State cho nhiều accordion mở/đóng độc lập
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect( () => {
    const fetchData = async () => {
      try {
        const res = await apiService.post('classroom-list', {}) as any;
        const dataArray = Array.isArray(res?.data?.records)
          ? res.data.records
          : [];

        setOriginalClasslist(dataArray);

        const result = groups.map((g) => {
          const subjects = dataArray
            .filter((item: any) => item.group?.name === g)
            .map((item: any) => item.subject?.name)
            .filter(
              (v: any, i: number, arr: any[]) => v && arr.indexOf(v) === i
            );

          return { group: g, subjects };
        });

        setGroupSubjects(result);

        // Mặc định tất cả đóng (có thể cho mở hết nếu muốn)
        const initState: Record<string, boolean> = {};
        result.forEach((r) => (initState[r.group] = false));
        setOpenGroups(initState);

      } catch (err) {
        console.error("Failed to fetch subjects:", err);
      }
    }

    fetchData();

  }, []);

  const toggleFilter = (group: string, subject: string) => {
    const key = `${group}|${subject}`;

    // Tìm tất cả teacher_id của subject được filter
    const matched = originalClasslist.filter(
      (item: any) =>
        item.group?.name === group && item.subject?.name === subject
    );
    const teacherIds = matched.map((item: any) => item.teacher_id);

    setFilters((prev) => {
      const current = prev.subjects;
      const updatedSubjects = current.includes(key)
        ? current.filter((v) => v !== key)
        : [...current, key];

      // Lấy tất cả teacher_id từ các subject đang được chọn
      const selectedTeacherIds = originalClasslist
        .filter((item: any) => {
          const k = `${item.group?.name}|${item.subject?.name}`;
          return updatedSubjects.includes(k);
        })
        .map((item: any) => item.teacher_id)
        .filter(
          (id: any, idx: number, arr: any[]) => id && arr.indexOf(id) === idx
        );

      return {
        ...prev,
        subjects: updatedSubjects,
        teacher_ids: selectedTeacherIds,
      };
    });
  };

  const toggleGroup = (group: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  return (
    <div>
      {/* Header với button (mobile) */}
      <div className="flex items-center justify-between mt-6 md:hidden">
        <h2 className="text-[24px] font-bold">Đội ngũ giáo viên</h2>

        <button
          className="md:hidden bg-[#235CD0] text-white px-4 py-2 rounded-lg"
          onClick={() => setOpen(true)}
        >
          Bộ lọc
        </button>
      </div>

      {/* Overlay (mobile) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 right-0 h-auto max-h-full overflow-y-auto 
          w-[260px] md:w-[170px] lg:w-[260px] 
          bg-white pt-8 pl-4 pb-8 pr-8 flex flex-col gap-2 
          transition-transform duration-300 z-50
          ${open ? "translate-x-0" : "translate-x-full"} 
          md:static md:translate-x-0 md:flex
        `}
      >
        {/* Nút đóng (mobile) */}
        <button
          className="md:hidden self-end mb-4 text-[#235CD0] font-bold"
          onClick={() => setOpen(false)}
        >
          ✕
        </button>

        {/* Lặp qua các group */}
        {groupSubjects.map((groupObj: any) => {
          const isOpen = openGroups[groupObj.group];
          return (
            <div key={groupObj.group}>
              {/* Header group (click toggle) */}
              <div
                className={`ml-2 rounded-md p-2 mb-1 flex justify-between items-center cursor-pointer relative ${isOpen ? 'bg-[#235CD0]' : ''}`}
                onClick={() => toggleGroup(groupObj.group)}
              >
                {/* Thêm thanh dọc xanh khi group mở */}
                {isOpen && (
                  <div className="absolute left-[-23px] top-0 w-[13px] h-full bg-[#235CD0] rounded-tr-md rounded-br-md" />
                )}
                <span className={`font-bold text-[14px] ${isOpen ? 'text-white' : 'text-gray-600'}`}>
                  {groupObj.group}
                </span>
                {isOpen ? (
                  <ChevronUp className={`w-4 h-4 ${isOpen ? 'text-white' : 'text-gray-600'}`} />
                ) : (
                  <ChevronDown className={`w-4 h-4 ${isOpen ? 'text-white' : 'text-gray-600'}`} />
                )}
              </div>

              {/* List subject nếu group mở */}
              {isOpen && (
                <div className="flex flex-col gap-1 mb-1">
                  {groupObj.subjects.map((subject: string) => {
                    const key = `${groupObj.group}|${subject}`;
                    const isChecked = filters.subjects.includes(key);
                    return (
                      <label
                        key={key}
                        className={`flex items-start gap-2 pl-4 py-1 rounded-md cursor-pointer ${
                          isChecked ? "bg-[#F5F8FF]" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleFilter(groupObj.group, subject)}
                          className="w-4 h-4 accent-[#235CD0] flex-shrink-0 mt-1"
                        />
                        <span
                          className={`text-[14px] leading-snug ${
                            isChecked
                              ? "text-[#235CD0] font-bold"
                              : "text-[#6C7086]"
                          }`}
                        >
                          {subject}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Thanh dọc xanh (desktop) */}
        {/* <div className="absolute left-0 top-8 w-[13px] h-10 bg-[#235CD0] rounded-tr-md rounded-br-md hidden md:block" /> */}
      </div>
    </div>
  );
}
