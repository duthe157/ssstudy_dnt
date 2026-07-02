import { ReactNode } from 'react';

interface CommunityCardProps {
  icon: ReactNode;
  platform: string;
  members: number;
}

export default function CommunityCard({ icon, platform, members }: CommunityCardProps) {
  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-2 mb-2 text-blue-600 font-semibold">
        {icon}
        <span>{platform}</span>
      </div>
      <h3 className="font-bold text-lg mb-2">Cộng đồng học tập của SSStudy</h3>
      <p className="text-sm text-gray-600 mb-4">
        Chia sẻ phương pháp học tập hiệu quả và hữu ích, tham gia ngay để nhận được những tip học hành nhanh nhất và bám sát đề thi nhất.
      </p>
      <div className="text-sm text-gray-500 flex items-center gap-1">
        <span>👥</span>
        {members.toLocaleString()} thành viên
      </div>
    </div>
  );
}
