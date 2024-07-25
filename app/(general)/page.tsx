"use client";
import Image from "next/image";
import { useMediaQuery } from "react-responsive";

export default function Home() {
  const isMobile = useMediaQuery({ query: "(max-width: 640px)" });
  const isMediumScreen = useMediaQuery({
    query: "(min-width: 2000px)",
  });

  return (
    <div className="flex flex-center relative h-[calc(100vh-215px)] md:h-[calc(100vh-106px)] min-[2000px]:h-[calc(100vh-111px)]">
      <Image
        src="/hero.svg"
        alt="Hero"
        width={isMobile ? 212 : isMediumScreen ? 656 : 395}
        height={isMobile ? 109 : isMediumScreen ? 336 : 202}
        className="absolute"
      />
    </div>
  );
}
