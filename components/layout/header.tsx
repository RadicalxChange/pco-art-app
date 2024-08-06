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
  <div className="flex flex-col gap-[1.1rem] font-serif text-[19.1px] font-thin lg:flex-row">
    <Link href="/" prefetch>
      <PlusSignAnimated>
        <span>PCO Art</span>
      </PlusSignAnimated>
    </Link>
    <Link href="/create" prefetch>
      <PlusSignAnimated>
        <span>Create</span>
      </PlusSignAnimated>
    </Link>
    <Link href="/about" prefetch>
      <PlusSignAnimated>
        <span>About</span>
      </PlusSignAnimated>
    </Link>
    <Link href="https://docs.pco.art" target="_blank">
      <PlusSignAnimated>
        <span>Docs</span>
      </PlusSignAnimated>
    </Link>
  </div>
);

export function Header(props: Props) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 flex justify-between bg-neon-green px-5 py-1">
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
          className="flex items-center font-serif text-[19.1px]"
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
