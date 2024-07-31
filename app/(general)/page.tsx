"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMediaQuery } from "react-responsive";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function Home() {
  const [openDialog, setOpenDialog] = useState(true);

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
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="bg-neon-green">
          <span className="flex flex-col font-mono text-[50px] sm:text-[100px] min-[2000px]:text-[160px] text-center leading-none">
            PCO <br />
            TESTNET <br />
            MODE
          </span>
          <div className="w-full lg:h-[250px] 2xl:h-[350px] overflow-hidden">
            <img src="butterfly.png" alt="Pop-Up" />
          </div>
          <Link
            href="https://docs.pco.art"
            target="_blank"
            className="font-serif text-xl"
          >
            Learn More!
          </Link>
        </DialogContent>
      </Dialog>
    </div>
  );
}
