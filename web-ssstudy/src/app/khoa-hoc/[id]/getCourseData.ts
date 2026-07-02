import { courseService } from "@/services/courseService";
import { ClassroomDetailResponse } from "@/types/course";

// Lấy dữ liệu khóa học từ API classroom/detail (Server-side)
// getCourseData(...)
export async function getCourseData(id: string) {
  try {
    // Call classroom/detail API
    const response: ClassroomDetailResponse =
      await courseService.classroomDetail({
        id,
      });

    if (response.code === 200 && response.data) {
      const { classroom } = response.data;
      // Lấy classroom_attached từ data level (có thể là object đầy đủ) hoặc từ classroom (chỉ là ID)
      const classroomAttachedIds = classroom.classroom_attached || [];
      const classroomAttachedFull =
        (response.data as any).classroomAttached || [];
      // Nếu có dữ liệu đầy đủ ở data level thì dùng, nếu không thì dùng ID
      const classroomAttached =
        classroomAttachedFull.length > 0
          ? classroomAttachedFull
          : classroomAttachedIds;

      // Lấy book_attached từ data level (có thể là object đầy đủ) hoặc từ classroom (chỉ là ID)
      const bookAttachedIds = classroom.book_attached || [];
      const bookAttachedFull = (response.data as any).bookAttached || [];
      // Nếu có dữ liệu đầy đủ ở data level thì dùng, nếu không thì dùng ID
      const bookAttached =
        bookAttachedFull.length > 0 ? bookAttachedFull : bookAttachedIds;

      // Helper: sanitize image string that may contain backticks/whitespace
      const sanitizeImageUrl = (s?: string) =>
        (s ? s.replace(/[`"]/g, "").trim() : "") || "";

      // Lấy teacher từ classroom.teacher (là array trong API mới)
      const teacherArray = Array.isArray(classroom.teacher)
        ? classroom.teacher
        : [];
      const teacher = teacherArray.length > 0 ? teacherArray[0] : null;

      return {
        id: classroom._id,
        title: classroom.name,
        description: classroom.description || "",
        image:
          sanitizeImageUrl(classroom.image) ||
          classroom.banner ||
          `/imgs/logo.png`,
        teacher: teacher?.fullname || "Giáo viên",
        teacherAvatar: teacher?.avatar,
        price: classroom.price,
        originPrice: classroom.origin_price,
        subject: classroom.subject?.name || "Môn học",
        group: classroom.group?.name || "Nhóm học",
        code: classroom.code,
        alias: classroom.alias,
        timeCourse: classroom.time_course,
        content: classroom.content,
        updatedAt: classroom.updated_at,
        numStudent: classroom.num_student,
        classroomAttached,
        bookAttached,
        // NEW: map extra fields
        promotion: classroom.promotion,
        includes: classroom.includes || [],
        highlightInformations: classroom.highlightInformations || [],
        studentOwned: classroom.student_owned ?? 0,
        groupId: classroom.group?.id || "",
      };
    }

    // Fallback nếu API không thành công
    return {
      id,
      title: `Khóa học ${id}`,
      description: `Khóa học luyện thi chuyên sâu với phương pháp độc quyền, giúp học sinh nắm vững kiến thức và đạt điểm cao trong kỳ thi.`,
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
    };
  } catch (error) {
    // Fallback nếu có lỗi
    return {
      id,
      title: `Khóa học ${id}`,
      description: `Khóa học luyện thi chuyên sâu với phương pháp độc quyền, giúp học sinh nắm vững kiến thức và đạt điểm cao trong kỳ thi.`,
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
    };
  }
}

// Client-side version để gọi API từ browser
// getCourseDataClient(...)
export async function getCourseDataClient(id: string) {
  try {
    // Call classroom/detail API
    const response: ClassroomDetailResponse =
      await courseService.classroomDetail({
        id,
      });

    if (response.code === 200 && response.data) {
      const { classroom } = response.data;
      // Lấy classroom_attached từ data level (có thể là object đầy đủ) hoặc từ classroom (chỉ là ID)
      const classroomAttachedIds = classroom.classroom_attached || [];
      const classroomAttachedFull =
        (response.data as any).classroomAttached || [];
      // Nếu có dữ liệu đầy đủ ở data level thì dùng, nếu không thì dùng ID
      const classroomAttached =
        classroomAttachedFull.length > 0
          ? classroomAttachedFull
          : classroomAttachedIds;

      // Lấy book_attached từ data level (có thể là object đầy đủ) hoặc từ classroom (chỉ là ID)
      const bookAttachedIds = classroom.book_attached || [];
      const bookAttachedFull = (response.data as any).bookAttached || [];
      // Nếu có dữ liệu đầy đủ ở data level thì dùng, nếu không thì dùng ID
      const bookAttached =
        bookAttachedFull.length > 0 ? bookAttachedFull : bookAttachedIds;

      const sanitizeImageUrl = (s?: string) =>
        (s ? s.replace(/[`"]/g, "").trim() : "") || "";

      // Lấy teacher từ classroom.teacher (là array trong API mới)
      const teacherArray = Array.isArray(classroom.teacher)
        ? classroom.teacher
        : [];
      const teacher = teacherArray.length > 0 ? teacherArray[0] : null;

      return {
        id: classroom._id,
        title: classroom.name,
        description: classroom.description || "",
        image:
          sanitizeImageUrl(classroom.image) ||
          classroom.banner ||
          `/imgs/logo.png`,
        teacher: teacher?.fullname || "Giáo viên",
        teacherAvatar: teacher?.avatar,
        price: classroom.price,
        originPrice: classroom.origin_price,
        subject: classroom.subject?.name || "Môn học",
        group: classroom.group?.name || "Nhóm học",
        code: classroom.code,
        alias: classroom.alias,
        timeCourse: classroom.time_course,
        content: classroom.content,
        updatedAt: classroom.updated_at,
        numStudent: classroom.num_student,
        classroomAttached,
        bookAttached,
        // NEW
        promotion: classroom.promotion,
        includes: classroom.includes || [],
        highlightInformations: classroom.highlightInformations || [],
        studentOwned: classroom.student_owned ?? 0,
        groupId: classroom.group?.id || "",
      };
    }

    // Fallback nếu API không thành công
    return {
      id,
      title: `Khóa học ${id}`,
      description: `Khóa học luyện thi chuyên sâu với phương pháp độc quyền, giúp học sinh nắm vững kiến thức và đạt điểm cao trong kỳ thi.`,
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
    };
  } catch (error) {
    // Fallback nếu có lỗi
    return {
      id,
      title: `Khóa học ${id}`,
      description: `Khóa học luyện thi chuyên sâu với phương pháp độc quyền, giúp học sinh nắm vững kiến thức và đạt điểm cao trong kỳ thi.`,
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
    };
  }
}
