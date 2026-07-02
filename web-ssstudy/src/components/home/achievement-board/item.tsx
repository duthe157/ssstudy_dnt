import { useEffect, useState } from "react";
import StudentIcon from "../../icons/StudentIcon";

const formatScore = (score: number) =>
  score?.toString().replace(".", ",");

const Item = ({ item, itemIndex, screen }) => {
  const [className, setClassName] = useState("w-full bg-white rounded-lg overflow-hidden relative group/item border shadow-sm hover:shadow-md transition-all duration-300");
  
  useEffect(() => {
    if (screen === "tablet") {
      setClassName("w-full bg-white rounded-lg overflow-hidden relative group/item border shadow-sm hover:shadow-md transition-all duration-300 h-full");
    } else if (screen === "mobile") {
      setClassName("w-full bg-white rounded-lg overflow-hidden relative group/item border shadow-sm hover:shadow-md transition-all duration-300");
    } else {
      setClassName("w-full bg-white rounded-lg overflow-hidden relative group/item border shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col");
    }
  }, [screen]);

  const imageUrl = item?.image || item?.avatar;
  const schoolInfo = item?.description || item?.address;
  const classInfo = item?.content;

  return (
    <div key={itemIndex} className={className}>
      <div className="w-full flex-shrink-0 bg-gray-100 overflow-hidden rounded-t-[6px] h-[203px]">
        <img
          src={imageUrl}
          alt={item?.name}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover/item:scale-105"
        />
      </div>

      <div className="flex flex-col gap-4 px-4 py-8">
        {item.data_json?.score && (
          <p className="text-[#f44336] font-bold text-[28px] leading-none truncate">
            {formatScore(item.data_json.score)}{" "}
            {item?.subject?.name}
          </p>
        )}

        <div className="flex flex-col gap-[10px]">
          <p className="text-[#242a4b] font-bold text-[20px] leading-[28px] line-clamp-1">
            {item?.name}
          </p>
          {schoolInfo && (
            <p className="text-[#50556f] font-medium text-[16px] leading-[24px] line-clamp-1">
              {schoolInfo}
            </p>
          )}
        </div>

        {classInfo && (
          <div className="flex items-center gap-[6px]">
            <StudentIcon />
            <p className="text-[#50556f] font-medium text-[14px] leading-[21px] truncate">
              {classInfo}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Item;
