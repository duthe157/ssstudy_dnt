import { BookHighlight } from "./types";
import {
  Book as BookIcon,
  CheckCircle,
  FileText,
  Star,
  Gift,
  Circle,
} from "lucide-react";

interface BookHighlightsGridProps {
  highlights: BookHighlight[];
}

export default function BookHighlightsGrid({
  highlights,
}: BookHighlightsGridProps) {
  return (
    <div className="highlights-section">
      <div className="highlights-grid-2col">
        {highlights.map((item) => (
          <div key={item.id} className="highlight-item">
            <div className="highlight-item-icon">
              {typeof item.icon === "string" && /\//.test(item.icon) ? (
                <img src={item.icon} alt="highlight" />
              ) : (
                // Map iconKey -> lucide icon
                (() => {
                  const key = String(item.icon || "").toLowerCase();
                  if (key === "book")
                    return <BookIcon size={18} className="text-blue-600" />;
                  if (
                    key === "check" ||
                    key === "checkcircle" ||
                    key === "tick"
                  )
                    return <CheckCircle size={18} className="text-green-600" />;
                  if (key === "file" || key === "filetext")
                    return <FileText size={18} className="text-gray-600" />;
                  if (key === "star")
                    return <Star size={18} className="text-yellow-500" />;
                  if (key === "gift")
                    return <Gift size={18} className="text-pink-500" />;
                  return <Circle size={14} className="text-gray-400" />;
                })()
              )}
            </div>
            <div className="highlight-item-content">
              <h4>{item.title}</h4>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
