'use client';
import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';

interface HighlightItem {
  _id: string;
  title: string;
  description: string;
  image?: {
    url: string;
  };
}

export default function TeacherHighlights() {
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const response = await apiService.post('teachers-team/detail', {});

        if (response?.data?.highlights) {
          setHighlights(response.data.highlights);
        } else {
          setHighlights([]);
        }
      } catch (error) {
        console.error('Failed to fetch highlights:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchHighlights();
  }, []);

  if (loading) {
    return (
      <div className="px-4 mt-[65%] md:mt-0 md:py-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm p-6 text-left border border-gray-100 flex-1 animate-pulse"
            >
              <div className="h-16 w-16 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || highlights.length === 0) {
    return (
      <div className="px-4 mt-[65%] md:mt-0 md:py-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
          <div className="text-center w-full text-gray-500">
            <p>Hiện chưa có thông tin nổi bật của đội ngũ giáo viên.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 mt-[65%] md:mt-0 md:py-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
        {highlights.map((item) => (
          <div
            key={item._id}
            className="bg-white rounded-lg shadow-sm p-6 text-left border border-gray-100 flex-1"
          >
            <img
              src={item?.image?.url || '/icon/placeholder.svg'}
              alt={item.title}
              className="mb-4 h-16 w-16 object-contain"
            />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {item.title}
            </h3>
            <p className="text-sm text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
