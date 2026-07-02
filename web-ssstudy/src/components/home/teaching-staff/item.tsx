import { useEffect, useState } from "react";
import AwardIcon from "../../icons/AwardIcon";

const Item = ({ item, itemIndex, screen }) => {
  const [className, setClassName] = useState(
    "w-full bg-white rounded-lg overflow-hidden relative group/item border shadow-sm hover:shadow-md transition-all duration-300"
  );

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

  const getContainerStyle = () => {
    if (screen === "mobile") {
      return {
        height: "auto",
        marginBottom: "24px",
      };
    } else {
      return {
        width: "100%",
        height: "100%",
        marginBottom: "8px",
      };
    }
  };

  return (
    <div key={itemIndex} className={className} style={getContainerStyle()}>
      {/* Hover */}
      <div className="cursor-pointer absolute inset-0 opacity-0 group-hover/item:opacity-100 transition-all duration-300 flex flex-col justify-center items-center z-20 h-full w-full rounded-lg">
        <div className="bg-gray-100/95 backdrop-blur-sm flex items-center justify-center h-full w-full rounded-lg">
          <div className="flex flex-col justify-between bg-white h-full p-5 w-full rounded-lg">
            <div className="flex items-center gap-2">
              <h3 className="text-[#242A4B] font-bold text-lg">
                {item?.fullname}
              </h3>
              <AwardIcon />
            </div>
            <div className="h-[200px] text-[#6C7086] overflow-y-auto text-base mb-4">
              <div
                dangerouslySetInnerHTML={{ __html: item?.description }}
              ></div>
            </div>

            <a
              href={`/giao-vien/${item?.alias}`}
              className="w-full font-bold h-[35px] text-sm border border-[#235CD0] text-[#235CD0] rounded-full hover:bg-[#235CD0] hover:text-white transition-colors flex items-center justify-center"
            >
              Xem chi tiết
            </a>
          </div>
        </div>
      </div>

      {screen === "mobile" ? (
        <div className="w-full bg-gray-100 overflow-hidden rounded-lg">
          <img
            src={`https://cdn.luyenthitiendat.vn/${item?.profile_pic}`}
            alt={item?.fullname}
            className="w-full h-auto object-contain transition-transform duration-500 rounded-lg"
          />
        </div>
      ) : (
        <div className="w-full flex-shrink-0 bg-gray-100 overflow-hidden rounded-lg">
          <img
            src={`https://cdn.luyenthitiendat.vn/${item?.profile_pic}`}
            alt={item?.fullname}
            className="w-full h-auto object-contain transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-4 pb-6">
        <div className="flex gap-2 text-[#242A4B] font-bold text-base">
          <span>{item?.fullname}</span>
          <AwardIcon />
        </div>
      </div>
    </div>
  );
};

export default Item;
