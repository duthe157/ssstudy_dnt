// TeacherInfo.tsx - Thông tin giảng viên

import Link from "next/link";
import Image from "next/image";
import { Teacher } from "./types";

interface TeacherInfoProps {
  teacher: Teacher;
  compact?: boolean; // Hiển thị gọn hay đầy đủ
}

export default function TeacherInfo({
  teacher,
  compact = true,
}: TeacherInfoProps) {
  return (
    <div className="teacher-info">
      <div className="teacher-avatar" style={{ width: "40px", height: "40px" }}>
        {teacher.avatar ? (
          <Image
            src={teacher.avatar}
            alt={teacher.name}
            width={80}
            height={80}
            quality={95}
            className="avatar-img"
            style={{
              imageRendering: "-webkit-optimize-contrast",
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div className="avatar-placeholder">{teacher.name.charAt(0)}</div>
        )}
      </div>

      <div className="teacher-details">
        <div className="teacher-label">Giảng viên</div>
        <Link href={teacher.url} className="teacher-name">
          {teacher.name}
        </Link>

        {!compact && teacher.bio && (
          <p className="teacher-bio">{teacher.bio}</p>
        )}
      </div>
    </div>
  );
}
