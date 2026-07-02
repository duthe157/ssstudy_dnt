import { useContext, useEffect, useState } from "react";
import ExamIcon from "../../icons/ExamIcon";
import LessionIcon from "../../icons/LessonIcon";
import { RootContext } from "../../../contexts/RootContext";
import { SmartImage } from "@/components/ui/smart-image";
import { courseService } from "@/services/courseService";

const Item = ({ item, itemIndex, screen }) => {
  const [className, setClassName] = useState("");
  const [detailDescription, setDetailDescription] = useState<string | null>(
    null
  );
  const [isLoadingDescription, setIsLoadingDescription] = useState(false);
  const [hasFetchedDescription, setHasFetchedDescription] = useState(false);
  const rootContext = useContext(RootContext);

  useEffect(() => {
    if (screen === "tablet") {
      setClassName(
        "w-full bg-white rounded-lg overflow-hidden relative group/item border shadow-sm hover:shadow-md transition-all duration-300 h-full"
      );
    } else if (screen === "mobile") {
      setClassName(
        "w-full bg-white rounded-lg overflow-hidden relative group/item border shadow-sm hover:shadow-md transition-all duration-300"
      );
    } else {
      setClassName(
        "w-full bg-white rounded-lg overflow-hidden relative group/item border shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col"
      );
    }
  }, [screen]);

  const truncateText = (text, maxLength) => {
    if (text?.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  const truncateHtmlDescription = (
    html: string | null | undefined,
    maxLength: number = 150
  ): string => {
    if (!html || typeof window === "undefined") return "";

    // Tạo một element tạm để parse HTML và lấy text thuần
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";

    // Truncate text và thêm "..."
    if (textContent.length > maxLength) {
      return textContent.substring(0, maxLength).trim() + "...";
    }

    return textContent;
  };

  const getContainerStyle = () => {
    if (screen === "mobile") {
      return {
        minHeight: "380px",
      };
    } else {
      return {
        width: "100%",
        height: "100%",
      };
    }
  };

  const handleAddCart = () => {
    const payload = {
      item_id: item?._id,
      name: item?.name,
      price: item?.price,
      qty: 1,
      type: "CLASSROOM",
      image: item?.image,
    };

    rootContext?.handleAddCart(payload);
  };

  const fetchClassroomDetail = async () => {
    if (!item?._id || hasFetchedDescription || isLoadingDescription) {
      return;
    }

    setIsLoadingDescription(true);
    try {
      const response = await courseService.classroomDetail({
        id: item._id,
      });

      if (response?.code === 200 && response?.data?.classroom?.description) {
        setDetailDescription(response.data.classroom.description);
        setHasFetchedDescription(true);
      }
    } catch (error) {
      console.error("Error fetching classroom detail:", error);
    } finally {
      setIsLoadingDescription(false);
    }
  };

  const handleMouseEnter = () => {
    if (!hasFetchedDescription && !isLoadingDescription) {
      fetchClassroomDetail();
    }
  };

  return (
    <div
      key={itemIndex}
      className={className}
      style={getContainerStyle()}
      onMouseEnter={handleMouseEnter}
    >
      {/* Hover */}
      <div className="cursor-pointer absolute inset-0 opacity-0 group-hover/item:opacity-100 transition-all duration-300 flex flex-col justify-center items-center z-10 h-full w-full">
        <div className="bg-gray-100/90 backdrop-blur-sm flex items-center justify-center h-full w-full">
          <div
            className={`flex flex-col justify-between bg-white h-full p-5 w-full overflow-auto`}
          >
            <div className="text-[#235CD0] font-semibold">
              {item?.group?.name}
            </div>
            <div className="mt-2 font-bold text-lg">
              {truncateText(item?.name, 45)}
            </div>
            <div className="mt-2 text-sm font-medium text-[#6C7086]">
              {item.teacher}
            </div>
            <div
              className="mt-2 text-[#242A4B] text-sm flex-grow overflow-y-auto"
              style={{ maxHeight: "120px" }}
            >
              {isLoadingDescription ? (
                <div className="text-gray-400 text-xs">Đang tải mô tả...</div>
              ) : (
                <div className="book-short-description">
                  {(() => {
                    const description = detailDescription || item?.description;
                    const truncated = truncateHtmlDescription(description, 150);
                    return (
                      truncated || (
                        <span className="text-gray-400 italic">
                          Chưa có mô tả cho khóa học này
                        </span>
                      )
                    );
                  })()}
                </div>
              )}
            </div>
            <div className="my-3 flex items-center">
              <div className="text-red-500 font-bold text-xl">
                {Intl.NumberFormat("vi-VN")
                  .format(item?.price)
                  .replaceAll(".", ",")}
                đ
              </div>
              <div className="text-gray-500 line-through ml-2">
                {Intl.NumberFormat("vi-VN")
                  .format(item?.origin_price)
                  .replaceAll(".", ",")}
                đ
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <a
                href={`/khoa-hoc/${item?._id}`}
                className="w-full text-center font-bold h-[35px] text-sm border border-[#235CD0] text-[#235CD0] rounded-full hover:bg-blue-100 hover:text-blue-500 transition-colors flex items-center justify-center"
              >
                Xem chi tiết
              </a>

              <button
                onClick={handleAddCart}
                className="w-full h-[35px] text-sm font-bold bg-[#235CD0] text-white rounded-full hover:bg-[#1e4eb3] transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 21 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_891_2550)">
                    <path
                      d="M19.9141 7.07031H17.8519L13.3404 1.43086C13.1382 1.17824 12.7695 1.13719 12.5168 1.33938C12.2641 1.54152 12.2231 1.91024 12.4253 2.16293L16.3512 7.07031H4.64879L8.57473 2.16293C8.77687 1.91024 8.7359 1.54149 8.48324 1.33938C8.23051 1.13719 7.8618 1.1782 7.65969 1.43086L3.14809 7.07031H1.08594C0.762344 7.07031 0.5 7.33266 0.5 7.65625V8.82813C0.5 9.15172 0.762344 9.41406 1.08594 9.41406H19.9141C20.2377 9.41406 20.5 9.15172 20.5 8.82813V7.65625C20.5 7.33266 20.2377 7.07031 19.9141 7.07031Z"
                      fill="white"
                    />
                    <path
                      d="M4.03871 18.3641C4.11059 18.6157 4.34051 18.7891 4.60211 18.7891H16.399C16.6606 18.7891 16.8905 18.6157 16.9624 18.3641L19.1847 10.5859H1.81641L4.03871 18.3641ZM13.1843 15.7631L13.7702 12.2475C13.8234 11.9282 14.1253 11.7125 14.4445 11.7658C14.7638 11.819 14.9794 12.1209 14.9262 12.4401L14.3402 15.9557C14.2925 16.2423 14.0442 16.4455 13.763 16.4455C13.731 16.4455 13.6986 16.4429 13.6659 16.4374C13.3467 16.3842 13.1311 16.0823 13.1843 15.7631ZM9.91461 12.3437C9.91461 12.0202 10.177 11.7578 10.5005 11.7578C10.8241 11.7578 11.0865 12.0202 11.0865 12.3437V15.8594C11.0865 16.183 10.8241 16.4453 10.5005 16.4453C10.177 16.4453 9.91461 16.183 9.91461 15.8594V12.3437ZM6.59562 11.7658C6.91488 11.7127 7.21672 11.9282 7.26992 12.2475L7.85586 15.7631C7.90906 16.0823 7.69344 16.3842 7.37422 16.4374C7.34164 16.4428 7.30918 16.4455 7.27719 16.4455C6.9959 16.4455 6.7477 16.2424 6.69992 15.9557L6.11398 12.4401C6.06078 12.1209 6.27641 11.819 6.59562 11.7658Z"
                      fill="white"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_891_2550">
                      <rect
                        width="20"
                        height="20"
                        fill="white"
                        transform="translate(0.5)"
                      />
                    </clipPath>
                  </defs>
                </svg>
                Thêm giỏ hàng
              </button>
            </div>
          </div>
        </div>
      </div>

      {screen === "mobile" ? (
        <>
          <div className="relative w-full aspect-[279/210] bg-gray-100 overflow-hidden flex items-center justify-center">
            {item.image ? (
              <SmartImage
                src={item.image}
                alt={item.title || item.name || "Course image"}
                width={279}
                height={210}
                className="group-hover/item:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg
                  className="w-16 h-16"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
          </div>
          <div className="px-6 py-6 h-[215px] flex flex-col justify-between">
            <div className="h-[130px] flex flex-col">
              <div className="text-[#235CD0] font-semibold mb-4">
                {item?.group?.name}
              </div>
              <div className="font-bold text-lg line-clamp-2 mb-4 h-[56px]">
                {truncateText(item?.name, 45)}
              </div>
              <div className="text-sm font-medium text-[#6C7086]">
                {item.teacher}
              </div>
            </div>
            {/* <div className="flex items-center gap-3 pt-2">
              <span className="text-[#F44336] font-bold text-lg">{Intl.NumberFormat('vi-VN').format(item?.price).replaceAll(".", ",")}đ</span>
              <span className="text-[#6C7086] line-through text-sm font-medium">{Intl.NumberFormat('vi-VN').format(item?.origin_price).replaceAll(".", ",")}đ</span>
            </div> */}
          </div>
        </>
      ) : (
        <>
          <div className="relative w-full aspect-[279/210] bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
            {item.image ? (
              <SmartImage
                src={item.image}
                alt={item.title || item.name || "Course image"}
                width={279}
                height={210}
                className="group-hover/item:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg
                  className="w-16 h-16"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
          </div>

          <div className="p-4 flex flex-col flex-grow">
            <div className="flex flex-col justify-between h-full">
              <div className="flex flex-col gap-2">
                <div className="text-[#235CD0] font-semibold">
                  {item?.group?.name}
                </div>
                <div className="font-bold text-lg min-h-[50px]">
                  {truncateText(item?.name, 45)}
                </div>
                <div className="text-sm font-medium text-[#6C7086]">
                  {item.teacher}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3 hidden">
                <div className="flex items-center gap-1">
                  <LessionIcon />
                  <span>30 bài giảng</span>
                </div>
                <div className="flex items-center gap-1">
                  <ExamIcon />
                  <span>30 bài tập</span>
                </div>
              </div>
              {/* <div className="flex items-center gap-2 mt-auto pt-3">
                <span className="text-[#F44336] font-bold text-lg">{Intl.NumberFormat('vi-VN').format(item?.price).replaceAll(".", ",")}đ</span>
                <span className="text-[#6C7086] line-through text-sm font-medium">{Intl.NumberFormat('vi-VN').format(item?.origin_price).replaceAll(".", ",")}đ</span>
              </div> */}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Item;
