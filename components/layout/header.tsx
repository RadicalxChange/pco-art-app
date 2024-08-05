import { useState } from "react";

import Image from "next/image";
import Link from "next/link";

import PlusSignAnimated from "@/components/shared/plus-sign-animated";
import { WalletConnectCustom } from "@/components/blockchain/wallet-connect-custom";

import { ResponsiveMobileAndDesktop } from "../shared/responsive-mobile-and-desktop";

interface Props {
  className?: string;
}

const menu = (
  <div className="flex flex-col gap-7 font-serif text-xl font-thin lg:flex-row">
    <PlusSignAnimated>
      <Link href="/" prefetch>
        PCO Art
      </Link>
    </PlusSignAnimated>
    <PlusSignAnimated>
      <Link href="/create" prefetch>
        Create
      </Link>
    </PlusSignAnimated>
    <PlusSignAnimated>
      <Link href="/about" prefetch>
        About
      </Link>
    </PlusSignAnimated>
    <PlusSignAnimated>
      <Link href="https://docs.pco.art" target="_blank">
        Docs
      </Link>
    </PlusSignAnimated>
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
          className="flex items-center font-serif text-xl"
          classNameConnect="bg-neon-green"
          labelConnect="Connect"
        />
      </header>
      {showMobileMenu && (
        <div className="w-screen bg-neon-green px-5 py-4">{menu}</div>
      )}
    </>
  );
}
