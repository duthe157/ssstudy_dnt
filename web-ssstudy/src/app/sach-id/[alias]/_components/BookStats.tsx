// BookStats.tsx - Thống kê sách (cập nhật, học viên, đánh giá)

import { BookStats as BookStatsType } from "./types";
import { formatDate, formatNumber } from "./utils";

interface BookStatsProps {
  stats: BookStatsType;
}

export default function BookStats({ stats }: BookStatsProps) {
  const studentCount = stats.studentCount;
  const hasStudentCount =
    typeof studentCount === "number" && !Number.isNaN(studentCount);

  return (
    <div className="book-stats">
      {/* Cập nhật lần cuối */}
      <div className="stat-item">
        <span className="stat-icon">🔄</span>
        <div className="stat-content">
          <span className="stat-label">Cập nhật</span>
          <span className="stat-value">{formatDate(stats.lastUpdate)}</span>
        </div>
      </div>

      {/* Số học viên */}
      {hasStudentCount && (
        <div className="stat-item">
          <span className="stat-icon">👥</span>
          <div className="stat-content">
            <span className="stat-label">Học viên</span>
            <span className="stat-value">
              {formatNumber(studentCount as number)}
            </span>
          </div>
        </div>
      )}

      {/* Đánh giá */}
      {/* {stats.rating && (
        <div className="stat-item">
          <span className="stat-icon">⭐</span>
          <div className="stat-content">
            <span className="stat-label">Đánh giá</span>
            <span className="stat-value">
              {stats.rating.toFixed(1)}
              {stats.reviewCount && (
                <span className="stat-count"> ({stats.reviewCount})</span>
              )}
            </span>
          </div>
        </div>
      )} */}
    </div>
  );
}
