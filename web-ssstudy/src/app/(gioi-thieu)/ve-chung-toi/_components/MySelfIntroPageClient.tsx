"use client";

import { PaginateGrid } from "@/components/ui/paginate-grid";
import { ExampleTimeline, Timeline } from "@/components/ui/timeline";
import { aboutService } from "@/services/aboutService";
import { UserOutlined } from "@ant-design/icons";
import { Avatar, Rate } from "antd";
import { useEffect, useRef, useState } from "react";

interface BlockSchedule {
  totalRecord: number;
  perPage: number;
  records: any[];
}

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui";
import { useIsMobile } from "@/hooks/useIsMobile";
import blogCategoryService from "@/services/blogCategoryService";

export default function MySelfIntroPageClient() {
  const [data, setData] = useState<any>();
  const [evaluaton, setEvaluationData] = useState<any>();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [blockSchedule, setBlockSchedule] = useState<BlockSchedule>({
    totalRecord: 0,
    perPage: 6,
    records: [],
  });

  useEffect(() => {
    async function fetchAboutData() {
      try {
        const aboutPageResponse = await aboutService.getAboutPageData();
        if (
          aboutPageResponse &&
          aboutPageResponse.data &&
          aboutPageResponse.code === 200
        ) {
          setData(aboutPageResponse?.data || {});
        } else {
          throw new Error("Dữ liệu không hợp lệ");
        }

        const blogResponse = await aboutService.getBlog(currentPage, pageSize);
        if (blogResponse && blogResponse.data && blogResponse.code === 200) {
          setBlockSchedule(blogResponse?.data || {});
        } else {
          throw new Error("Dữ liệu không hợp lệ");
        }

        const evaluationResponse = await aboutService.getEvaluation();
        if (
          evaluationResponse &&
          evaluationResponse.data &&
          evaluationResponse.code === 200
        ) {
          setEvaluationData(evaluationResponse?.data || {});
        } else {
          throw new Error("Dữ liệu không hợp lệ");
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu trang giới thiệu:", err);
      }
    }

    fetchAboutData();
  }, []);

  const onPageChange = async (page: number) => {
    const response = await aboutService.getBlog(page, pageSize);
    if (response && response.data && response.code === 200) {
      setCurrentPage(page);
      setBlockSchedule(response.data);
    } else {
      throw new Error("Dữ liệu không hợp lệ");
    }
  };

  const isMobile = useIsMobile();
  const [historyIndex, setHistoryIndex] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);

  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const scrollTimeline = (direction: "left" | "right") => {
    const container = timelineContainerRef.current;
    if (!container) return;
    const scrollAmount = Math.min(container.clientWidth, 480);
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = timelineContainerRef.current;
    if (!container) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - container.offsetLeft;
    scrollLeftRef.current = container.scrollLeft;
    container.style.cursor = "grabbing";
    container.style.userSelect = "none";
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    const container = timelineContainerRef.current;
    if (!container) return;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startXRef.current) * 2;
    container.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    const container = timelineContainerRef.current;
    if (!container) return;
    container.style.cursor = "grab";
    container.style.userSelect = "auto";
  };

  const handleMouseLeave = () => {
    isDraggingRef.current = false;
    const container = timelineContainerRef.current;
    if (!container) return;
    container.style.cursor = "grab";
    container.style.userSelect = "auto";
  };

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setHistoryIndex(carouselApi.selectedScrollSnap());
    onSelect();
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  const stripHtml = (htmlString: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    return doc.body.textContent || "";
  };

  const getURL = async (item: any) => {
    try {
      let alias = "";
      if (item.category?.id) {
        const det = await blogCategoryService.detail({
          id: String(item.category?.id),
        });
        alias = det?.data?.alias || "";
      }
      if (alias && item.alias) {
        window.open(`/${alias}/${item.alias}?id=${item._id}`, '_blank');
      }
    } catch {}
  };

  const evaluationTopRanks = () => {
    if (evaluaton?.records?.length > 0) {
      return evaluaton.records.filter((item: any) => item.name);
    }
    return [];
  }

  return (
    <>
      <div className="bg-[#ECF8FF] pt-12 md:pt-20 lg:pt-[96px] pb-4 mb-12 md:mb-16 lg:mb-[112px]">
        <div className="container mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-[160px] flex flex-col lg:flex-row lg:justify-between gap-8 lg:gap-[60px]">
          <div className="w-full lg:max-w-[590px] flex flex-col justify-between">
            {/* Banner title + description đã responsive tốt, giữ nguyên */}
            <div>
              <div className="font-bold text-2xl sm:text-3xl lg:text-[40px] mb-6 lg:mb-9 leading-relaxed lg:leading-[1.3]">
                {data?.banner?.title ||
                  "Công ty cổ phần và đào tạo phát triển giáo dục SSStudy"}
              </div>

              <div className="text-sm sm:text-base mb-8 lg:mb-12 text-[#50556F]">
                {data?.banner?.description || (
                  <>
                    <div className="mb-7">
                      Chúng tôi hoạt động trong lĩnh vực giáo dục đào tạo, tập
                      trung vào việc ứng dụng công nghệ và phương pháp giảng dạy
                      hiện đại nhất cho thế hệ trẻ Việt Nam, cung cấp các chương
                      trình học trực tuyến và trực tiếp.
                    </div>
                    <div>
                      Với mục tiêu phát triển tư duy sáng tạo, chúng tôi không
                      ngừng cải tiến để mang lại giá trị tri thức, giúp học sinh
                      tự tin trong học tập và phát triển kỹ năng sống, hướng tới
                      trở thành công dân toàn cầu. Sứ mệnh của chúng tôi là đồng
                      hành cùng thế hệ trẻ, dẫn dắt họ đến thành công và góp
                      phần xây dựng một tương lai tốt đẹp hơn.
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-4 sm:gap-[30px] mb-6">
              {evaluationTopRanks().length > 0 ? (
                evaluationTopRanks().map((item: any) => (
                  <div className="flex gap-[10px]" key={item._id}>
                    <Avatar size={58} src={item.image} className="ss-avatar" />
                    <div className="flex flex-col justify-between gap-[6px]">
                      <div>
                        <div className="text-base sm:text-[20px] font-bold text-[#191A15]">
                          {item?.name || ""}
                        </div>
                        <div className="text-[#50556F]">
                          {item?.description || ""}
                        </div>
                      </div>
                      <Rate allowHalf={true} defaultValue={4.5} disabled />
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex gap-[10px]">
                    <Avatar size={58} icon={<UserOutlined />} />
                    <div className="flex flex-col gap-[6px]">
                      <div className="text-base sm:text-lg md:text-[20px] font-bold text-[#191A15]">
                        Nguyễn Tuấn Anh
                      </div>
                      <div className="text-[#50556F]">
                        THPT Quốc Oai, Hà Nội
                      </div>
                      <Rate allowHalf={true} defaultValue={4.5} disabled />
                    </div>
                  </div>
                  <div className="flex gap-[10px]">
                    <Avatar size={58} icon={<UserOutlined />} />
                    <div className="flex flex-col gap-[6px]">
                      <div className="text-base sm:text-lg md:text-[20px] font-bold text-[#191A15]">
                        Nguyễn Tuấn Anh
                      </div>
                      <div className="text-[#50556F]">
                        THPT Quốc Oai, Hà Nội
                      </div>
                      <Rate allowHalf={true} defaultValue={4.5} disabled />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-[60px] lg:w-[440px]">
            {data?.introductions?.length > 0 ? (
              data.introductions.map((item: any) => (
                <div className="flex items-center gap-4" key={item.order}>
                  <div>
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="object-contain w-14 h-14 sm:w-16 sm:h-16 lg:w-[70px] lg:h-[70px]"
                    />
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <div className="text-xl sm:text-2xl lg:text-[28px] font-bold text-[#191A15]">
                      {item.title}
                    </div>
                    <div className="text-[#50556F]">{item.description}</div>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <div>
                    <img
                      src="/imgs/home/image-believe.png"
                      alt="Tin tưởng"
                      style={{ maxWidth: "fit-content" }}
                    />
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <div className="text-xl sm:text-2xl lg:text-[28px] font-bold text-[#191A15]">
                      Tin tưởng
                    </div>
                    <div className="text-[#50556F]">
                      Cam kết 100% học sinh đỗ đại học
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <img
                      src="/imgs/home/image-prestige.png"
                      alt="Uy tín"
                      style={{ maxWidth: "fit-content" }}
                    />
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <div className="text-xl sm:text-2xl lg:text-[28px] font-bold text-[#191A15]">
                      Uy tín
                    </div>
                    <div className="text-[#50556F]">
                      Đội ngũ giáo viên đứng top đầu Việt Nam về chất lượng và
                      uy tín
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <img
                      src="/imgs/home/image-quality.png"
                      alt="Chất lượng"
                      style={{ maxWidth: "fit-content" }}
                    />
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <div className="text-xl sm:text-2xl lg:text-[28px] font-bold text-[#191A15]">
                      Chất lượng
                    </div>
                    <div className="text-[#50556F]">
                      Cam kết 100% học sinh đỗ đại học
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <img
                      src="/imgs/home/image-complete.png"
                      alt="Hoàn chỉnh"
                      style={{ maxWidth: "fit-content" }}
                    />
                  </div>
                  <div className="flex flex-col gap-[6px]">
                    <div className="text-xl sm:text-2xl lg:text-[28px] font-bold text-[#191A15]">
                      Hoàn chỉnh
                    </div>
                    <div className="text-[#50556F]">
                      Thương hiệu giáo dục được hàng triệu học sinh Việt Nam lựa
                      chọn
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-[160px]">
        <div className="flex flex-col items-center justify-center font-bold text-xl sm:text-3xl lg:text-[40px] text-center">
          Lịch sử hình thành và phát triển
          {data?.histories?.length ? (
            isMobile ? (
              <div className="w-full mt-6">
                <Carousel setApi={setCarouselApi} opts={{ loop: false }}>
                  <CarouselContent>
                    {data.histories.map((step: any) => (
                      <CarouselItem key={step.order}>
                        <div className="p-2">
                          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="flex items-center justify-center gap-2 py-3">
                              <img
                                src="/icon/calendar.svg"
                                alt="calendar"
                                className="w-5 h-5"
                              />
                              <span className="text-sm text-[#50556F]">
                                {step.year}
                              </span>
                            </div>

                            <div className="w-full h-[220px] sm:h-[260px]">
                              <img
                                src={step.image_url}
                                alt={step.description}
                                className="object-cover w-full h-full"
                              />
                            </div>

                            <div className="p-4">
                              <h3 className="font-bold text-base text-[#191A15] text-center">
                                {step.description}
                              </h3>
                            </div>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>

                  <CarouselPrevious className="top-2 left-2 -translate-y-0" />
                  <CarouselNext className="top-2 right-2 -translate-y-0" />

                  <div className="flex items-center justify-center gap-2 py-3">
                    {data.histories.map((_: any, i: number) => (
                      <button
                        key={i}
                        aria-label={`slide-${i}`}
                        onClick={() => carouselApi?.scrollTo(i)}
                        className={`size-2 rounded-full ${
                          historyIndex === i ? "bg-blue-600" : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </Carousel>
              </div>
            ) : (
              <div className="relative w-full">
                <button
                  type="button"
                  aria-label="Scroll left"
                  onClick={() => scrollTimeline("left")}
                  className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg ring-1 ring-gray-200 hover:bg-gray-50"
                >
                  <img
                    src="/icon/chevron-left.svg"
                    alt="Prev"
                    className="w-5 h-5"
                  />
                </button>

                <div
                  ref={timelineContainerRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                  className="flex items-center w-full overflow-x-auto scroll-smooth h-[480px] sm:h-[640px] md:h-[760px] lg:h-[920px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] cursor-grab active:cursor-grabbing select-none"
                >
                  <Timeline steps={data.histories} />
                </div>

                <button
                  type="button"
                  aria-label="Scroll right"
                  onClick={() => scrollTimeline("right")}
                  className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg ring-1 ring-gray-200 hover:bg-gray-50"
                >
                  <img
                    src="/icon/chevron-right.svg"
                    alt="Next"
                    className="w-5 h-5"
                  />
                </button>
              </div>
            )
          ) : (
            <ExampleTimeline />
          )}
        </div>
        {
          !!blockSchedule.records.length && (
            <>
              <div className="flex justify-center font-bold text-2xl sm:text-3xl lg:text-[40px] mb-8 lg:mb-[60px]">
                Về SSStudy
              </div>
              <PaginateGrid
                data={blockSchedule.records}
                total={blockSchedule.totalRecord}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={onPageChange}
                renderItem={(item, idx) => (
                  <div key={item._id} className="flex flex-col md:w-[80%] h-full relative">
                    <div className="relative w-full aspect-square bg-gray-100 overflow-hidden flex items-center justify-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full object-cover transition-transform duration-200 group-hover/item:scale-105 h-full object-center"
                      />
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-4 -translate-y-1/3 sm:-translate-y-1/2 mx-4 z-10">
                      <h3 className="font-bold text-lg text-center line-clamp-2 break-words">
                        {item.name}
                      </h3>
                      <p className="mt-4 text-sm text-gray-600 line-clamp-3 break-words">
                        {stripHtml(item.description)}
                      </p>
                      <a
                        onClick={() => getURL(item)}
                        className="block mt-4 text-blue-600 font-medium text-center hover:underline cursor-pointer"
                      >
                        Tìm hiểu thêm &rarr;
                      </a>
                    </div>
                  </div>
                )}
              />
            </>
          )
        }
      </div>
    </>
  );
}
