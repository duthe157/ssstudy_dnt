'use client';

import React from 'react';

interface AchievementBoardProps {
  items?: any[];
}

const AchievementBoard: React.FC<AchievementBoardProps> = ({ items }) => {
  if (!items) return null;
  
  return (
    <section className="py-10">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Bảng thành tích</h2>
        {/* Nội dung thực tế sẽ được sao chép từ file AchievementBoard.js gốc */}
      </div>
    </section>
  );
};

export default AchievementBoard; 