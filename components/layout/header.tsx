import { useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { WalletConnectCustom } from "@/components/blockchain/wallet-connect-custom";

import { ResponsiveMobileAndDesktop } from "../shared/responsive-mobile-and-desktop";

interface Props {
  className?: string;
}

const menu = (
  <div className="flex flex-col gap-7 font-serif text-2xl font-thin lg:flex-row">
    <Link
      className="flex-start flex items-center gap-x-1.5 lg:justify-center"
      href="/"
    >
      <Image
        src="/cross.svg"
        width={16}
        height={16}
        alt="cross"
        className="mb-1"
      />
      <span>PCO Art</span>
    </Link>
    <Link
      className="flex-start flex items-center gap-x-1.5 lg:justify-center"
      href="/create"
    >
      <Image
        src="/cross.svg"
        width={16}
        height={16}
        alt="cross"
        className="mb-1"
      />
      <span>Create</span>
    </Link>
    <Link
      className="flex-start flex items-center gap-x-1.5 lg:justify-center"
      href="https://www.radicalxchange.org/wiki/pco-art"
    >
      <Image
        src="/cross.svg"
        width={16}
        height={16}
        alt="cross"
        className="mb-1"
      />
      <span>About</span>
    </Link>
    <Link
      className="flex-start flex items-center gap-x-1.5 lg:justify-center"
      href="https://pco-art-docs.vercel.app"
    >
      <Image
        src="/cross.svg"
        width={16}
        height={16}
        alt="cross"
        className="mb-1"
      />
      <span>Docs</span>
    </Link>
  </div>
);

export function Header(props: Props) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <>
      <header className="flex justify-between bg-neon-green px-4 pt-2 pb-1">
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
          className="flex items-center font-serif text-2xl"
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
