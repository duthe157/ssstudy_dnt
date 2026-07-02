import {
  IStudentStory,
  useGetStudentStoryList,
} from "@/hooks/api/useGetStudentStoryList";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Typography } from "../ui";
import SectionBoard from "./SectionBoard";

const StudentStory = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  const { trigger, data, isMutating } = useGetStudentStoryList();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const onClickViewAll = () => {
    window.open("/cau-chuyen-hoc-vien", "_blank");
  };

  const handleViewDetail = (alias: string) => {
    window.open(`/cau-chuyen-hoc-vien/${alias}`, "_blank");
  };

  const renderItem = (item: IStudentStory) => (
    <div
      key={item._id}
      className="w-full flex flex-col relative rounded-md overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-custom-light"
      role="button"
      tabIndex={0}
      onClick={() => handleViewDetail(item.alias)}
      onKeyDown={() => undefined}
    >
      <div className="w-full relative  aspect-video overflow-hidden">
        <Image
          alt="student image"
          src={item?.image || "/imgs/home/student.png"}
          fill
          className="object-cover object-center group-hover:scale-105 duration-300 transition-all"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="flex flex-col flex-1 p-4 border border-border rounded-b-md">
        <Typography
          variant={"md20"}
          className="text-foundation-400 mb-[10px] font-bold"
        >
          {item.name}
        </Typography>
        <Typography
          variant={"sm16"}
          className="text-foundation-400 line-clamp-4"
        >
          <span dangerouslySetInnerHTML={{ __html: item.description }} />
        </Typography>
      </div>
    </div>
  );

  useEffect(() => {
    trigger({ page: currentPage, limit: 6 });
  }, [currentPage]);

  if (!data?.data.totalPages) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl">
      <SectionBoard
        title="Câu chuyện học viên"
        showViewAll
        mobileRows={2}
        isLoading={isMutating}
        data={data?.data.records || []}
        renderItem={renderItem}
        totalPages={data?.data.totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onClickViewAll={onClickViewAll}
      />
    </div>
  );
};

export default StudentStory;
