import Image from "next/image";
import React from "react";

export const Banner = () => {
  return (
    <section className="w-full relative aspect-[1499/490]">
      <Image
        src={"/imgs/diem-review/banner.png"}
        alt="banner"
        fill
        quality={100}
        className="object-cover object-center"
      />
    </section>
  );
};
