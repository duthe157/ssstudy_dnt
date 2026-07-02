"use client";

import React, { useEffect, useRef } from "react";

interface VideoDisplayProps {
  videoType: "youtube" | "selfHosted";
  videoSrc: string;
}

const getYouTubeEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  let videoId = "";
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\\&v=)([^#\\&\\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    videoId = match[2];
  } else {
    return null;
  }
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
};
const VideoDisplay: React.FC<VideoDisplayProps> = ({ videoType, videoSrc }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Xác định URL để embed
  const embedUrl =
    videoType === "youtube" ? getYouTubeEmbedUrl(videoSrc) : null;

  // Kiểm tra xem có thể hiển thị video hay không
  const canShowVideo =
    (videoType === "youtube" && embedUrl) ||
    (videoType === "selfHosted" && videoSrc);

  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    };
  }, []);

  if (!canShowVideo) {
    // Không hiển thị gì nếu không có video hợp lệ
    return null;
  }

  return (
    <div className="w-[90vw] xl:w-[60vw]">
      <div className="aspect-video">
        {/* Chỉ render player khi modal được mở */}
        {videoType === "youtube" && embedUrl && (
          <iframe
            width="100%"
            height="100%"
            src={embedUrl}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        )}
        {videoType === "selfHosted" && (
          <video ref={videoRef} width="100%" height="100%" controls autoPlay>
            <source src={videoSrc} type="video/mp4" />
            <track
              kind="captions"
              src=""
              srcLang="en"
              label="English captions"
              default
            />
            Trình duyệt của bạn không hỗ trợ video tag.
          </video>
        )}
      </div>
    </div>
  );
};

export default VideoDisplay;
