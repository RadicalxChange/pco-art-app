import Link from "next/link";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import ForwardArrowAnimated from "@/components/shared/forward-arrow-animated";
import PlusSignIcon from "@/components/shared/plus-sign-icon";

export default function Intro({ nextStep }: { nextStep: () => void }) {
  const { address } = useAccount();
  const { openConnectModal } = useConnectModal();

  return (
    <>
      <div className="flex justify-between w-full mt-12 sm:mt-16 xl:mt-20 2xl:mt-24 min-[2000px]:mt-32 px-4">
        <div className="flex flex-col justify-between">
          <PlusSignIcon />
          <PlusSignIcon />
        </div>
        <h1 className="max-w-[320px] sm:max-w-[750px] xl:max-w-[1100px] 2xl:max-w-[1500px] font-mono text-5xl sm:text-[75px] xl:text-[130px] 2xl:text-[145px] text-center">
          Mint Stewardship License (Testnet)
        </h1>
        <div className="flex flex-col justify-between">
          <PlusSignIcon />
          <PlusSignIcon />
        </div>
      </div>
      <div className="flex flex-col items-center text-sm sm:text-lg">
        <div className="flex justify-between items-start w-full mt-12 sm:mt-16 xl:mt-20 2xl:mt-24 px-4">
          <PlusSignIcon />
          <div className="flex w-[320px] sm:w-[600px] xl:w-[750px] 2xl:w-[1100px] m-auto">
            <div className="flex text-sm sm:text-lg">
              <div className="flex items-start gap-2 w-[45%]">
                <PlusSignIcon />
                <p>Intro</p>
              </div>
              <div className="flex items-start gap-2 w-[55%]">
                <p>
                  You can create your own collection of PCOArt Stewardship
                  Licences for your artwork by completing the steps below.{" "}
                  <Link
                    href="https://docs.pco.art"
                    target="_blank"
                    className="underline"
                  >
                    Documentation
                  </Link>{" "}
                  is available to help you through every step of the process.
                </p>
                <PlusSignIcon />
              </div>
            </div>
          </div>
          <PlusSignIcon />
        </div>
        <div className="w-[320px] sm:w-[600px] xl:w-[750px] 2xl:w-[1100px]">
          <div className="flex mt-10 text-sm sm:text-lg">
            <div className="flex items-start gap-2 w-[45%]">
              <PlusSignIcon />
              <p>Testnet</p>
            </div>
            <div className="flex items-start gap-2 w-[55%]">
              <p>
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
                If you are interested in using the full system or want to speak
                to us about developing your project using PCOArt,{" "}
                <Link
                  href="mailto:fae@serpentinegalleries.org"
                  target="_blank"
                  className="underline"
                >
                  please get in touch
                </Link>
                .
              </p>
              <PlusSignIcon />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-start w-full mt-12 px-4">
        <PlusSignIcon />
        <div className="flex items-start w-[320px] sm:w-[600px] xl:w-[750px] 2xl:w-[1100px]">
          <div className="flex w-full text-sm sm:text-lg">
            <div className="flex items-start gap-2 w-[45%]">
              <PlusSignIcon />
              <p>Steps</p>
            </div>
            <div className="flex items-start gap-2 w-[55%]">
              <p className="w-full">
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
              <PlusSignIcon />
            </div>
          </div>
        </div>
        <PlusSignIcon />
      </div>
      <button
        className="w-full mt-12 mb-24 xl:mb-32 font-serif text-2xl gradient-action-btn px-2"
        onClick={address ? nextStep : openConnectModal}
      >
        <div className="flex items-center w-[320px] sm:w-[600px] xl:w-[750px] 2xl:w-[1100px] m-auto">
          <ForwardArrowAnimated>
            <span>{address ? "GET STARTED" : "CONNECT"}</span>
          </ForwardArrowAnimated>
        </div>
      </button>
    </>
  );
}
