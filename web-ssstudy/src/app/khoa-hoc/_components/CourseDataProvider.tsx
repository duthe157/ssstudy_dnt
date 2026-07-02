"use client";

import { useEffect, useState, useContext } from "react";
import { getCourseDataClient } from "../[id]/getCourseData";
import { classroomService } from "@/services/classroomService";
import { courseService } from "@/services/courseService";
import { bookService } from "@/services/bookService";
import { RootContext } from "@/contexts/RootContext";
import { lessonService } from "@/services/lessonService";
import { authService } from "@/services/authService";
import { getCookie } from "@/utils/helper";

interface AttachedCourse {
  _id: string;
  name?: string;
  title?: string;
  course_name?: string;
  alias: string;
  code: string;
  subject: {
    id: string;
    name: string;
  };
  group: {
    id: string;
    name: string;
  };
  price: number;
  origin_price: number;
  teacher: string;
  teacher_id: string;
  teacher_alias: string;
  num_student: number;
  is_featured: boolean;
  status: boolean;
  created_at: string;
  updated_at: string;
  time_course?: {
    opening_date: string;
    closing_date: string;
  };
  banner?: string;
}

// interface CourseData { ... }
interface Teacher {
  _id?: string;
  fullname?: string;
  avatar?: string;
  profile_pic?: string;
  alias?: string;
  description?: string;
  content?: string;
  featured_stats_box?: any;
  featured_text_box?: any;
  link_fb?: string;
  total_classroom?: number;
  total_student?: number;
  [key: string]: any;
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  image: string;
  teacher?: string;
  teacherAvatar?: string;
  teacherObject?: Teacher | null;
  price?: number;
  originPrice?: number;
  subject?: string;
  group?: string;
  code?: string;
  alias?: string;
  timeCourse?: {
    opening_date: string;
    closing_date: string;
  };
  content?: string;
  updatedAt?: string;
  numStudent?: number;
  classroomAttached?: AttachedCourse[];
  bookAttached?: any[];
  // NEW
  promotion?: {
    from_date?: string | null;
    to_date?: string | null;
    type?: string;
    hour?: number;
    note?: string;
  };
  includes?: Array<{ id: number | string; text: string; icon: number }>;
  highlightInformations?: Array<{ id: number | string; text: string }>;
  studentOwned?: number;
  groupId?: string;
  level?: string;
  isJoined?: boolean; // Field từ API classroom-view để check user đã tham gia khóa học
  groupChapter?: Array<{ id: number; title: string }>;
}

interface RelatedCourse {
  id: string;
  title: string;
  teacher: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  alias?: string;
}

interface CourseDataProviderProps {
  courseId: string;
  children: (
    courseData: CourseData & { relatedCourses?: RelatedCourse[] }
  ) => React.ReactNode;
}

/**
 * Component provider để fetch course data từ client-side
 * Sử dụng khi cần gọi API với user authentication
 */
