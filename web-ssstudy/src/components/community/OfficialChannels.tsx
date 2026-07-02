import { FC } from "react";
import Facebook from "../icons/FaceBook";
import Zalo from "../icons/Zalo";
import Youtube from "../icons/Youtube";
import Tiktok from "../icons/Tiktok";
import User from "../icons/User";

const channels = [
  {
    id: "facebook",
    name: "Facebook",
    icon: <Facebook />,
    members: 5000,
    button: true,
    bg: '#E9EFFA'
  },
  {
    id: "zalo",
    name: "Zalo",
    icon: <Zalo />,
    members: 5000,
    button: true,
    bg: '#E9EFFA'
  },
  {
    id: "youtube",
    name: "Youtube",
    icon: <Youtube />,
    members: 5000,
    button: true,
    bg: '#FEECEB'
  },
  {
    id: "tiktok",
    name: "Tiktok",
    icon: <Tiktok />,
    members: 5000,
    button: true,
    bg: '#F2F2FF'
  },
];

const OfficialChannels: FC = () => {
  return (
    <section className="container mx-auto">
      <div className="flex items-center justify-between flex-wrap">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
          Kênh chính thức
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 cursor-pointer">
        {channels.map((channel) => (
          <div
            key={channel.id}
            className="group relative flex flex-col gap-2 border border-gray-200 rounded-lg p-6 shadow-sm bg-white transition-all hover:shadow-md"
          >
            {/* Icon + Channel name */}
            <div className="flex items-center gap-3 mb-3">
            <div
                className="min-h-[49px] py-2 px-4 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: channel.bg }}
              >
                {channel.icon}
              </div>
              <span className="font-semibold text-blue-600">
                {channel.name}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Cộng đồng học tập của SSStudy
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-4 leading-relaxed transition-all duration-300 group-hover:line-clamp-2 group-hover:overflow-hidden group-hover:text-ellipsis">
              Chia sẻ phương pháp học tập hiệu quả và hữu ích, tham gia ngay để nhận được những tip học hành nhanh nhất và bám sát đề thi nhất.
            </p>

            {/* Members */}
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <User />
              {channel.members.toLocaleString()} thành viên
            </div>

            {/* Hover button wrapper */}
            <div className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {channel.button && (
                <button className="w-full bg-blue-600 text-white text-sm font-medium py-2 rounded-md">
                  Tham gia ngay
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OfficialChannels;
