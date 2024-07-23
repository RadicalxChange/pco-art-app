"use client";
import Image from "next/image";
import CrossIcon from "@/components/shared/cross-icon";
import { useMediaQuery } from "react-responsive";

export default function Home() {
  const isMobile = useMediaQuery({ query: "(max-width: 640px)" });
  const isTablet = useMediaQuery({ query: "(max-width: 1280px)" });
  const isMediumScreen = useMediaQuery({
    query: "(min-width: 2000px)",
  });

  return (
    <>
      <div className="flex justify-between mt-32 xl:mt-20 2xl:mt-32 min-[2000px]:mt-32 min-[3000px]:mt-44 mb-12 md:mb-24 2xl:mb-24 min-[2000px]:mb-[170px] px-5">
        <CrossIcon />
        <CrossIcon />
      </div>
      <div className="flex justify-between">
        <div className="flex flex-col gap-12 md:gap-24 2xl:gap-24 min-[2000px]:gap-[170px] ml-5">
          <CrossIcon />
          <CrossIcon />
          <CrossIcon />
        </div>
        <div className="flex flex-col items-center">
          <div
            className="flex justify-between"
            style={{
              width: isMobile ? 232 : isMediumScreen ? 690 : 418,
            }}
          >
            <CrossIcon />
            <CrossIcon />
            <CrossIcon />
            <CrossIcon />
          </div>
          <Image
            src="/hero.svg"
            alt="Hero"
            width={isMobile ? 212 : isMediumScreen ? 656 : 395}
            height={isMobile ? 109 : isMediumScreen ? 336 : 202}
          />
          <div
            className="flex justify-between"
            style={{
              width: isMobile ? 232 : isMediumScreen ? 690 : 418,
            }}
          >
            <CrossIcon />
            <CrossIcon />
            <CrossIcon />
            <CrossIcon />
          </div>
        </div>
        <div className="flex flex-col gap-12 md:gap-24 2xl:gap-24 min-[2000px]:gap-[170px] mr-5">
          <CrossIcon />
          <CrossIcon />
          <CrossIcon />
        </div>
      </div>
      <div className="flex justify-between gap-12 my-12 md:my-24 2xl:my-24 min-[2000px]:my-[170px] px-5">
        <CrossIcon />
        <CrossIcon />
      </div>
      <div className="flex justify-between mt-12 md:mt-24 2xl:mt-24 min-[2000px]:mt-[170px] mb-32 xl:mb-16 2xl:mb-32 min-[2000px]:mb-28 min-[3000px]:mb-40 px-5">
        <CrossIcon />
        <CrossIcon />
      </div>
    </>
  );
}
