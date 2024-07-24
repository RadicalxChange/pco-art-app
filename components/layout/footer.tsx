import Image from "next/image";
import Link from "next/link";
import { useMediaQuery } from "react-responsive";

export function Footer() {
  const isMobileOrTablet = useMediaQuery({ query: "(max-width: 1280px)" });

  return (
    <footer className="flex flex-col md:flex-row items-center md:items-end justify-center md:justify-between gap-10 sm:gap-20 md:gap-0 px-5 py-3">
      <div className="flex items-start gap-5">
        <Image
          src="/serpentine.png"
          alt="Serpentine"
          width={isMobileOrTablet ? 100 : 148}
          height={isMobileOrTablet ? 32 : 50}
        />
        <Image
          src="/rxc-logo.svg"
          alt="RxC"
          width={isMobileOrTablet ? 38 : 47}
          height={isMobileOrTablet ? 30 : 38}
        />
      </div>
      <Link href="/" className="font-bold text-sm md:text-base">
        Terms & Conditions
      </Link>
      <p className="font-bold text-sm md:text-base">&#169; Serpentine 2024</p>
    </footer>
  );
}
