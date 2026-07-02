"use client";

import React from "react";

interface CourseHighlight {
  id: number | string;
  text: string;
}

interface CourseHighlightsGridProps {
  highlights: CourseHighlight[];
}

export default function CourseHighlightsGrid({
  highlights,
}: CourseHighlightsGridProps) {
  if (!highlights || highlights.length === 0) {
    return null;
  }

  return (
    <div className="highlights-section">
      <div className="highlights-grid-2col">
        {highlights.map((item) => (
          <div key={item.id} className="highlight-item">
            <div className="highlight-item-icon">
              <img src="/icon/ic_dautich.svg" alt="highlight" />
            </div>
            <div className="highlight-item-content">
              <p>{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
