import Image from "next/image";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export default function Intro({ nextStep }: { nextStep: () => void }) {
  const { address } = useAccount();
  const { openConnectModal } = useConnectModal();

  return (
    <>
      <div className="flex flex-col items-center max-w-[320px] sm:max-w-[750px] xl:max-w-[1100px] 2xl:max-w-[1500px] m-auto my-10 sm:mt-16 xl:mt-20 2xl:mt-24 min-[2000px]:mt-32">
        <h1 className="font-mono text-5xl sm:text-[75px] xl:text-[130px] 2xl:text-[145px] text-center">
          Mint Stewardship License (Testnet)
        </h1>
        <div className="w-[320px] sm:w-[600px] xl:w-[750px] 2xl:w-[1100px] mt-10 sm:mt-16 xl:mt-20 2xl:mt-24">
          <div className="flex text-sm sm:text-lg">
            <p className="w-[45%]">Intro</p>
            <p className="w-[55%]">
              You can create your own collection of PCOArt Stewardship Licences
              for your artwork by completing the steps below.{" "}
              <Link
                href="https://docs.pco.art"
                target="_blank"
                className="underline"
              >
                Documentation
              </Link>{" "}
              is available to help you through every step of the process.
            </p>
          </div>
          <div className="flex mt-10 text-sm sm:text-lg">
            <p className="w-[45%]">Testnet</p>
            <p className="w-[55%]">
              PCOArt is currently available for testing on the OP Sepolia
              testnet. If you need testnet tokens, we recommend using the{" "}
              <Link
                href="https://console.optimism.io/faucet"
                target="_blank"
                className="underline"
              >
                Superchain Faucet
              </Link>
              .
              <br />
              <br />
              If you are interested in using the full system or want to speak to
              us about developing your project using PCOArt,{" "}
              <Link
                href="mailto:fae@serpentinegalleries.org"
                target="_blank"
                className="underline"
              >
                please get in touch
              </Link>
              .
            </p>
          </div>
          <div className="flex mt-10 text-sm sm:text-lg">
            <p className="w-[45%]">Steps</p>
            <p className="w-[55%]">
              1. The Art
              <br />
              2. PCO Settings
              <br />
              3. Creator Circle
              <br />
              4. Auction Configuration
              <br />
              5. Inauguration Eligibility
              <br />
              6. Permissions
              <br />
              7. Review
            </p>
          </div>
        </div>
      </div>
      <button
        className="w-full mb-24 xl:mb-32 px-2 py-1 font-serif text-2xl gradient-action-btn"
        onClick={address ? nextStep : openConnectModal}
      >
        <div className="flex items-center gap-3 w-[320px] sm:w-[600px] xl:w-[750px] 2xl:w-[1100px] m-auto">
          <Image
            src="/forward-arrow.svg"
            alt="Forward"
            width={18}
            height={18}
          />{" "}
          {address ? "GET STARTED" : "CONNECT"}
        </div>
      </button>
    </>
  );
}
