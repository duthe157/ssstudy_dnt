import { bookidService } from "@/services/bookidService";
import { apiService } from "@/services/api";

// Helper: sanitize image string that may contain backticks/whitespace
const sanitizeImageUrl = (s?: string) =>
  (s ? s.replace(/[`"]/g, "").trim() : "") || "";

// Map response từ API book-id-course/detail thành CourseData
function mapCourseResponse(responseData: any, fallbackId: string) {
  const course = responseData?.course || responseData?.classroom || responseData;
  const isBought = responseData?.isBought ?? responseData?.is_bought ?? false;
  const userBookDetail = responseData?.userBookDetail || null;

  if (!course || (!course._id && !course.id && !responseData.id && !responseData._id)) return null;

  const teacherObj = course.teacher_obj || (Array.isArray(course.teacher) ? course.teacher[0] : course.teacher) || null;

  return {
    id: course._id || course.id || fallbackId,
    title: course.name || course.title || course.course_name || "",
    description: course.description || "",
    image: sanitizeImageUrl(course.image) || course.banner || `/imgs/logo.png`,
    teacher: teacherObj?.fullname || teacherObj?.name || "Giáo viên",
    teacherAvatar: teacherObj?.avatar,
    teacherObject: teacherObj,
    price: course.price ?? 0,
    originPrice: course.origin_price ?? 0,
    subject: course.subject?.name || "Môn học",
    group: course.group?.name || "Nhóm học",
    code: course.code || "",
    alias: course.alias || "",
    level: course.level || "",
    timeCourse: course.time_course,
    content: course.content || "",
    updatedAt: course.updated_at,
    numStudent: course.num_student ?? 0,
    classroomAttached: course.classroom_attached || [],
    bookAttached: course.book_attached || [],
    promotion: course.promotion,
    includes: course.includes || [],
    highlightInformations: course.highlightInformations || [],
    studentOwned: course.student_owned ?? 0,
    groupId: course.group_id || course.group?.id || "",
    groupChapter: course.group_chapter || [],
    isBought,
    activationDate: userBookDetail?.activation_date || null,
    expiredDate: userBookDetail?.exprired_date || null,
    totalExtendedMonths: userBookDetail?.total_extended_months || 0,
    extendTimes: userBookDetail?.extend_times || 0,
    bookId: 
      userBookDetail?.bookIdCourse?.id || 
      userBookDetail?.bookIdCourse?._id ||
      course?._from_book_id ||
      userBookDetail?.book_id || 
      responseData?.book_id || 
      responseData?.bookId || 
      responseData?.book?._id || 
      responseData?.book_info?._id ||
      course?.book_id || 
      course?.bookId ||
      "",
  };
}

// Fallback data khi API không thành công
function getFallbackCourseData(id: string) {
  return {
    id,
    title: id,
    description: "",
    image: `/imgs/logo.png`,
    teacher: "Giáo viên",
    price: 0,
    originPrice: 0,
    subject: "Môn học",
    group: "Nhóm học",
    code: "",
    alias: "",
    content: "",
    updatedAt: new Date().toISOString(),
    numStudent: 0,
    classroomAttached: [],
    bookAttached: [],
    groupId: "",
  };
}

// Lấy dữ liệu khóa học (Server-side) - dùng cho metadata SEO
// Gọi API không cần auth token qua apiService (giống classroom/detail)
export async function getCourseData(id: string) {
  try {
    // Thêm Auth Token từ Cookies nếu ở Server để đảm bảo lấy được dữ liệu chính xác
    let headers = {};
    if (typeof window === "undefined") {
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const userCookie = cookieStore.get("SSSTUDY_USER")?.value;
        if (userCookie) {
          const userData = JSON.parse(userCookie);
          if (userData.token) headers = { Authorization: userData.token };
        } else {
          const token = cookieStore.get("token")?.value;
          if (token) headers = { Authorization: token };
        }
      } catch {}
    }

    const response: any = await apiService.post(
      "/book-id-course/detail",
      { id },
      { headers }
    );
    const respData = response?.data ?? response ?? null;

    if (respData?.course || respData?.classroom) {
      const mapped = mapCourseResponse(respData, id);
      if (mapped && mapped.title) return mapped;
    }

    // Nếu API book-id-course không có, thử gọi API classroom/detail truyền thống
    const standardResp: any = await apiService.post(
      "/classroom/detail",
      { id },
      { headers }
    );
    const standardData = standardResp?.data ?? standardResp ?? null;
    if (standardData?.classroom || standardData?.course) {
      const mapped = mapCourseResponse(standardData, id);
      if (mapped && mapped.title) return mapped;
    }

    return getFallbackCourseData(id);
  } catch (err) {
    return getFallbackCourseData(id);
  }
}

// Client-side version để gọi API từ browser
export async function getCourseDataClient(id: string) {
  try {
    const response = await bookidService.getBookCourseDetail(id);
    const respData = response?.data?.data ?? response?.data ?? null;

    if (respData?.course || respData?.classroom) {
      const mapped = mapCourseResponse(respData, id);
      if (mapped && mapped.title) return mapped;
    }

    return getFallbackCourseData(id);
  } catch (error) {
    console.error("getCourseDataClient error:", error);
    return getFallbackCourseData(id);
  }
}
