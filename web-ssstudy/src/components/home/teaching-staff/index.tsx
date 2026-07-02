import React, { useState, useEffect, useRef, useCallback } from "react";
import Item from "./item";

const Index = ({ items }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [itemsPerSlide, setItemsPerSlide] = useState(4);
  const [screen, setScreen] = useState("desktop");

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [startTranslate, setStartTranslate] = useState(0);
  const sliderRef = useRef(null);

  useEffect(() => {
    const updateItemsPerSlide = () => {
      if (window.innerWidth < 640) {
        setItemsPerSlide(1);
        setScreen("mobile");
      } else if (window.innerWidth < 1024) {
        setItemsPerSlide(4);
        setScreen("tablet");
      } else if (window.innerWidth < 1280) {
        setItemsPerSlide(4);
        setScreen("tablet");
      } else {
        setItemsPerSlide(4);
        setScreen("desktop");
      }
    };

    updateItemsPerSlide();
    window.addEventListener("resize", updateItemsPerSlide);
    return () => window.removeEventListener("resize", updateItemsPerSlide);
  }, []);

  useEffect(() => {
    setCurrentSlide(0);
  }, [itemsPerSlide, items?.length]);

  const totalSlides = Math.ceil(items?.length / itemsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const getSlideItems = () => {
    const slides = [];
    for (let i = 0; i < items?.length; i += itemsPerSlide) {
      slides.push(items.slice(i, i + itemsPerSlide));
    }
    return slides;
  };

  const handleDragStart = (e) => {
    setIsDragging(true);
    const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
    setCurrentX(clientX);

    // Cập nhật tương ứng với logic trong calculateTransformMobile
    const slideWidth = 82; // %
    const marginRightPercent = 5; // %
    const slideFullWidth = slideWidth + marginRightPercent;

    let currentTranslate;
    if (screen === "mobile") {
      if (currentSlide === totalSlides - 1) {
        // Tương ứng với xử lý đặc biệt cho slide cuối trong calculateTransformMobile
        currentTranslate = -(currentSlide * slideFullWidth) + 15;
      } else {
        currentTranslate = -currentSlide * slideFullWidth;
      }
    } else {
      currentTranslate = -currentSlide * 100;
    }

    setStartTranslate(currentTranslate);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    if (e.cancelable) e.preventDefault();
    const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
    setCurrentX(clientX);
  };

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    const diff = currentX - startX;
    const sliderWidth = sliderRef.current?.offsetWidth || 0;

    // Giảm ngưỡng chuyển slide trên điện thoại để làm cho việc vuốt nhạy hơn
    const threshold = screen === "mobile" ? 0.15 : 0.2;

    if (Math.abs(diff) > sliderWidth * threshold) {
      if (diff > 0 && currentSlide > 0) {
        prevSlide();
      } else if (diff < 0 && currentSlide < totalSlides - 1) {
        nextSlide();
      }
    }
  }, [isDragging, currentX, startX, currentSlide, totalSlides, screen]);

  useEffect(() => {
    const handleGlobalMouseUp = () => handleDragEnd();
    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("touchend", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("touchend", handleGlobalMouseUp);
    };
  }, [handleDragEnd]);

  // Tính toán transform dựa trên trạng thái kéo
  const calculateTransformMobile = () => {
    // Tính toán khoảng cách giữa các slide, bao gồm cả margin
    // Mỗi slide chiếm 82% và margin-right là 18px
    // Chuyển đổi margin từ px sang % để đảm bảo tính nhất quán
    const slideWidth = 82; // %
    const marginRightPercent = 5; // Xấp xỉ 18px nhưng dưới dạng %
    const slideFullWidth = slideWidth + marginRightPercent; // Tổng chiều rộng bao gồm margin

    if (!isDragging) {
      // Xử lý đặc biệt cho slide cuối cùng
      if (currentSlide === totalSlides - 1) {
        // Dịch slide cuối sang phải một chút để hiện một phần của slide trước đó bên trái
        // Offset là 15% để hiển thị một phần slide trước đó
        return `translateX(-${currentSlide * slideFullWidth - 15}%)`;
      }
      return `translateX(-${currentSlide * slideFullWidth}%)`;
    }

    // Khi đang kéo, tính toán vị trí dựa trên khoảng cách kéo
    const diff = currentX - startX;
    const sliderWidth = sliderRef.current?.offsetWidth || 1;
    // Giảm độ nhạy khi kéo trên di động để di chuyển mượt mà hơn
    const dragSensitivity = screen === "mobile" ? 1.5 : 1;
    const percentMoved = ((diff / sliderWidth) * 100) / dragSensitivity;
    const newTranslate = startTranslate + percentMoved;

    // Giới hạn khoảng kéo để tránh kéo quá xa khỏi slide đầu/cuối
    // Điều chỉnh giới hạn cho slide cuối
    const minTranslate =
      currentSlide === totalSlides - 1
        ? -(totalSlides - 1) * slideFullWidth + 15 // Cho phép kéo thêm để hiện slide trước đó
        : -(totalSlides - 1) * slideFullWidth;
    const maxTranslate = 0;
    return `translateX(${Math.max(
      minTranslate,
      Math.min(maxTranslate, newTranslate)
    )}%)`;
  };
  const calculateTransform = () => {
    if (!isDragging) {
      // Sử dụng đúng 100% cho tất cả các slide
      return `translateX(-${currentSlide * 100}%)`;
    }
    const diff = currentX - startX;
    const sliderWidth = sliderRef.current?.offsetWidth || 1;
    const percentMoved = (diff / sliderWidth) * 100;
    const newTranslate = startTranslate + percentMoved;
    const minTranslate = -(totalSlides - 1) * 100;
    const maxTranslate = 0;
    return `translateX(${Math.max(
      minTranslate,
      Math.min(maxTranslate, newTranslate)
    )}%)`;
  };

  const slides = getSlideItems();

  return (
    <div className="bg-white py-8">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">
          Đội ngũ giảng viên
        </h1>

        <div className="w-full group relative">
          <div
            className="relative overflow-hidden"
            ref={sliderRef}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            onMouseMove={handleDragMove}
            onTouchMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onTouchEnd={handleDragEnd}
            onMouseLeave={handleDragEnd}
            style={{
              cursor: isDragging ? "grabbing" : "grab",
              touchAction: "pan-y",
            }}
          >
            <div className="relative overflow-hidden">
              <div
                className={`flex will-change-transform ${
                  !isDragging
                    ? "transition-transform duration-500 ease-out md:duration-700 md:ease-[cubic-bezier(0.22,1,0.36,1)]"
                    : ""
                }`}
                style={{
                  transform:
                    screen === "mobile"
                      ? calculateTransformMobile()
                      : calculateTransform(),
                  userSelect: isDragging ? "none" : "auto",
                  WebkitBackfaceVisibility: "hidden",
                  backfaceVisibility: "hidden",
                  touchAction: "none",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {slides.map((slideItems, slideIndex) =>
                  screen !== "tablet" ? (
                    screen === "mobile" ? (
                      <div
                        key={slideIndex}
                        className="w-[82%] flex-shrink-0 last:mr-0"
                        style={{ marginRight: "5%" }}
                      >
                        {slideItems.map((item, itemIndex) => (
                          <div key={itemIndex} className="mb-6 last:mb-0">
                            <Item
                              key={itemIndex}
                              item={item}
                              itemIndex={itemIndex}
                              screen={screen}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        key={slideIndex}
                        className="grid w-full flex-none grid-cols-4 justify-center gap-4 sm:gap-6 lg:gap-8 last:mr-0"
                        style={{ height: "fit-content" }}
                      >
                        {slideItems.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="mb-3 last:mb-0 w-full h-full"
                          >
                            <Item
                              key={itemIndex}
                              item={item}
                              itemIndex={itemIndex}
                              screen={screen}
                            />
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <div
                      key={slideIndex}
                      className="grid grid-cols-2 w-full flex-none justify-center gap-4 sm:gap-6 lg:gap-8 last:mr-0"
                      style={{ height: "fit-content" }}
                    >
                      {slideItems.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="mb-4 last:mb-0 w-full h-full"
                        >
                          <Item
                            item={item}
                            itemIndex={itemIndex}
                            screen={screen}
                          />
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Chỉ số slide */}
          <div className="absolute -bottom-6 left-1/2 z-10 flex max-w-full -translate-x-1/2 transform justify-center gap-2 overflow-x-auto">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 w-2 rounded-full transition-all ${
                  index === currentSlide ? "bg-blue-600" : "bg-gray-400"
                }`}
                role="button"
                aria-label={`Chuyển đến slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
