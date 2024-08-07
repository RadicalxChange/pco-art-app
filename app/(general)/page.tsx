"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMediaQuery } from "react-responsive";
import { Flowbite, CustomFlowbiteTheme, Modal } from "flowbite-react";
import PlusSignIcon from "@/components/shared/plus-sign-icon";
import PlusSignAnimated from "@/components/shared/plus-sign-animated";

const customTheme: CustomFlowbiteTheme = {
  modal: {
    content: {
      inner: "relative flex max-h-[75dvh] flex-col mt-[50px] sm:mt-0",
    },
  },
};

export default function Home() {
  const [openModal, setOpenModal] = useState(true);

  const isMobile = useMediaQuery({ query: "(max-width: 640px)" });

  return (
    <div className="flex justify-between items-center h-[calc(100vh-36px)] md:h-[calc(100vh-56px)]">
      <div className="flex flex-col justify-between h-full px-4">
        <span className="opacity-0">
          <PlusSignIcon />
        </span>
        <PlusSignIcon />
        <PlusSignIcon />
      </div>
      <div className="flex justify-between">
        <div className="flex flex-col justify-between">
          <PlusSignIcon />
          <PlusSignIcon />
        </div>
        <Image
          src="/hero.svg"
          alt="Hero"
          width={isMobile ? 212 : 650}
          height={isMobile ? 109 : 325}
          className="py-[6px]"
        />
        <div className="flex flex-col justify-between">
          <PlusSignIcon />
          <PlusSignIcon />
        </div>
      </div>
      <div className="flex flex-col justify-between h-full px-4">
        <span className="opacity-0">
          <PlusSignIcon />
        </span>
        <PlusSignIcon />
        <PlusSignIcon />
      </div>
      <Flowbite theme={{ theme: customTheme }}>
        <Modal
          show={openModal}
          size="2xl"
          dismissible
          onClose={() => setOpenModal(false)}
          className="bg-transparent opacity-1"
        >
          <Modal.Body className="bg-neon-green p-[15px] pb-0">
            <button
              className="float-right focus:outline-none"
              onClick={() => setOpenModal(false)}
            >
              <Image src="/close.svg" alt="Close" width={15} height={15} />
            </button>
            <h1 className="flex flex-col font-mono text-[50px] xl:text-[130px] 2xl:text-[145px] text-center">
              PCO <br />
              TESTNET <br />
              MODE
            </h1>
            <div className="w-full mt-3 bg-off-white">
              <img src="hero.svg" alt="Pop-Up" />
            </div>
            <p className="text-lg mt-4">
              PCO is currently only available to test using a testnet
              blockchain. To find out more about using the testnet and the
              claiming test tokens{" "}
              <Link
                href="https://docs.optimism.io/builders/tools/build/faucets"
                target="_blank"
                className="underline"
              >
                click here
              </Link>
              . If you are interested on using the full system or want to speak
              to us about developing your project using PCO, please{" "}
              <Link
                href="fae@serpentinegalleries.org"
                target="_blank"
                className="underline"
              >
                get in touch
              </Link>
              .
            </p>
            <Modal.Footer className="sticky bottom-0 border-0 rounded-none bg-neon-green px-0 py-[8px]">
              <Link
                href="https://docs.pco.art/testnet"
                target="_blank"
                className="font-serif text-[19.1px]"
              >
                <PlusSignAnimated>
                  <span>Learn More!</span>
                </PlusSignAnimated>
              </Link>
            </Modal.Footer>
          </Modal.Body>
        </Modal>
      </Flowbite>
    </div>
  );
}
