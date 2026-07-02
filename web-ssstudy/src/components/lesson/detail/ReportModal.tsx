import { Button, Input, Textarea, Typography } from "@/components/ui";
import { useDialog } from "@/contexts/DialogProvider";
import { authService } from "@/services/authService";
import { reportService } from "@/services/reportService";
import { Result } from "@/services/lessonService";
import React, { useState } from "react";
import { toast } from "react-toastify";

interface ReportModalProps {
  currentLesson: Result | null;
  classroomId: string;
}

export const ReportModal = ({ currentLesson, classroomId }: ReportModalProps) => {
  const { closeCurrent } = useDialog();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    // Validate trường trống
    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (!content.trim()) {
      toast.error("Vui lòng nhập nội dung", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // Lấy thông tin user
    const currentUser = authService.getCurrentUser() as {
      phone?: string;
      [key: string]: unknown;
    } | null;
    const userPhone = currentUser?.phone || "";

    if (!userPhone) {
      toast.error("Không tìm thấy thông tin số điện thoại", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (!currentLesson?._id) {
      toast.error("Không tìm thấy thông tin bài học", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        content: content,
        object_id: currentLesson._id,
        object_type: "CATEGORY_VIDEO",
        phone: userPhone,
        classroom_id: classroomId,
      };

      const response = await reportService.createBugReport(payload);

      if (response.code === 200) {
        toast.success(response.message || "Gửi báo cáo thành công!", {
          position: "top-right",
          autoClose: 3000,
        });
        closeCurrent();
      } else {
        toast.error(response.message || "Gửi báo cáo thất bại", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Có lỗi xảy ra khi gửi báo cáo";
      console.error("Error creating bug report:", error);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-w-[280px] sm:w-[400px] md:w-[500px] space-y-4">
      <Typography variant={"lg24"} className="font-bold">
        Báo lỗi
      </Typography>
      <Input 
        placeholder="Tiêu đề" 
        className="w-full"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isLoading}
      />
      <Textarea 
        placeholder="Nội dung" 
        className="w-full min-h-[120px] resize-none"
        rows={5}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isLoading}
      />
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
        <Button 
          variant={"outline"} 
          onClick={closeCurrent}
          className="w-full sm:w-auto min-h-[44px]"
          disabled={isLoading}
        >
          Đóng
        </Button>
        <Button 
          className="text-white w-full sm:w-auto min-h-[44px]"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Đang gửi..." : "Gửi báo cáo"}
        </Button>
      </div>
    </div>
  );
};
