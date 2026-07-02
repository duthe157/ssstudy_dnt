import React, { useEffect } from "react";
import { Typography } from "../ui";
import Image from "next/image";
import { useReviewDetail } from "@/hooks/api";

type Props = {
  id: string;
};
const ResultModal = ({ id }: Props) => {
  const { trigger, data, isMutating } = useReviewDetail();

  useEffect(() => {
    trigger({ id });
  }, []);

  return (
    <div className="w-[80vw] md:w-[416px]">
      <Typography variant={"md20"} className="text-foundation-900">
        {data?.data?.students?.name}
      </Typography>
      <Typography variant={"sm16"} className="mt-[10px] mb-4">
        THPT Quốc Oai, Hà Nội
      </Typography>
      <div className="w-full relative aspect-[3/4]">
        <Image
          alt="result"
          src="https://edmicro.edu.vn/wp-content/uploads/2023/12/ngay-cap-chung-chi-ielts-ghi-o-dau-huong-dan-min.png"
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    </div>
  );
};

export default ResultModal;
