import { cn } from "@/utils/cn";
import { Skeleton } from "../ui";
import { InterviewCardSkeleton } from "../ui/loading-skeleton";

type SectionBoardSkeletonProps = {
  colSpan?: 3 | 4;
  mobileRows?: 1 | 2;
  isSubTitle?: boolean;
};

export const SectionBoardSkeleton = ({
  colSpan = 4,
  mobileRows = 1,
  isSubTitle,
}: SectionBoardSkeletonProps) => {
  const desktopItemCount = colSpan;

  const mobileGroupCount = 2;

  return (
    <section className="flex flex-col items-center w-full">
      <div className="flex flex-col items-center w-full">
        <Skeleton className="h-10 w-1/2 max-w-sm rounded-lg" />
        {isSubTitle && (
          <Skeleton className="h-5 w-1/3 max-w-xs mt-3 rounded-lg" />
        )}
      </div>

      <div className="w-full mt-[60px] md:hidden">
        <div className="flex space-x-3 overflow-hidden p-1">
          {Array.from({ length: mobileGroupCount }).map((_, groupIndex) => (
            <div key={groupIndex} className="flex-[0_0_280px] space-y-4">
              {Array.from({ length: mobileRows }).map((_, itemIndex) => (
                <InterviewCardSkeleton key={itemIndex} />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div
        className={cn(
          "mt-[60px] w-full hidden md:grid gap-8 grid-cols-2",
          colSpan === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"
        )}
      >
        {Array.from({ length: desktopItemCount }).map((_, index) => (
          <InterviewCardSkeleton key={index} />
        ))}
      </div>

      <div className="mt-8 hidden md:flex items-center justify-center gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-9 w-20" />
      </div>
    </section>
  );
};