export default function CourseDataProvider({
  courseId,
  children,
}: CourseDataProviderProps) {
  const rootContext = useContext(RootContext);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [relatedCourses, setRelatedCourses] = useState<RelatedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourseData() {
      try {
        setLoading(true);
        setError(null);

        const data = await getCourseDataClient(courseId);

        // Kiểm tra nếu data không hợp lệ
        if (!data) {
          console.error("CourseDataProvider: data is null or undefined");
          setError("Không thể tải dữ liệu khóa học");
          setLoading(false);
          return;
        }

        // Fetch is_joined từ API classroom-view nếu user đã đăng nhập
        // Lấy user_id từ cookie SSSTUDY_UID như source code cũ
        let isJoined = false;
        if (typeof window !== "undefined") {
          try {
            const user = localStorage.getItem("user");
            if (user) {
              let userId = "";
              try {
                const userData = JSON.parse(user);
                userId = userData._id || userData.id || "";
              } catch (error) {
                console.error("Error parsing user data:", error);
                // Không return, chỉ log error và tiếp tục
              }

              if (userId) {
                // Gọi API classroom-view để lấy is_joined (theo pattern của source code cũ)
                const viewResponse = await lessonService.getClassroomView({
                  id: courseId,
                  user_id: userId,
                });

                // Response structure: { code, data: ClassroomViewResponse }
                // ClassroomViewResponse có field is_joined ở top level
                if (viewResponse?.code === 200) {
                  // Kiểm tra cả 2 cách: data.is_joined hoặc data.data.is_joined (tùy response structure)
                  const responseData = viewResponse.data;
                  if (responseData) {
                    // Nếu responseData là object có is_joined trực tiếp
                    if (typeof (responseData as any).is_joined === "boolean") {
                      isJoined = (responseData as any).is_joined;
                    }
                    // Nếu responseData có nested data
                    else if (
                      (responseData as any).data &&
                      typeof (responseData as any).data.is_joined === "boolean"
                    ) {
                      isJoined = (responseData as any).data.is_joined;
                    }
                  }
                }
              }
            }
          } catch (err) {
            console.error("Error fetching classroom-view (is_joined):", err);
            // Không throw error, chỉ log và tiếp tục với isJoined = false
          }
        }

        // Fetch teacher object & level from API classroom/detail
        let teacherObject: Teacher | null = null;
        let levelFromDetail: string | undefined;
        let group_chapter: any[] = [];
        try {
          const response = await courseService.classroomDetail({
            id: courseId,
          });
          if (response.code === 200 && response.data?.classroom) {
            const teacherArray = Array.isArray(response.data.classroom.teacher)
              ? response.data.classroom.teacher
              : [];
            teacherObject = teacherArray.length > 0 ? teacherArray[0] : null;
            levelFromDetail = (response.data.classroom as any).level ?? "";
            group_chapter = (response.data.classroom as any).group_chapter || [];
          }
        } catch (err) {
          console.error("Error fetching teacher object:", err);
        }

        // Fetch chi tiết từ các ID nếu chúng chỉ là string (ID) chứ không phải object đầy đủ
        let classroomAttachedFull: AttachedCourse[] = [];
        let bookAttachedFull: any[] = [];

        // Kiểm tra và fetch chi tiết classroom_attached
        if (data.classroomAttached && data.classroomAttached.length > 0) {
          const firstItem = data.classroomAttached[0];
          // Nếu là string (ID) thì cần fetch chi tiết
          if (typeof firstItem === "string") {
            try {
              const fetchPromises = (data.classroomAttached as string[]).map(
                async (id: string) => {
                  try {
                    const response = await courseService.classroomDetail({
                      id,
                    });
                    if (response.code === 200 && response.data?.classroom) {
                      const c = response.data.classroom;
                      return {
                        _id: c._id,
                        name: c.name,
                        alias: c.alias || id,
                        code: c.code || "",
                        subject: c.subject || { id: "", name: "" },
                        group: c.group || { id: "", name: "" },
                        price: c.price || 0,
                        origin_price: c.origin_price || 0,
                        teacher: Array.isArray(c.teacher)
                          ? c.teacher[0]?.fullname || ""
                          : c.teacher || "",
                        teacher_id: c.teacher_id || "",
                        teacher_alias: c.teacher_alias || "",
                        num_student: c.num_student || 0,
                        is_featured: (c as any).is_featured || false,
                        status: (c as any).status ?? true,
                        created_at: (c as any).created_at || "",
                        updated_at: (c as any).updated_at || "",
                        time_course: c.time_course,
                        banner: c.banner || c.image,
                      } as AttachedCourse;
                    }
                  } catch (err) {
                    console.error(`Error fetching classroom ${id}:`, err);
                    return null;
                  }
                  return null;
                }
              );
              const results = await Promise.all(fetchPromises);
              classroomAttachedFull = results.filter(
                (r): r is AttachedCourse => r !== null
              );
            } catch (err) {
              console.error("Error fetching classroom attached details:", err);
            }
          } else {
            // Nếu đã là object đầy đủ thì dùng luôn
            classroomAttachedFull = data.classroomAttached as AttachedCourse[];
          }
        }

        // Kiểm tra và fetch chi tiết book_attached
        if (data.bookAttached && data.bookAttached.length > 0) {
          const firstItem = data.bookAttached[0];
          // Nếu là string (ID) thì cần fetch chi tiết
          if (typeof firstItem === "string") {
            try {
              const fetchPromises = (data.bookAttached as string[]).map(
                async (id: string) => {
                  try {
                    const response = await bookService.getBookDetail(id);
                    const bookData =
                      (response as any)?.data?.data?.book ||
                      (response as any)?.data?.book ||
                      (response as any)?.data;
                    if (bookData) {
                      return {
                        _id: bookData._id || id,
                        name: bookData.name || "",
                        alias: bookData.alias || bookData._id || id, // Ưu tiên alias, fallback về _id hoặc id
                        code: bookData.code || "",
                        price: Number(bookData.price || 0),
                        origin_price: Number(bookData.origin_price || 0),
                      };
                    }
                  } catch (err) {
                    console.error(`Error fetching book ${id}:`, err);
                    return null;
                  }
                  return null;
                }
              );
              const results = await Promise.all(fetchPromises);
              bookAttachedFull = results.filter((r) => r !== null);
            } catch (err) {
              console.error("Error fetching book attached details:", err);
            }
          } else {
            // Nếu đã là object đầy đủ thì dùng luôn
            bookAttachedFull = data.bookAttached;
          }
        }

        const finalCourseData = {
          ...data,
          teacherObject,
          classroomAttached: classroomAttachedFull,
          bookAttached: bookAttachedFull,
          isJoined, // Thêm field isJoined từ API classroom-view
          groupChapter: group_chapter,
          // Ưu tiên level lấy trực tiếp từ classroom/detail
          level: levelFromDetail ?? (data as any).level ?? "",
        };

        setCourseData(finalCourseData);

        // Fetch related courses if group_id is available
        if (data.groupId) {
          try {
            const levelForRelated =
              levelFromDetail ?? (data as any).level ?? "";
            const relatedResponse = await classroomService.getRelatedCourses({
              page: 1,
              limit: 20,
              group_id: data.groupId,
              classroom_id: data.id || courseId,
              level: levelForRelated ? String(levelForRelated) : "",
            });

            const relatedData =
              (relatedResponse as any)?.data?.data?.records ||
              (relatedResponse as any)?.data?.records ||
              (relatedResponse as any)?.data ||
              [];

            // Map API response to RelatedCourse format
            const mappedRelated: RelatedCourse[] = relatedData
              .filter((rc: any) => {
                // Filter out current course
                const rcId = rc._id || rc.id || "";
                return rcId !== data.id && rcId !== courseId;
              })
              .map((rc: any) => {
                // Get teacher name - handle object (most common case), array, or string
                let teacherName = "";
                if (rc?.teacher) {
                  if (
                    typeof rc.teacher === "object" &&
                    !Array.isArray(rc.teacher)
                  ) {
                    // Teacher is an object (most common case from API)
                    teacherName = rc.teacher.fullname || rc.teacher.name || "";
                  } else if (
                    Array.isArray(rc.teacher) &&
                    rc.teacher.length > 0
                  ) {
                    // Teacher is an array
                    teacherName =
                      rc.teacher[0]?.fullname || rc.teacher[0]?.name || "";
                  } else if (typeof rc.teacher === "string") {
                    // Teacher is a string
                    teacherName = rc.teacher;
                  }
                }
                // Fallback to other fields if teacher object/array doesn't have name
                if (!teacherName) {
                  teacherName =
                    rc?.teacher_fullname ||
                    rc?.teacherFullname ||
                    rc?.teacher_name ||
                    "";
                }

                // Get image
                const image = rc.image || rc.banner || "/imgs/logo.png";

                return {
                  id: rc._id || rc.id || "",
                  title: rc.name || rc.title || "",
                  teacher: teacherName,
                  image: image,
                  originalPrice: Number(rc.origin_price || rc.originPrice || 0),
                  salePrice: Number(rc.price || 0),
                  alias: rc.alias || rc._id || rc.id,
                } as RelatedCourse;
              });

            setRelatedCourses(mappedRelated);
          } catch (relatedErr) {
            console.error("Error fetching related courses:", relatedErr);
            setRelatedCourses([]);
          }
        } else {
          setRelatedCourses([]);
        }
      } catch (err) {
        console.error("CourseDataProvider: Error fetching course data:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchCourseData();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu khóa học...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center text-red-600">
          <p className="mb-2">Lỗi khi tải dữ liệu khóa học</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center text-gray-600">
          <p>Không tìm thấy dữ liệu khóa học</p>
        </div>
      </div>
    );
  }

  return <>{children({ ...courseData, relatedCourses })}</>;
}
