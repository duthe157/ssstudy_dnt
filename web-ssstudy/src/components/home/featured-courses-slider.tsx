'use client';

import React from 'react';

interface FeaturedCoursesSliderProps {
  data?: any;
}

const FeaturedCoursesSlider: React.FC<FeaturedCoursesSliderProps> = ({ data }) => {
  if (!data) return null;
  
  return (
    <section className="py-10 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Các khóa học nổi bật</h2>
        {/* Nội dung thực tế sẽ được sao chép từ file FeaturedCoursesSlider.js gốc */}
      </div>
    </section>
  );
};

export default FeaturedCoursesSlider; 