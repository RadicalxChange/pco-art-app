"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMediaQuery } from "react-responsive";
import { Flowbite, CustomFlowbiteTheme, Modal } from "flowbite-react";
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
    <div className="flex flex-center relative h-[calc(100vh-36px)] md:h-[calc(100vh-52px)]">
      <Image
        src="/hero.svg"
        alt="Hero"
        width={isMobile ? 212 : 650}
        height={isMobile ? 109 : 325}
        className="absolute"
      />
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
