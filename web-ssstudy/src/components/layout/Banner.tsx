"use client";

import React, { useState, useEffect, useRef } from "react";

interface Slider {
  image: string;
  link: string;
}

const Banner = ({ slidersInput }: { slidersInput: Slider[] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const touchStartX = useRef(0);
  const mouseStartX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const didDrag = useRef(false);

  const sliders = slidersInput ? slidersInput : [];

  useEffect(() => {
    if (isDragging || !sliders.length) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, [currentSlide, isDragging, sliders.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === sliders.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? sliders.length - 1 : prev - 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartX.current = e.touches[0].clientX;
    setIsDragging(true);
    didDrag.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touchCurrentX = e.touches[0].clientX;
    const deltaX = touchCurrentX - touchStartX.current;
    setDragOffset(deltaX);
    if (Math.abs(deltaX) > 5) {
      didDrag.current = true;
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const minSwipeDistance = 50;

    if (Math.abs(dragOffset) > minSwipeDistance) {
      if (dragOffset < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    if (Math.abs(dragOffset) <= minSwipeDistance) {
      setDragOffset(0);
    } else {
      setDragOffset(0);
    }

    setTimeout(() => {
      didDrag.current = false;
    }, 0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    mouseStartX.current = e.clientX;
    setIsDragging(true);
    setDragOffset(0);
    didDrag.current = false;
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const mouseCurrentX = e.clientX;
    const deltaX = mouseCurrentX - mouseStartX.current;
    setDragOffset(deltaX);
    if (Math.abs(deltaX) > 5) {
      didDrag.current = true;
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    const minSwipeDistance = 50;

    if (Math.abs(dragOffset) > minSwipeDistance) {
      if (dragOffset < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    if (Math.abs(dragOffset) <= minSwipeDistance) {
      setDragOffset(0);
    } else {
      setDragOffset(0);
    }

    setTimeout(() => {
      didDrag.current = false;
    }, 0);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMouseUp(e);
    }
  };

  const handleSelectStart = (e: React.SyntheticEvent) => {
    if (isDragging) {
      e.preventDefault();
    }
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (didDrag.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div className="w-full bg-white">
      <div className="relative w-full overflow-hidden group">
        <div
          ref={containerRef}
          role="button"
          aria-label="Image carousel"
          tabIndex={0}
          className={`relative flex w-full h-full ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{
            transform: `translateX(calc(-${
              currentSlide * 100
            }% + ${dragOffset}px))`,
            transition: isDragging ? "none" : "transform 0.4s ease-in-out",
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {sliders.map((slide: Slider, index: number) => (
            <div
              key={index}
              className="flex-shrink-0 w-full h-full flex items-center justify-center"
              style={{ backfaceVisibility: "hidden" }}
            >
              <a
                href={slide.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full w-full"
                draggable="false"
                onClickCapture={handleClickCapture}
              >
                <img
                  src={slide.image}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-cover select-none"
                  draggable="false"
                  onDragStart={(e) => e.preventDefault()}
                />
              </a>
            </div>
          ))}
        </div>

        <button
          onClick={prevSlide}
          className="hidden sm:flex absolute left-0 top-0 h-full w-[50px] items-center justify-center bg-black/0 hover:bg-black/20 transition-all opacity-0 group-hover:opacity-100 z-10"
        >
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="hidden sm:flex absolute right-0 top-0 h-full w-[50px] items-center justify-center bg-black/0 hover:bg-black/20 transition-all opacity-0 group-hover:opacity-100 z-10"
        >
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1 sm:space-x-2 z-10">
          {sliders.map((_: Slider, index: number) => (
            <button
              key={index}
              onClick={() => {
                if (!isDragging) {
                  setCurrentSlide(index);
                }
              }}
              className={`h-1 sm:h-1.5 rounded-full transition-all ${
                index === currentSlide
                  ? "w-4 sm:w-6 bg-blue-600"
                  : "w-1 sm:w-1.5 bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Banner;
