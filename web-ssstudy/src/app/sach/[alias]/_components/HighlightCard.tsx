// HighlightCard.tsx - Card đơn lẻ hiển thị 1 điểm nổi bật

import { BookHighlight } from "./types";

interface HighlightCardProps {
  highlight: BookHighlight;
}

export default function HighlightCard({ highlight }: HighlightCardProps) {
  return (
    <div className="highlight-card">
      <div className="highlight-icon">{highlight.icon}</div>
      <h3 className="highlight-title">{highlight.title}</h3>
      <p className="highlight-description">{highlight.description}</p>
    </div>
  );
}
