import React, { useState, useEffect, useRef, useMemo } from "react";

const ReviewData = ({ reviewData }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState("next");
  const timerRef = useRef(null);
  const lastInteractionRef = useRef(Date.now());
  const [avatarIndexes, setAvatarIndexes] = useState([]);
  const [avatarPositions, setAvatarPositions] = useState([]);
  const positionsRef = useRef([]);
  const reviewsRef = useRef([]);
  const touchStartXRef = useRef(null);
  const touchEndXRef = useRef(null);
  const slideContainerRef = useRef(null);

  const reviews = useMemo(() => {
    if (reviewData && reviewData.length > 0) {
      const filtered = reviewData
        .filter((review) => review.type === "DANHGIA_HOCSINH")
        .map((review) => ({
          id: review._id,
          name: review.name,
          school: "THPT Quốc Oai, Hà Nội",
          avatar: review.image,
          content: review.content,
          rating: Math.random() < 0.5 ? 4.5 : 5,
        }));
      reviewsRef.current = filtered;
      return filtered;
    }
    return [];
  }, [reviewData]);

  const generateEvenPositions = () => {
    if (
      positionsRef.current.length > 0 &&
      positionsRef.current.length === reviews.length
    ) {
      return positionsRef.current;
    }

    const positions = [];

    if (!reviews || reviews.length === 0) {
      return positions;
    }

    const totalAvatars = reviews.length;
    const leftAvatars = Math.ceil(totalAvatars / 2);
    const rightAvatars = totalAvatars - leftAvatars;

    const animations = [
      "animate-float",
      "animate-float-slow",
      "animate-float-reverse",
      "animate-pulse",
    ];

    const safeMargin = 5;
    const maxVerticalPosition = 70;
    const minVerticalPosition = 20;

    const verticalStepLeft =
      (maxVerticalPosition - minVerticalPosition) /
      (leftAvatars <= 1 ? 1 : leftAvatars - 1);
    const verticalStepRight =
      (maxVerticalPosition - minVerticalPosition) /
      (rightAvatars <= 1 ? 1 : rightAvatars - 1);

    for (let i = 0; i < leftAvatars; i++) {
      const size = 70 + (i % 3) * 10;

      const avatarSizePercent = (size / 1200) * 100;

      const safeHorizontalOffset = safeMargin + avatarSizePercent / 2;

      const verticalSizeOffset = ((size / 1200) * 100) / 2;
      let verticalPosition = minVerticalPosition + verticalStepLeft * i;

      if (verticalPosition + verticalSizeOffset > maxVerticalPosition) {
        verticalPosition = maxVerticalPosition - verticalSizeOffset;
      }

      const horizontalOffset = safeHorizontalOffset + (i % 5);

      positions.push({
        side: "left",
        top: `${verticalPosition}%`,
        left: `${horizontalOffset}%`,
        size: size,
        animation: animations[i % animations.length],
      });
    }

    for (let i = 0; i < rightAvatars; i++) {
      const size = 70 + (i % 2) * 10;

      const avatarSizePercent = (size / 1200) * 100;

      const safeHorizontalOffset = safeMargin + avatarSizePercent / 2;

      const verticalSizeOffset = ((size / 1200) * 100) / 2;
      let verticalPosition =
        minVerticalPosition + verticalStepRight * i + verticalStepRight / 2;

      if (verticalPosition + verticalSizeOffset > maxVerticalPosition) {
        verticalPosition = maxVerticalPosition - verticalSizeOffset;
      }

      const horizontalOffset = safeHorizontalOffset + (i % 5);

      positions.push({
        side: "right",
        top: `${verticalPosition}%`,
        right: `${horizontalOffset}%`,
        size: size,
        animation: animations[(i + 2) % animations.length],
      });
    }

    positionsRef.current = positions;
    return positions;
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    if (
      reviews.length > 0 &&
      (positionsRef.current.length === 0 ||
        positionsRef.current.length !== reviews.length)
    ) {
      const indexes = Array.from({ length: reviews.length }, (_, i) => i);
      setAvatarIndexes(shuffleArray(indexes));

      const newPositions = generateEvenPositions();
      setAvatarPositions(newPositions);
    }
  }, [reviews.length]);

  const resetAnimatingIfStuck = () => {
    const currentTime = Date.now();
    if (animating && currentTime - lastInteractionRef.current > 600) {
      setAnimating(false);
    }
  };

  const handlePrevSlide = () => {
    resetAnimatingIfStuck();
    if (animating) return;

    lastInteractionRef.current = Date.now();
    setDirection("prev");
    setAnimating(true);
    setCurrentSlide((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleNextSlide = () => {
    resetAnimatingIfStuck();
    if (animating) return;

    lastInteractionRef.current = Date.now();
    setDirection("next");
    setAnimating(true);
    setCurrentSlide((prev) => (prev + 1) % reviews.length);
  };

  const goToSlide = (index) => {
    resetAnimatingIfStuck();
    if (animating) return;

    if (index === currentSlide) return;

    lastInteractionRef.current = Date.now();
    setDirection(index > currentSlide ? "next" : "prev");
    setAnimating(true);
    setCurrentSlide(index);
  };

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setAnimating(false);
    }, 450);

    const backupTimer = setTimeout(() => {
      if (animating) {
        setAnimating(false);
      }
    }, 800);

    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(backupTimer);
    };
  }, [currentSlide, animating]);

  useEffect(() => {
    const checkInterval = setInterval(resetAnimatingIfStuck, 1000);
    return () => clearInterval(checkInterval);
  }, [animating]);

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;

    const touchDiff = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 50;

    if (Math.abs(touchDiff) > minSwipeDistance) {
      if (touchDiff > 0) {
        // Vuốt sang trái -> next slide
        handleNextSlide();
      } else {
        // Vuốt sang phải -> previous slide
        handlePrevSlide();
      }
    }

    // Reset touch values
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8 relative mt-10">
      <div className="flex justify-center items-center">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Review của học viên tại SSStudy
        </h1>
        {/* <a href="#" className="text-blue-600 flex items-center whitespace-nowrap ml-2 shrink-0">
          Xem tất cả
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a> */}
      </div>

      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_780_4764)">
              <path
                d="M11.9784 19.0583C17.2411 19.0583 21.5075 14.7919 21.5075 9.52913C21.5075 4.26634 17.2411 0 11.9784 0C6.71556 0 2.44922 4.26634 2.44922 9.52913C2.44922 14.7919 6.71556 19.0583 11.9784 19.0583Z"
                fill="#FFD15C"
              />
              <path
                d="M4.25921 15.104L0.980469 20.7875L4.80724 20.5843L6.54582 24.0001L9.57889 18.7418C7.40567 18.1796 5.53952 16.8709 4.25921 15.104Z"
                fill="#242A4B"
              />
              <path
                d="M19.7176 15.0757C18.4468 16.8473 16.5806 18.1607 14.4121 18.7324L17.4546 24.0001L19.1932 20.5843L23.02 20.7875L19.7176 15.0757Z"
                fill="#242A4B"
              />
              <path
                d="M11.9784 16.4362C15.7931 16.4362 18.8855 13.3438 18.8855 9.52916C18.8855 5.71448 15.7931 2.62207 11.9784 2.62207C8.1637 2.62207 5.07129 5.71448 5.07129 9.52916C5.07129 13.3438 8.1637 16.4362 11.9784 16.4362Z"
                fill="#F8B64C"
              />
              <path
                d="M16.7128 8.78267C16.9254 8.5748 16.8073 8.21102 16.5144 8.1685L13.7884 7.77165C13.6703 7.75275 13.5711 7.68189 13.5191 7.57323L12.3002 5.10236C12.1679 4.83307 11.7853 4.83307 11.653 5.10236L10.4388 7.57323C10.3868 7.67716 10.2829 7.75275 10.1695 7.77165L7.44352 8.1685C7.15061 8.21102 7.0325 8.5748 7.2451 8.78267L9.21518 10.7055C9.30021 10.7905 9.33801 10.9087 9.31911 11.022L8.85612 13.7339C8.80415 14.0268 9.11596 14.2535 9.38053 14.1118L11.8183 12.8315C11.9223 12.7748 12.0498 12.7748 12.1538 12.8315L14.5916 14.1118C14.8561 14.2488 15.1632 14.0268 15.116 13.7339L14.6482 11.022C14.6293 10.9039 14.6671 10.7858 14.7522 10.7055L16.7128 8.78267Z"
                fill="white"
              />
            </g>
            <defs>
              <clipPath id="clip0_780_4764">
                <rect width="24" height="24" fill="white" />
              </clipPath>
            </defs>
          </svg>

          <p className="text-orange-500">
            Hơn 130.000 học viên tin tưởng và theo học tại SSStudy
          </p>
        </div>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:hidden lg:block max-w-[1440px] mx-auto">
        {avatarIndexes.length > 0 && avatarPositions.length > 0 && (
          <>
            {avatarPositions
              .filter((p) => p.side === "left")
              .map((position, idx) => (
                <div
                  key={`left-${idx}`}
                  className="absolute"
                  style={{
                    top: position.top,
                    left: position.left,
                  }}
                >
                  <div className="avatar-container pointer-events-auto">
                    <div
                      className={`rounded-full overflow-hidden ${
                        position.animation
                      } transition-all duration-300 cursor-pointer avatar-hover ${
                        currentSlide ===
                        avatarIndexes[idx % avatarIndexes.length]
                          ? "ring-2 ring-blue-500 ring-offset-2"
                          : ""
                      }`}
                      style={{
                        width: `${position.size}px`,
                        height: `${position.size}px`,
                        boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                      }}
                      onClick={() =>
                        goToSlide(avatarIndexes[idx % avatarIndexes.length])
                      }
                    >
                      <img
                        src={
                          reviews[avatarIndexes[idx % avatarIndexes.length]]
                            .avatar
                        }
                        alt={
                          reviews[avatarIndexes[idx % avatarIndexes.length]]
                            .name
                        }
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="tooltip tooltip-right">
                      <span className="font-medium">
                        {
                          reviews[avatarIndexes[idx % avatarIndexes.length]]
                            .name
                        }
                      </span>
                      <p className="text-xs">
                        {reviews[
                          avatarIndexes[idx % avatarIndexes.length]
                        ].content.substring(0, 60)}
                        ...
                      </p>
                    </div>
                  </div>
                </div>
              ))}

            {avatarPositions
              .filter((p) => p.side === "right")
              .map((position, idx) => {
                const adjustedIdx =
                  idx + avatarPositions.filter((p) => p.side === "left").length;
                return (
                  <div
                    key={`right-${idx}`}
                    className="absolute"
                    style={{
                      top: position.top,
                      right: position.right,
                    }}
                  >
                    <div className="avatar-container pointer-events-auto">
                      <div
                        className={`rounded-full overflow-hidden ${
                          position.animation
                        } transition-all duration-300 cursor-pointer avatar-hover ${
                          currentSlide ===
                          avatarIndexes[adjustedIdx % avatarIndexes.length]
                            ? "ring-2 ring-blue-500 ring-offset-2"
                            : ""
                        }`}
                        style={{
                          width: `${position.size}px`,
                          height: `${position.size}px`,
                          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                        }}
                        onClick={() =>
                          goToSlide(
                            avatarIndexes[adjustedIdx % avatarIndexes.length]
                          )
                        }
                      >
                        <img
                          src={
                            reviews[
                              avatarIndexes[adjustedIdx % avatarIndexes.length]
                            ].avatar
                          }
                          alt={
                            reviews[
                              avatarIndexes[adjustedIdx % avatarIndexes.length]
                            ].name
                          }
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="tooltip tooltip-left">
                        <span className="font-medium">
                          {
                            reviews[
                              avatarIndexes[adjustedIdx % avatarIndexes.length]
                            ].name
                          }
                        </span>
                        <p className="text-xs">
                          {reviews[
                            avatarIndexes[adjustedIdx % avatarIndexes.length]
                          ].content.substring(0, 60)}
                          ...
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </>
        )}
      </div>

      <div className="relative mt-16">
        <div className="flex items-center justify-center">
          <div className="w-full max-w-xs sm:max-w-none md:max-w-none lg:max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 relative h-auto sm:h-[280px] md:h-[300px] lg:h-[320px] overflow-hidden">
            <button
              onClick={handlePrevSlide}
              className="absolute left-7 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 hidden sm:flex items-center justify-center rounded-full bg-white bg-opacity-50 text-blue-600 hover:bg-opacity-80 transition-all transform hover:scale-110 focus:outline-none shadow-md"
              aria-label="Previous slide"
            >
              <svg
                className="w-4 h-4 md:w-6 md:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div
              ref={slideContainerRef}
              className={`slide-container ${
                animating ? `animating ${direction}` : ""
              }`}
              onAnimationEnd={() => setAnimating(false)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 h-full">
                {reviews.length > 0 && currentSlide < reviews.length ? (
                  <>
                    <img
                      src={reviews[currentSlide].avatar}
                      alt={reviews[currentSlide].name}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 text-center sm:text-left flex flex-col h-full overflow-hidden">
                      <div className="mb-2">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2 justify-center sm:justify-start">
                          <h3 className="font-semibold text-gray-800">
                            {reviews[currentSlide].name}
                          </h3>
                          <div className="flex justify-center sm:justify-start">
                            {(() => {
                              const stars = [];
                              let rating = reviews[currentSlide].rating;
                              for (let i = 1; i <= 5; i++) {
                                if (rating >= i) {
                                  stars.push(
                                    <svg
                                      key={`star-filled-${i}`}
                                      width="20"
                                      height="20"
                                      viewBox="0 0 19 19"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M18.7688 7.78675L14.5401 12.118L15.5341 18.248C15.6217 18.7372 15.0907 19.0953 14.6663 18.8634L9.46722 15.9838V0.0236359C9.68813 0.0236359 9.90903 0.126197 10.0037 0.33921L12.6151 5.9012L18.4295 6.7848C18.9155 6.87159 19.0946 7.44356 18.7688 7.78675Z"
                                        fill="#FFC107"
                                      />
                                      <path
                                        d="M9.46722 0.0236359V15.9838L4.26815 18.8634C3.8508 19.0977 3.31196 18.7427 3.40032 18.248L4.39438 12.118L0.165686 7.78675C-0.160144 7.44356 0.0181557 6.87159 0.504928 6.7848L6.31938 5.9012L8.93075 0.33921C9.02542 0.126197 9.24632 0.0236359 9.46722 0.0236359Z"
                                        fill="#FFC107"
                                      />
                                    </svg>
                                  );
                                } else {
                                  stars.push(
                                    <svg
                                      key={`star-empty-${i}`}
                                      width="20"
                                      height="20"
                                      viewBox="0 0 19 20"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M18.8338 8.31951L14.6051 12.6508L15.5991 18.7808C15.6867 19.2699 15.1558 19.6281 14.7313 19.3962L9.53223 16.5165V0.556396C9.75313 0.556396 9.97403 0.658958 10.0687 0.87197L12.6801 6.43396L18.4945 7.31757C18.9805 7.40435 19.1596 7.97633 18.8338 8.31951Z"
                                        fill="#9DA5BB"
                                      />
                                      <path
                                        d="M9.53223 0.556396V16.5165L4.33315 19.3961C3.9158 19.6305 3.37696 19.2754 3.46532 18.7808L4.45938 12.6508L0.230689 8.31951C-0.0951411 7.97632 0.0831581 7.40435 0.569931 7.31756L6.38438 6.43396L8.99575 0.87197C9.09042 0.658958 9.31133 0.556396 9.53223 0.556396Z"
                                        fill="#FFC107"
                                      />
                                    </svg>
                                  );
                                }
                              }
                              return stars;
                            })()}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          {reviews[currentSlide].school}
                        </p>
                      </div>
                      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-2">
                        <p className="text-gray-700 text-sm sm:text-base">
                          {reviews[currentSlide].content}
                        </p>
                      </div>
                      {/* <a href="#" className="text-blue-600 flex items-center mt-auto pb-1 justify-center sm:justify-start self-center sm:self-start">
                        <span className="inline-block">Tìm hiểu thêm</span>
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a> */}
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600">
                    Không có đánh giá nào để hiển thị.
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleNextSlide}
              className="absolute right-7 top-1/2 translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 hidden sm:flex items-center justify-center rounded-full bg-white bg-opacity-50 text-blue-600 hover:bg-opacity-80 transition-all transform hover:scale-110 focus:outline-none shadow-md"
              aria-label="Next slide"
            >
              <svg
                className="w-4 h-4 md:w-6 md:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-4 sm:mt-6">
          {reviews.map((_, index) => (
            <button
              key={index}
              className={`rounded-full transition-all duration-300 flex items-center justify-center ${
                index === currentSlide
                  ? "bg-blue-500 w-8 h-2 scale-110"
                  : "bg-gray-300 w-2 h-2"
              }`}
              onClick={() => goToSlide(index)}
            >
              {index === currentSlide && (
                <span className="animate-ping absolute inline-flex h-1 w-1 rounded-full bg-blue-400 opacity-75"></span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = `
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
    100% { transform: translateY(0px); }
  }

  @keyframes float-slow {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-7px); }
    100% { transform: translateY(0px); }
  }

  @keyframes float-reverse {
    0% { transform: translateY(0px); }
    50% { transform: translateY(5px); }
    100% { transform: translateY(0px); }
  }

  .animate-float {
    animation: float 6s ease-in-out infinite;
    animation-delay: 0s;
  }

  .animate-float-slow {
    animation: float-slow 8s ease-in-out infinite;
    animation-delay: 1s;
  }

  .animate-float-reverse {
    animation: float-reverse 7s ease-in-out infinite;
    animation-delay: 2s;
  }

  .animate-pulse {
    animation: none;
  }

  .avatar-hover {
    z-index: 10;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
    transform: scale(1);
    transition: all 0.3s ease;
  }

  .avatar-hover:hover {
    transform: scale(1.1);
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.7);
    z-index: 20;
  }

  .avatar-container {
    position: relative;
    z-index: 25;
  }

  .tooltip {
    position: absolute;
    visibility: hidden;
    opacity: 0;
    background-color: white;
    color: #333;
    text-align: left;
    border-radius: 6px;
    padding: 8px 10px;
    width: 180px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    z-index: 30;
    line-height: 1.2;
  }

  .tooltip-right {
    left: calc(100% + 10px);
    top: 50%;
    transform: translateY(-50%);
  }

  .tooltip-left {
    right: calc(100% + 10px);
    top: 50%;
    transform: translateY(-50%);
  }

  .avatar-container:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }

  .avatar-container .tooltip {
    pointer-events: none;
  }

  .avatar-container .avatar-hover {
    cursor: pointer;
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #c5d7eb;
    border-radius: 10px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #3b82f6;
  }

  .slide-container {
    width: 100%;
    height: 100%;
    transform: translateX(0);
    opacity: 1;
    transition: all 0.4s ease-in-out;
    touch-action: pan-y;
  }

  .slide-container.animating.next {
    animation: slideNext 0.4s ease-in-out;
  }

  .slide-container.animating.prev {
    animation: slidePrev 0.4s ease-in-out;
  }

  @keyframes slideNext {
    0% {
      transform: translateX(0);
      opacity: 1;
    }
    20% {
      transform: translateX(10%);
      opacity: 0;
    }
    40% {
      transform: translateX(-100%);
      opacity: 0;
    }
    60% {
      transform: translateX(-50%);
      opacity: 0.2;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slidePrev {
    0% {
      transform: translateX(0);
      opacity: 1;
    }
    20% {
      transform: translateX(-10%);
      opacity: 0;
    }
    40% {
      transform: translateX(100%);
      opacity: 0;
    }
    60% {
      transform: translateX(50%);
      opacity: 0.2;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes starAppear {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    60% {
      transform: scale(1.2);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .animate-star-appear {
    animation: starAppear 0.5s ease-out forwards;
  }
  
  @media (max-width: 640px) {
    .slide-container {
      cursor: grab;
    }
    
    .slide-container:active {
      cursor: grabbing;
    }
  }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default ReviewData;
