import { useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { WalletConnectCustom } from "@/components/blockchain/wallet-connect-custom";

import { ResponsiveMobileAndDesktop } from "../shared/responsive-mobile-and-desktop";

interface Props {
  className?: string;
}

const menu = (
  <div className="flex flex-col gap-7 font-serif text-xl min-[2000px]:text-2xl font-thin lg:flex-row">
    <Link href="/" prefetch>
      PCO Art
    </Link>
    <Link href="/create" prefetch>
      Create
    </Link>
    <Link href="/about" prefetch>
      About
    </Link>
    <Link href="https://docs.pco.art" target="_blank">
      Docs
    </Link>
  </div>
);

export function Header(props: Props) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <>
      <header className="flex justify-between bg-neon-green px-5 py-1">
        <ResponsiveMobileAndDesktop>
          <button
            className="mb-1 bg-transparent"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <Image src="/menu.svg" width={32} height={32} alt="menu" />
          </button>
          {menu}
        </ResponsiveMobileAndDesktop>
        <WalletConnectCustom
          className="flex items-center font-serif text-xl min-[2000px]:text-2xl"
          classNameConnect="ml-1.5 bg-neon-green"
          labelConnect="Connect"
        />
      </header>
      {showMobileMenu && (
        <div className="w-screen bg-neon-green px-5 py-4">{menu}</div>
      )}
    </>
  );
}
