"use client";
import { useDialog } from "@/contexts/DialogProvider";
import { IReview, useGetReviewList } from "@/hooks/api";
import { cn } from "@/utils/cn";
import { useEffect, useState } from "react";
import PlayVideoIcon from "../icons/PlayVideoIcon";
import { ImageWithFallback, Typography } from "../ui";
import SectionBoard from "./SectionBoard";
import VideoDisplay from "./VideoDisplay";

const ParentInterviews = () => {
  const dialog = useDialog();
  const [currentPage, setCurrentPage] = useState(1);

  const { trigger, data, isMutating } = useGetReviewList();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePlayVideo = (videoUrl: string) => {
    dialog.show({
      component: <VideoDisplay videoType="youtube" videoSrc={videoUrl} />,
      dialogClassName: "p-0 !max-h-full bg-transparent border-none",
    });
  };

  const renderInterviewItem = (item: IReview) => (
    <div
      key={item._id}
      className={cn(
        "w-full relative rounded-md overflow-hidden group hover:shadow-custom-light transition-all duration-300",
        "border bg-white border-border"
      )}
    >
      <div
        className="w-full relative aspect-[280/203] cursor-pointer overflow-hidden"
        onClick={() => handlePlayVideo(item.parents?.links || "")}
        role="button"
        tabIndex={0}
        onKeyDown={() => undefined}
      >
        <ImageWithFallback
          alt="parent interview image"
          src={item.parents?.thumnailImg || "/imgs/home/main-img.png"}
          fallbackSrc="/imgs/home/main-img.png"
          fill
          className="object-cover object-center group-hover:scale-105 duration-300 transition-all"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <PlayVideoIcon
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300",
            "group-hover:bg-white group-hover:[&_path]:fill-red-500 rounded-full"
          )}
        />
      </div>
      <div className="flex flex-col gap-4 p-4 rounded-b-md">
        <div className="flex items-center gap-4">
          <div className="relative size-[58px] rounded-full overflow-hidden">
            <ImageWithFallback
              alt="avatar"
              src={item.parents?.images || item.image}
              fallbackSrc="/imgs/home/avatar-1.png"
              fill
              className="object-cover object-center"
              sizes="58px"
            />
          </div>
          <div className="flex flex-col gap-[10px]">
            <Typography variant={"md20"} className="font-bold">
              {item.parents?.name || item.name}
            </Typography>
            <div className="flex items-center gap-1">
              <Typography variant={"sm16"}>{item.parents?.address || "Hà Nội"}</Typography>
            </div>
          </div>
        </div>
        <Typography variant={"sm16"} className="font-normal line-clamp-4">
          {item.parents?.description || item.description}
        </Typography>
      </div>
    </div>
  );

  useEffect(() => {
    trigger({ type: 1, page: currentPage, limit: 4 });
  }, [currentPage]);

  if (!data?.data.totalPages) {
    return null;
  }

  return (
    <div className="py-14 bg-blue-custom-50" style={{
      background:
          'linear-gradient(rgb(255, 255, 255) 0%, rgb(236, 248, 255) 8.17%, rgb(236, 248, 255) 92%',
    }}
    >
      <div className="mx-auto max-w-7xl ">
        <SectionBoard<IReview>
            title="Phỏng vấn phụ huynh"
            colSpan={4}
            isLoading={isMutating}
            data={data?.data.records || []}
            renderItem={renderInterviewItem}
            totalPages={data?.data.totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
        />

      </div>
    </div>
  );
};

export default ParentInterviews;
