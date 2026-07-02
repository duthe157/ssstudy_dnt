'use client';

import React from 'react';

interface TeachingStaffProps {
  items?: any[];
}

const TeachingStaff: React.FC<TeachingStaffProps> = ({ items }) => {
  if (!items) return null;
  
  return (
    <section className="py-10">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Đội ngũ giảng viên</h2>
        {/* Nội dung thực tế sẽ được sao chép từ file TeachingStaff/Index.js gốc */}
      </div>
    </section>
  );
};

export default TeachingStaff; 