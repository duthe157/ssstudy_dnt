"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import FeaturedCoursesSlider from "@/components/home/featured-courses-slider/index";
import { apiService } from "@/services/api";

interface Classroom {
  _id: string;
  name: string;
  alias: string;
  group_name: string;
  image: string;
  teacher: string;
  price: number;
  origin_price: number;
  teacher_alias: string;
  teacher_id: string;
}

interface ClassroomListResponse {
  data: {
    records: Classroom[];
    limit: number;
    totalRecord: number;
    perPage: number;
  };
  message: string;
  code: number;
}

export default function ClassroomList({ teacher_id }: { teacher_id: string }) {
  const [classroomList, setclassroomList] = useState<Classroom[]>([]);

  // Memoize hàm fetchClassroomList để tránh tạo lại function
  const fetchClassroomList = useCallback(
    async (teacherId: string, isOnline: boolean) => {
      try {
        // const response = await apiService.post<ClassroomListResponse>('/classroom-list', {
        const response = await apiService.post<ClassroomListResponse>("classroom-list",{});

        if (response?.code === 200 && response?.data) {
          // 🔍 Lọc theo teacher_id
          const filtered = response.data.records.filter(
            (item: Classroom) => item.teacher_id === teacherId
          );
          setclassroomList(filtered);
        } else {
          console.error("API response error:", response?.message);
          setclassroomList([]);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách lớp của giáo viên:", err);
        setclassroomList([]);
      }
    },
    []
  );

  useEffect(() => {
    fetchClassroomList(teacher_id, true);
  }, [fetchClassroomList, teacher_id]);

  return FeaturedCoursesSlider({
    data: classroomList,
    currentPage: "teacher-details",
  });
}
