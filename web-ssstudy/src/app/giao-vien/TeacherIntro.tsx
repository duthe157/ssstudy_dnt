'use client';
import React, { useEffect, useState } from "react";
import { apiService } from '../../services/api';

interface TeamData {
  _id: string;
  title: string;
  content: string;
  images?: Array<{
    url: string;
  }>;
}

const TeacherIntro: React.FC = () => {
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const response = await apiService.post("teachers-team/detail", {});

        if (response?.data) {
          setTeamData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch team detail:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col-reverse md:flex-row items-center gap-6 md:gap-8 mb-6">
        <div className="w-full md:w-1/2 flex flex-col justify-start">
          <div className="mb-6 h-60 md:h-[390px]">
            <section className="max-w-3xl mx-auto px-4">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
              </div>
            </section>
          </div>
        </div>
        <div className="w-full md:w-1/2">
          <div className="w-full h-90 md:h-[400px] lg:h-[500px] bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  // Error or no data
  if (error || !teamData) {
    return null;
  }

  // Success
  return (
    <div className="flex flex-col-reverse md:flex-row items-center gap-6 md:gap-8 mb-6">
      <div className="w-full md:w-1/2 flex flex-col justify-start">
        <div className="mb-6 h-60 md:h-[390px]">
          <section className="max-w-3xl mx-auto px-4">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">
              {teamData.title || 'Đội ngũ giáo viên tại SSStudy'}
            </h1>
            <div
              className="text-gray-500 teacher-intro-content"
              dangerouslySetInnerHTML={{
                __html: teamData.content || ''
              }}
            />
          </section>
        </div>
      </div>
      <div className="w-full md:w-1/2">
        <img
          src={teamData.images?.[0]?.url || "/imgs/teacher/teacher-1.jpeg"}
          alt="Ảnh giáo viên"
          className="w-full h-90 md:h-[400px] lg:h-[500px] object-cover rounded-lg"
        />
      </div>
    </div>
  );
};

export default TeacherIntro;
