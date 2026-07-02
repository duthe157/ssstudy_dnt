import React, { useState, useEffect, useRef } from "react";
import Item from "./item";

const Index = ({ data, currentPage }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [itemsPerSlide, setItemsPerSlide] = useState(4);
  const [screen, setScreen] = useState("desktop");
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [startTranslate, setStartTranslate] = useState(0);

  const sliderRef = useRef(null);

  let items;
  if (currentPage === "home") {
    items = data
      ?.filter((item: any) => item?.is_show_home)
      ?.map((obj: any) => obj.classrooms)
      .flat()
      .slice(0, 12);
  } else if (currentPage === "teacher-details") {
    items = data;
  }

  useEffect(() => {
    const updateItemsPerSlide = () => {
      if (window.innerWidth < 640) {
        // Mobile
        setScreen("mobile");
        setItemsPerSlide(2);
      } else if (window.innerWidth < 1024) {
        // Tablet
        setScreen("tablet");
        setItemsPerSlide(4);
      } else if (window.innerWidth < 1280) {
        // Small Desktop
        setScreen("tablet");
        setItemsPerSlide(4);
      } else {
        setScreen("desktop");
        // Large Desktop
        setItemsPerSlide(4);
      }
    };

    updateItemsPerSlide();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", updateItemsPerSlide);
      return () => window.removeEventListener("resize", updateItemsPerSlide);
    }
  }, []);

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
      slides.push(items?.slice(i, i + itemsPerSlide));
    }
    return slides;
  };

  // Xử lý sự kiện kéo
  const handleDragStart = (e) => {
    setIsDragging(true);

    // Xác định vị trí bắt đầu
    const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
    setCurrentX(clientX);

    // Tính toán vị trí bắt đầu với xử lý cho slide cuối
    const slideWidth = 82; // %
    const marginRightPercent = 5; // %
    const slideFullWidth = slideWidth + marginRightPercent;

    let currentTranslate;
    if (screen === "mobile") {
      if (currentSlide === totalSlides - 1) {
        // Xử lý đặc biệt cho slide cuối
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

    // Ngăn chặn hành vi mặc định (như cuộn trang)
    if (e.cancelable) {
      e.preventDefault();
    }

    // Cập nhật vị trí kéo hiện tại
    const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
    setCurrentX(clientX);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Tính khoảng cách kéo
    const diff = currentX - startX;
    const sliderWidth = sliderRef.current?.offsetWidth || 0;

    // Giảm ngưỡng chuyển slide trên điện thoại để làm cho việc vuốt nhạy hơn
    const threshold = screen === "mobile" ? 0.15 : 0.2;

    // Nếu kéo đủ xa (>threshold chiều rộng), thì chuyển slide
    if (Math.abs(diff) > sliderWidth * threshold) {
      if (diff > 0 && currentSlide > 0) {
        // Kéo sang phải -> slide trước đó
        prevSlide();
      } else if (diff < 0 && currentSlide < totalSlides - 1) {
        // Kéo sang trái -> slide tiếp theo
        nextSlide();
      }
    }
  };

  // Xử lý trường hợp rời khỏi vùng kéo
  const handleDragLeave = () => {
    if (isDragging) {
      handleDragEnd();
    }
  };

  const slides = getSlideItems();

  // Tính toán transform dựa trên trạng thái kéo
  const calculateTransformMobile = () => {
    // Tính toán khoảng cách giữa các slide, bao gồm cả margin
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

    // Khi đang kéo, tính toán vị trí dựa trên khoảng cách kéo
    const diff = currentX - startX;
    const sliderWidth = sliderRef.current?.offsetWidth || 1;
    const percentMoved = (diff / sliderWidth) * 100;
    const newTranslate = startTranslate + percentMoved;

    // Giới hạn khoảng kéo để tránh kéo quá xa khỏi slide đầu/cuối
    const minTranslate = -(totalSlides - 1) * 100;
    const maxTranslate = 0;
    return `translateX(${Math.max(
      minTranslate,
      Math.min(maxTranslate, newTranslate)
    )}%)`;
  };

  return (
    <div className="py-8 mt-10">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6 text-2xl">
          {(() => {
            switch (currentPage) {
              case "home":
                return "Khóa học nổi bật";
              case "teacher-details":
                return "Khóa học của giáo viên";
              default:
                return "";
            }
          })()}
        </h1>

        <div className="w-full group relative">
          {/* Container cho slides */}
          <div
            className="relative overflow-hidden"
            ref={sliderRef}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            onMouseMove={handleDragMove}
            onTouchMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onTouchEnd={handleDragEnd}
            onMouseLeave={handleDragLeave}
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
                  screen === "mobile" ? (
                    <div
                      key={slideIndex}
                      className="w-[82%] flex-shrink-0 last:mr-0"
                      style={{ marginRight: "5%" }}
                    >
                      {slideItems.map((item, itemIndex) => (
                        <div key={itemIndex} className="mb-6 last:mb-0">
                          <Item
                            item={{
                              ...item,
                            }}
                            itemIndex={itemIndex}
                            screen={screen}
                          />
                        </div>
                      ))}
                    </div>
                  ) : screen === "tablet" ? (
                    <div
                      key={slideIndex}
                      className="grid w-full flex-none grid-cols-2 justify-center gap-4 sm:gap-6 lg:gap-8 last:mr-0"
                      style={{ height: "fit-content" }}
                    >
                      {slideItems.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="mb-4 last:mb-0 w-full h-full"
                        >
                          <Item
                            item={{
                              ...item,
                            }}
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
                            item={{
                              ...item,
                            }}
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
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
