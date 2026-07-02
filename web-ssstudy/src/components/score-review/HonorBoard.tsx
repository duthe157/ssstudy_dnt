import { useDialog } from "@/contexts/DialogProvider";
import { IHonorBoard, useGetHonorBoard } from "@/hooks/api";
import { cn } from "@/utils/cn";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import StudentIcon from "../icons/StudentIcon";
import { ImageWithFallback, Typography } from "../ui";
import ResultModal from "./ResultModal";
import SectionBoard from "./SectionBoard";
import { useHome } from "@/contexts/HomeContext";

const HonorBoard = () => {
  const dialog = useDialog();
  const [currentPage, setCurrentPage] = useState(1);

  const { dataHomePage, getDataHomePage, isDataLoaded } = useHome();

  useEffect(() => {
    if (!isDataLoaded) {
      getDataHomePage();
    }
  }, [getDataHomePage, isDataLoaded]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleShowResult = (id: string) => {
    dialog.show({
      component: <ResultModal id={id} />,
    });
  };

  const renderItem = (item: any) => (
    <div
      key={item._id}
      className="w-full relative rounded-md overflow-hidden group"
    >
      <div
        className={cn(
          "absolute top-0 left-0 w-full bottom-0 right-0 bg-black/40 opacity-0 group-hover:opacity-100",
          "flex items-center justify-center gap-3 z-10 cursor-pointer  transition-all duration-300"
        )}
        role="button"
        tabIndex={0}
        onClick={() => handleShowResult(item._id)}
        onKeyDown={() => undefined}
      >
        <Typography className="text-white">Xem kết quả</Typography>
        <ArrowRight className="text-white" />
      </div>
      <div className="w-full relative  aspect-[280/203]">
        <ImageWithFallback
          alt={item.title}
          src={item.image || "/imgs/home/thao.png"}
          fill
          fallbackSrc="/imgs/home/thao.png"
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="flex flex-col px-4 pt-8 pb-[20px] border border-border rounded-b-md">
        {/* <Typography variant={"lg24"} className="text-red-500 mb-4 font-bold">
          {item.score} Toán
        </Typography> */}
        <Typography variant={"md20"} className="font-bold mb-[10px]">
          {item?.name}
        </Typography>
        <Typography variant={"sm16"} className="text-foundation-400 mb-4">
          {item?.content}
        </Typography>
        <Typography
          variant={"xs14"}
          className="text-foundation-400 flex items-center gap-[6px]"
        >
          <StudentIcon />
          {item?.description}
        </Typography>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl">
      <SectionBoard
        title="Bảng vàng thành tích của SSStudy"
        colSpan={4}
        mobileRows={2}
        className="mt-16"
        totalPages={1}
        data={dataHomePage?.topRanks || []}
        isLoading={!isDataLoaded}
        renderItem={renderItem}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default HonorBoard;
