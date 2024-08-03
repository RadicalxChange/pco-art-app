import Image from "next/image";
import Link from "next/link";
import { useMediaQuery } from "react-responsive";

export function Footer() {
  const isMobileOrTablet = useMediaQuery({ query: "(max-width: 1280px)" });

  return (
    <footer className="flex flex-col md:flex-row items-center md:items-end justify-center md:justify-between gap-10 sm:gap-20 md:gap-0 mt-auto px-5 pt-3 sm:pt-[74px] pb-3">
      <div className="flex gap-5">
        <Image
          src="/serpentine.svg"
          alt="Serpentine"
          width={isMobileOrTablet ? 92 : 128}
          height={isMobileOrTablet ? 34 : 43}
        />
        <Image
          src="/rxc-logo.svg"
          alt="RxC"
          width={isMobileOrTablet ? 35 : 47}
          height={isMobileOrTablet ? 30 : 38}
        />
      </div>
      <Link href="/" className="text-sm md:text-base">
        Terms & Conditions
      </Link>
      <p className="text-sm md:text-base">&#169; Serpentine 2024</p>
    </footer>
  );
}
