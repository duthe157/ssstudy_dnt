'use client';

import React from 'react';

interface StatisticalProps {
  items?: any[];
}

const Statistical: React.FC<StatisticalProps> = ({ items }) => {
  if (!items) return null;
  
  return (
    <section className="py-10">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Thông số thống kê</h2>
        {/* Nội dung thực tế sẽ được sao chép từ file Statistical/Index.js gốc */}
      </div>
    </section>
  );
};

export default Statistical; 