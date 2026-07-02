"use client";

import { IReview, useGetReviewList } from "@/hooks/api";
import { cn } from "@/utils/cn";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import baseHelper from "../helpers/baseHelper";
import BadgeIcon from "../icons/BadgeIcon";
import DateIcon from "../icons/DateIcon";
import { ImageWithFallback, Typography } from "../ui";
import SectionBoard from "./SectionBoard";

const StudentFeedback = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const { trigger, data, isMutating } = useGetReviewList();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleOpenLink = (link: string) => {
    window.open(link, "_blank");
  };

  const renderItem = (item: IReview) => (
    <div
      key={item._id}
      className={cn(
        "overflow-hidden shadow-custom-light p-8 flex flex-col gap-4",
        "bg-white w-full rounded-md border group relative"
      )}
    >
      <div
        className={cn(
          "absolute top-0 left-0 w-full bottom-0 right-0 bg-black/40 opacity-0 transition-all duration-300",
          "flex items-center justify-center gap-3 z-10 cursor-pointer group-hover:opacity-100"
        )}
        role="button"
        tabIndex={0}
        onClick={() => handleOpenLink(item.parents?.links || "")}
        onKeyDown={() => undefined}
      >
        <Typography className="text-white">Xem review</Typography>
        <ArrowRight className="text-white" />
      </div>
      <div className="flex items-center gap-4">
        <div className="relative size-[58px] rounded-full overflow-hidden">
          <ImageWithFallback
            alt="avatar"
            src={"/imgs/home/avatar-1.png"}
            fallbackSrc="/imgs/home/avatar-1.png"
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="flex flex-col gap-[10px]">
          <Typography variant={"md20"} className="font-bold">
            {item.students?.name || item.name}
          </Typography>
          <div className="flex items-center gap-1">
            <DateIcon />
            <Typography variant={"xs14"}>
              {baseHelper.formatDateToString(item.created_at)}
            </Typography>
          </div>
        </div>
      </div>
      <div className="relative aspect-[320/233] w-full">
        <ImageWithFallback
          alt="result"
          src={item.students?.images || item.image}
          fallbackSrc="/imgs/home/student.png"
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <Typography variant={"sm16"} className="line-clamp-4">
        {item.students?.description || item.content}
      </Typography>
    </div>
  );

  useEffect(() => {
    trigger({ type: 0, page: currentPage, limit: 6 });
  }, [currentPage]);

  if (!data?.data.totalPages) {
    return null;
  }

  return (
    <div
      style={{
        background: `linear-gradient(180deg, #FFFFFF 0%, #ECF8FF 8.17%, #ECF8FF 92%, #FFFFFF 100%)`,
      }}
    >
      <div className="mx-auto max-w-7xl">
        <SectionBoard
          title="Tâm tình của học viên"
          mobileRows={2}
          subTitle={
            <>
              <BadgeIcon />
              <span>
                Hơn 130.000 học viên tin tưởng và theo học tại SSStudy
              </span>
            </>
          }
          className="py-16"
          isLoading={isMutating}
          data={data?.data.records || []}
          renderItem={renderItem}
          totalPages={data?.data.totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default StudentFeedback;
