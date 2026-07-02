import { cn } from "@/utils/cn";
import { ArrowRight, Loader2 } from "lucide-react";
import React, { ReactNode, useEffect, useMemo, useState } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  Pagination,
  Typography,
} from "../ui";
import { useIsMobile } from "@/hooks/useIsMobile";
import { SectionBoardSkeleton } from "./SectionBoardSkeleton";

type SectionBoardProps<T> = {
  title: string;
  subTitle?: ReactNode;
  colSpan?: 3 | 4;
  mobileRows?: 1 | 2;
  className?: string;
  style?: React.CSSProperties;

  data: T[];
  renderItem: (item: T, index: number) => ReactNode;

  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;

  showViewAll?: boolean;
  onClickViewAll?: () => void;
  isLoading?: boolean;
};

const SectionBoard = <T,>(props: SectionBoardProps<T>) => {
  const {
    title,
    subTitle,
    colSpan = 3,
    className,
    style,
    data,
    renderItem,
    totalPages = 1,
    currentPage = 1,
    mobileRows = 1,
    onPageChange,
    showViewAll,
    onClickViewAll,
    isLoading,
  } = props;
  const isMobile = useIsMobile();
  const [api, setApi] = useState<CarouselApi>();

  const showPagination = totalPages > 1 && onPageChange;

  const groupedData = useMemo(() => {
    if (mobileRows !== 2) return [];

    const groups: T[][] = [];
    for (let i = 0; i < data.length; i += 2) {
      groups.push(data.slice(i, i + 2));
    }
    return groups;
  }, [data, mobileRows]);

  useEffect(() => {
    if (!api) {
      return;
    }

    const handleSelect = () => {
      if (isLoading || !onPageChange) return;

      const canScrollNext = api.canScrollNext();
      const isLastPage = currentPage >= totalPages;

      if (!canScrollNext && !isLastPage) {
        onPageChange(currentPage + 1);
      }
    };

    api.on("select", handleSelect);

    return () => {
      api.off("select", handleSelect);
    };
  }, [api, isLoading, currentPage, totalPages, onPageChange]);

  if (isLoading) {
    return <SectionBoardSkeleton />;
  }

  return (
    <section
      className={cn("flex flex-col items-center", className)}
      style={style}
    >
      <div
        className={cn(
          "relative flex items-center justify-center w-full",
          isMobile && "flex-col"
        )}
      >
        <Typography
          variant={"xl40"}
          className=" text-foundation-900 text-center"
        >
          {title}
        </Typography>
        {showViewAll && (
          <Typography
            className={cn(
              "flex items-center gap-3 text-blue-500 absolute right-0 cursor-pointer",
              isMobile && "relative"
            )}
            onClick={onClickViewAll}
          >
            Xem tất cả
            <ArrowRight className="text-blue-500" />
          </Typography>
        )}
      </div>
      {subTitle && (
        <Typography
          variant={"sm16"}
          className=" text-red-500 flex items-center gap-3 mt-3 text-center"
        >
          {subTitle}
        </Typography>
      )}

      {isMobile && (
        <Carousel
          opts={{
            align: "start",
          }}
          setApi={setApi}
          className="w-full mt-[60px]"
        >
          <CarouselContent className="-ml-3">
            {mobileRows === 1 &&
              data.map((item, index) => (
                <CarouselItem key={index} className="flex-[0_0_280px] pl-3">
                  {renderItem(item, index)}
                </CarouselItem>
              ))}

            {mobileRows === 2 &&
              groupedData.map((group, groupIndex) => (
                <CarouselItem
                  key={groupIndex}
                  className="flex-[0_0_280px] pl-3"
                >
                  <div className="flex flex-col gap-4">
                    {group.map((item, itemIndex) => (
                      <React.Fragment key={itemIndex}>
                        {renderItem(item, data.indexOf(item))}
                      </React.Fragment>
                    ))}
                  </div>
                </CarouselItem>
              ))}
            {isLoading && (
              <CarouselItem className="flex-[0_0_280px] pl-3">
                <div className="w-full h-full flex items-center justify-center bg-muted/50 rounded-lg">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              </CarouselItem>
            )}
          </CarouselContent>
        </Carousel>
      )}

      {!isMobile && (
        <div
          className={cn(
            "mt-[60px] grid gap-8 w-full md:grid-cols-2 grid-cols-1",
            colSpan === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"
          )}
        >
          {data?.map((item, index) => (
            <React.Fragment key={index}>
              {renderItem(item, index)}
            </React.Fragment>
          ))}
        </div>
      )}

      {showPagination && !isMobile && (
        <div className="mt-8 flex justify-center">
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </section>
  );
};

export default SectionBoard;
