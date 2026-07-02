import React from "react";
import {
  Book as BookIcon,
  FileText,
  Clock,
  FilePlus,
  PlusSquare,
  Play,
  Image as ImageIcon,
  Link as LinkIcon,
  BarChart,
  Video,
  Star,
  Users,
  Menu,
  CheckSquare,
  ListChecks,
  Layers,
  Info,
  BookOpen,
  FolderPlus,
  Tag,
  Gift,
  Sparkles,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  Book: <BookIcon size={14} className="text-white" />,
  BookOpen: <BookOpen size={14} className="text-white" />,
  FileText: <FileText size={14} className="text-white" />,
  FilePlus: <FilePlus size={14} className="text-white" />,
  Clock: <Clock size={14} className="text-white" />,
  CheckSquare: <CheckSquare size={14} className="text-white" />,
  ListChecks: <ListChecks size={14} className="text-white" />,
  PlusSquare: <PlusSquare size={14} className="text-white" />,
  Play: <Play size={14} className="text-white" />,
  Menu: <Menu size={14} className="text-white" />,
  Image: <ImageIcon size={14} className="text-white" />,
  Video: <Video size={14} className="text-white" />,
  Link: <LinkIcon size={14} className="text-white" />,
  BarChart: <BarChart size={14} className="text-white" />,
  Info: <Info size={14} className="text-white" />,
  Star: <Star size={14} className="text-white" />,
  Users: <Users size={14} className="text-white" />,
  FolderPlus: <FolderPlus size={14} className="text-white" />,
  Layers: <Layers size={14} className="text-white" />,
  Tag: <Tag size={14} className="text-white" />,
  Gift: <Gift size={14} className="text-white" />,
  Sparkles: <Sparkles size={14} className="text-white" />,
  LuckyBag: <Gift size={14} className="text-white" />, // Fallback to Gift for LuckyBag
};

/**
 * Kiểm tra xem tag có nên hiển thị không.
 * Cả 3 status phải true: fast_gift.status, fast_gift.id.status, fast_gift.id.showTag
 */
export function shouldShowFastGiftTag(exam: any): boolean {
  const fg = exam?.fast_gift;
  if (!fg) return false;

  // Hỗ trợ cả boolean và string ("true")
  const isStatusActive = fg.status === true || fg.status === "true";
  if (!isStatusActive) return false;
  
  // Hỗ trợ cả cấu trúc dữ liệu phẳng và cấu trúc lồng id
  const hasShowTag = fg.showTag === true || fg.showTag === "true" || 
                    fg.id?.showTag === true || fg.id?.showTag === "true";
                    
  const isInnerStatusActive = fg.id 
    ? (fg.id.status === true || fg.id.status === "true") 
    : true;

  return hasShowTag && isInnerStatusActive;
}

/** Lấy thông tin tag (icon, name) từ fast_gift */
export function getFastGiftTagInfo(exam: any, dataSource: 'call_to_action' | 'tag' = 'tag'): {
  icon: React.ReactNode | null;
  name: string;
} {
  const fg = exam?.fast_gift;
  if (!fg) return { icon: null, name: "" };

  // Lấy dữ liệu theo dataSource: 'call_to_action' hoặc 'tag'
  const tagData = dataSource === 'tag'
    ? (fg.tag || fg.id?.tag)
    : (fg.call_to_action || fg.id?.tag);
  if (!tagData) return { icon: null, name: "" };

  const iconSrc = tagData.icon_src;
  const iconKey = tagData.icon || "";
  
  const resolvedIcon = iconSrc ? (
    <img src={iconSrc} alt="" className="w-3.5 h-3.5 object-contain" />
  ) : (
    iconMap[iconKey] || null
  );
  
  const name = tagData.text || tagData.name || "";

  return { icon: resolvedIcon, name };
}

interface FastGiftTagProps {
  exam: any;
  dataSource?: 'call_to_action' | 'tag';
}

const FastGiftTag: React.FC<FastGiftTagProps> = ({ exam, dataSource = 'tag' }) => {
  if (!shouldShowFastGiftTag(exam)) return null;

  const { icon, name } = getFastGiftTagInfo(exam, dataSource);
  if (!icon && !name) return null;

  return (
    <>
      <div
        className="absolute -top-5 -right-4 flex items-center gap-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border-2 border-white"
        style={{
          animation: "swingLeft 2s ease-in-out infinite",
          transformOrigin: "right center", 
          boxShadow: "0 4px 15px rgba(239, 68, 68, 0.5)",
          zIndex: 10, 
        }}
      >
        {icon}
        {name && <span className="pt-0.5">{name}</span>}
      </div>
      <style jsx>{`
        @keyframes swingLeft {
          0%,
          100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(-8deg);
          }
        }
      `}</style>
    </>
  );
};

export default FastGiftTag;
