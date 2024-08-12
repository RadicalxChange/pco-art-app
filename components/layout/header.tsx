import { useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { useMediaQuery } from "react-responsive";

import PlusSignAnimated from "@/components/shared/plus-sign-animated";
import { ResponsiveMobileAndDesktop } from "@/components/shared/responsive-mobile-and-desktop";
import { WalletConnectCustom } from "@/components/blockchain/wallet-connect-custom";

interface Props {
  className?: string;
}

const Menu = (props: { closeMobileMenu: () => void }) => {
  const { closeMobileMenu } = props;

  return (
    <>
      <button className="xl:hidden float-right" onClick={closeMobileMenu}>
        <Image src="/close.svg" alt="Close" width={14} height={14} />
      </button>
      <div className="flex flex-col gap-[1.1rem] font-serif text-[19.1px] font-thin xl:flex-row">
        <Link href="/" prefetch onClick={closeMobileMenu}>
          <PlusSignAnimated>
            <span>PCO Art</span>
          </PlusSignAnimated>
        </Link>
        <Link href="/create" prefetch onClick={closeMobileMenu}>
          <PlusSignAnimated>
            <span>Create</span>
          </PlusSignAnimated>
        </Link>
        <Link href="/about" prefetch onClick={closeMobileMenu}>
          <PlusSignAnimated>
            <span>About</span>
          </PlusSignAnimated>
        </Link>
        <Link
          href="https://docs.pco.art"
          target="_blank"
          onClick={closeMobileMenu}
        >
          <PlusSignAnimated>
            <span>Docs</span>
          </PlusSignAnimated>
        </Link>
      </div>
    </>
  );
};

export function Header(props: Props) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const isMobileOrTablet = useMediaQuery(
    { maxWidth: 1279 },
    void 0,
    (match) => {
      if (!match) {
        setShowMobileMenu(false);
      }
    }
  );

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
          <Menu closeMobileMenu={() => setShowMobileMenu(false)} />
        </ResponsiveMobileAndDesktop>
        <WalletConnectCustom
          className="flex items-center font-serif text-[19.1px]"
          classNameConnect="bg-neon-green"
          labelConnect="Connect"
        />
      </header>
      {showMobileMenu && (
        <div className="w-screen bg-neon-green px-5 py-4">
          <Menu closeMobileMenu={() => setShowMobileMenu(false)} />
        </div>
      )}
    </>
  );
}
