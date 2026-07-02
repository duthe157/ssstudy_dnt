"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";

const DifferenceValueAt = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // List of images from gia-tri-khac-biet folder
  const carouselImages = [
    "/imgs/gia-tri-khac-biet/1-20250425024730-9sy1n.png",
    "/imgs/gia-tri-khac-biet/2-20250425024730-dfvyw.png",
    "/imgs/gia-tri-khac-biet/3-20250425024730-uoi7t.png",
    "/imgs/gia-tri-khac-biet/4-20250425024730-aleva.png",
    "/imgs/gia-tri-khac-biet/2-9-20240613054703-gciej.png",
    "/imgs/gia-tri-khac-biet/3-5-20240613054703-dnwqd.png",
    "/imgs/gia-tri-khac-biet/4-3-20240613054655-psx-d.png",
    "/imgs/gia-tri-khac-biet/5-4-20240613054655-2q_vi.png",
    "/imgs/gia-tri-khac-biet/6-3-20240613054654-ahsyw.png",
    "/imgs/gia-tri-khac-biet/7-1-20240613054654-asvs8.png",
    "/imgs/gia-tri-khac-biet/8-1-20240613054654-s21-z.png",
    "/imgs/gia-tri-khac-biet/9-1-20240613054654-vs8pw.png",
    "/imgs/gia-tri-khac-biet/10-20240613054654-ezhbs.png",
    "/imgs/gia-tri-khac-biet/11-20240613054654-0kgr1.png",
    "/imgs/gia-tri-khac-biet/12-20240613054654-3enwn.png",
  ];

  // Navigate to specific image
  const goToImage = useCallback((index: number) => {
    let newIndex = index;
    if (index < 0) newIndex = carouselImages.length - 1;
    if (index >= carouselImages.length) newIndex = 0;
    setCurrentImageIndex(newIndex);
  }, [carouselImages.length]);

  // Auto slide every 3 seconds
  useEffect(() => {
    const startAutoSlide = () => {
      autoSlideRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
      }, 3000);
    };

    startAutoSlide();

    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    };
  }, [carouselImages.length]);

  // Reset auto slide timer when image changes manually
  const resetAutoSlide = useCallback(() => {
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
    }
    autoSlideRef.current = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 3000);
  }, [carouselImages.length]);

  // Mouse/Touch event handlers for dragging
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
    setTranslateX(0);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const diff = clientX - startX;
    setTranslateX(diff);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

   
    if (translateX > 50) {
      goToImage(currentImageIndex - 1);
      resetAutoSlide();
    } else if (translateX < -50) {
      goToImage(currentImageIndex + 1);
      resetAutoSlide();
    }
    setTranslateX(0);
  };

  const features = [
    {
      icon: "/icon/ic_luyen thi 26.svg",
      bgColor: "bg-[#FEECEB]",
      title: "Đội ngũ giáo viên tâm huyết, uy tín",
      description:
        "SSStudy quy tụ đội ngũ giáo viên giỏi chuyên môn, giàu kinh nghiệm luyện thi thực chiến, trực tiếp xây dựng chương trình và đồng hành cùng học sinh. Ở SSStudy, giáo viên không chỉ chữa bài mà dẫn dắt cách nghĩ, cách làm và tối ưu bài thi.",
    },
    {
      icon: "/icon/ic_ĐGNL.svg",
      bgColor: "bg-[#E9EFFA]",
      title: "Phương pháp COD - Làm chủ mọi dạng bài",
      description:
        "Phương pháp COD giúp học sinh hiểu bản chất bài toán, biết cách phân tích đề và xử lý linh hoạt các dạng bài mới. Nhờ đó, học sinh không phụ thuộc học tủ hay mẹo máy móc, mà đủ năng lực ứng phó với mọi biến hóa của đề thi.",
        isLarge: true,
    },
    {
      icon: "/imgs/home/video-play.svg",
      bgColor: "bg-[#E9EFFA]",
      title: "Hình thức & khóa học đa dạng",
      description:
        "SSStudy cung cấp các khóa học online và offline, cùng hệ thống chương trình luyện thi đa dạng như ĐGNL, ĐGTD và Kỳ thi TN THPTQG. Mỗi khóa học được thiết kế lộ trình, phương pháp và cách hỗ trợ phù hợp, giúp học sinh lựa chọn đúng mục tiêu và đạt hiệu quả thực chất.",
    },
    {
      icon: "/icon/ic_sach luyen thi.svg",
      bgColor: "bg-[#EEF9ED]",
      title: "Tài liệu học tập độc quyền - Cá nhân hóa theo năng lực",
      description:
        "Hệ thống bài giảng và tài liệu giảng dạy được thiết kế độc quyền, phân tầng theo trình độ, mục tiêu và giai đoạn học tập. Từ đó giúp học sinh học đúng trọng tâm, đúng mức độ và đúng thời điểm.",
    },
    {
      icon: "/imgs/home/study-method.svg",
      bgColor: "bg-[#EEF9ED]",
      title: "Đồng hành sát sao trong suốt quá trình học",
      description:
        "Giáo viên và trợ giảng theo sát tiến độ, hỗ trợ kịp thời và giải đáp khi học sinh gặp khó khăn. Tôn chỉ của SSStudy: “Không có học sinh nào bị bỏ lại phía sau”",
    },
    {
      icon: "/icon/ic_toan dien.svg",
      bgColor: "bg-[#E9EFFA]",
      title: "Hiệu quả học tập được đo lường rõ ràng",
      description:
        "SSStudy theo dõi tiến bộ học tập thông qua sổ liên lạc điện tử, được cập nhật hàng ngày/hàng tuần/hàng tháng. Kết quả học tập được báo cáo minh bạch và lộ trình được điều chỉnh kịp thời khi cần thiết.",
    },
  ];

  return (
    <div className="bg-white py-16">
      {/* Container matching achievement-board exactly to ensure 100% alignment */}
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        {/* Header - Centered */}
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Giá trị khác biệt tại SSStudy
        </h1>

        {/* Layout section - Justify between pushes content to the edges of the 1440px container */}
        <div className="flex flex-col lg:flex-row justify-between items-start w-full gap-8 lg:gap-12">

          {/* Left Column: Image carousel - reduced width and shifted left */}
          <div className="w-full lg:w-[38%] flex-shrink-0 flex flex-col justify-start lg:sticky lg:top-8 lg:-ml-20">
            <div
              ref={imageContainerRef}
              className="relative cursor-grab active:cursor-grabbing select-none w-full overflow-hidden rounded-2xl"
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
            >
              <div
                className="relative block w-full"
                  style={{
                    transform: `translateX(${translateX}px) scale(${isDragging ? 0.98 : 1})`,
                    opacity: isDragging ? 0.9 : 1,
                    transition: isDragging 
                      ? "none" 
                      : "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-in-out",
                  }}
                >
                  <img
                    src={carouselImages[currentImageIndex]}
                    alt={`Giá trị khác biệt ${currentImageIndex + 1}`}
                    className="block w-full h-auto pointer-events-none"
                    draggable={false}
                    style={{
                      transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  />
                </div>
              </div>
            
            {/* Carousel dots */}
            <div className="flex gap-1.5 mt-6 flex-wrap justify-center w-full">
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentImageIndex(index);
                    resetAutoSlide();
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentImageIndex
                      ? "bg-[#235CD0] w-6"
                      : "bg-gray-200 hover:bg-gray-300 w-2"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Accordion tabs - further enlarged width */}
          <div className="w-full lg:w-[71%] flex-shrink-0 flex flex-col gap-3">
            {features.map((feature, index) => (
              <div
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`cursor-pointer bg-white rounded-lg border transition-all duration-300 overflow-hidden ${
                  activeIndex === index
                    ? "border-[#235CD0] shadow-md"
                    : "border-[#E8E8E8] hover:border-[#235CD0] hover:shadow-sm"
                }`}
              >
                {/* Tab header */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg ${feature.bgColor} flex items-center justify-center shrink-0`}
                    >
                     <img
                        src={feature.icon}
                        alt={feature.title}
                        className={`w-8 h-8 transition-transform ${feature.isLarge ? "scale-125" : ""}`}
                      />
                    </div>
                    <h3 className="text-base font-medium text-[#242A4B]">
                      {feature.title}
                    </h3>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform duration-300 shrink-0 ${
                      activeIndex === index ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                {/* Tab content - expanded */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    activeIndex === index
                      ? "max-h-40 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-4 pb-4 pl-[68px]">
                    <p className="text-[#666666] text-sm leading-relaxed text-justify">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DifferenceValueAt;
