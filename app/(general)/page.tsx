"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMediaQuery } from "react-responsive";
import { Flowbite, CustomFlowbiteTheme, Modal } from "flowbite-react";

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
      <Flowbite theme={{ theme: customTheme }}>
        <Modal
          show={openModal}
          size="xl"
          onClose={() => setOpenModal(false)}
          className="bg-transparent opacity-1"
        >
          <Modal.Body className="bg-neon-green p-[15px]">
            <button className="float-right" onClick={() => setOpenModal(false)}>
              <Image src="/close.svg" alt="Close" width={15} height={15} />
            </button>
            <h1 className="flex flex-col font-mono text-[50px] xl:text-[130px] 2xl:text-[145px] text-center">
              PCO <br />
              TESTNET <br />
              MODE
            </h1>
            <div className="w-full mt-3">
              <img src="placeholder-image.jpg" alt="Pop-Up" />
            </div>
            <p className="text-lg mt-4 mb-5">
              PCO is currently only available to test using a testnet
              blockchain. To find out more about using the testnet and the
              claiming test tokens{" "}
              <Link
                href="https://docs.optimism.io/builders/tools/build/faucets"
                target="_blank"
                className="underline text-xl"
              >
                click here
              </Link>
              . If you are interested on using the full system or want to speak
              to us about developing your project using PCO, please{" "}
              <Link
                href="fae@serpentinegalleries.org"
                target="_blank"
                className="underline text-xl"
              >
                get in touch
              </Link>
              .
            </p>
            <Link
              href="https://docs.pco.art/testnet"
              target="_blank"
              className="font-serif text-xl"
            >
              Learn More!
            </Link>
          </Modal.Body>
        </Modal>
      </Flowbite>
    </div>
  );
}
