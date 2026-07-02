// BookDetailHighlights.tsx - Grid hiển thị tất cả điểm nổi bật

import { BookHighlight } from "./types";
import HighlightCard from "./HighlightCard";

interface BookDetailHighlightsProps {
  highlights: BookHighlight[];
  title?: string;
}

export default function BookDetailHighlights({
  highlights,
  title = "Điểm nổi bật của sách",
}: BookDetailHighlightsProps) {
  if (!highlights || highlights.length === 0) {
    return null;
  }

  return (
    <section className="book-highlights-section">
      {/* Section Title */}
      <h2 className="section-title">{title}</h2>

      {/* Highlights Grid */}
      <div className="highlights-grid">
        {highlights.map((highlight) => (
          <HighlightCard key={highlight.id} highlight={highlight} />
        ))}
      </div>
    </section>
  );
}
