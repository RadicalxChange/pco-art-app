import Image from "next/image";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export default function Intro({ nextStep }: { nextStep: () => void }) {
  const { address } = useAccount();
  const { openConnectModal } = useConnectModal();

  return (
    <>
      <div className="flex flex-col items-center max-w-[300px] sm:max-w-[750px] xl:max-w-[1100px] 2xl:max-w-[1200px] m-auto my-10 sm:mt-16 xl:mt20 2x:xl:mt-24">
        <h1 className="font-mono text-5xl sm:text-[75px] xl:text-[100px] 2xl:text-[128px] text-center leading-none">
          Mint Stewardship License
        </h1>
        <div className="w-[300px] sm:w-[500px] xl:w-[750px] 2xl:w-[850px] mt-10 sm:mt-16 xl:mt-20 2xl:mt-24">
          <div className="flex">
            <p className="w-1/3 sm:text-xl">Intro</p>
            <p className="w-2/3 sm:text-xl text-neon-pink">
              Follow these steps to mint a Stewardship Licence for your artwork.
              We recommend keeping the documentation close to guide you through
              this process.
            </p>
          </div>
          <div className="flex mt-10">
            <p className="w-1/3 sm:text-xl">Steps</p>
            <p className="w-2/3 sm:text-xl">
              1. The Art
              <br />
              2. PCO Settings
              <br />
              3. Creator Circle
              <br />
              4. Auction Configuration
              <br />
              5. Auction Eligibility
              <br />
              6. Permissions
              <br />
              7. Review
            </p>
          </div>
        </div>
      </div>
      <button
        className="w-full mb-12 sm:mb-24 px-2 py-1 bg-gradient-to-r from-[#05ff00] via-[#0094ff] to-[#fa00ff] font-serif text-2xl"
        onClick={address ? nextStep : openConnectModal}
      >
        <div className="flex gap-3 w-[300px] sm:w-[500px] xl:w-[750px] 2xl:w-[850px] m-auto">
          <Image
            src="/forward-arrow.svg"
            alt="Forward"
            width={18}
            height={18}
          />{" "}
          {address ? "GET STARTED" : "Connect"}
        </div>
      </button>
    </>
  );
}
