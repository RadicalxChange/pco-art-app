import { useRef, useEffect } from "react";
import Image from "next/image";

import { GlobalState, useStateMachine } from "little-state-machine";
import { useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import { useMediaQuery } from "react-responsive";

import { NativeStewardLicenseInit } from "@/lib/hooks/use-facet-init";
import useElementOffset from "@/lib/hooks/use-element-offset";

enum MintType {
  New = "new",
  Wrapped = "wrapped",
}

function updateAction(
  state: GlobalState,
  payload: {
    "steward-license": {
      minter: string;
      "max-token-count": number;
      "should-mint": boolean;
      name: string;
      symbol: string;
      "media-uri": string;
      "mint-type": MintType;
    };
  }
) {
  const stewardLicenseInput = payload["steward-license"];

  return {
    ...state,
    stewardLicenseInput,
    stewardLicenseInitData: {
      minter: stewardLicenseInput.minter,
      maxTokenCount: stewardLicenseInput["max-token-count"],
      name: stewardLicenseInput.name,
      symbol: stewardLicenseInput.symbol,
      baseURI: stewardLicenseInput["media-uri"] + "/metadata/",
      shouldMint: stewardLicenseInput["should-mint"],
    } as NativeStewardLicenseInit,
  };
}

export default function ConfigStewardLicenseFacet({
  nextStep,
  prevStep,
}: {
  nextStep: () => void;
  prevStep: () => void;
}) {
  const formContainerRef = useRef<HTMLDivElement>(null);
  const formContainerOffset = useElementOffset(formContainerRef);

  const { actions, state } = useStateMachine({ updateAction });
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      "steward-license": (state as any).stewardLicenseInput,
    },
  });
  const account = useAccount();
  const isMobile = useMediaQuery({ query: "(max-width: 640px)" });

  useEffect(() => {
    setValue("steward-license.minter", account.address);
  }, [account]);

  const onSubmit = async (data: any) => {
    actions.updateAction(data);
    nextStep();
  };

  return (
    <>
      <h1 className="font-mono text-5xl sm:text-[75px] xl:text-[100px] 2xl:text-[128px] text-center leading-none mt-12 sm:mt-16 xl:mt-20 2xl:mt-24">
        1.
        <br />
        The Art
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="relative">
        <div className="flex flex-col items-center max-w-[300px] sm:max-w-[750px] xl:max-w-[1100px] 2xl:max-w-[1200px] m-auto">
          <div
            ref={formContainerRef}
            className="w-[300px] sm:w-[500px] xl:w-[750px] 2xl:w-[850px] my-10 sm:mt-16 xl:mt20 2x:xl:mt-24"
          >
            <div className="flex">
              <label htmlFor="mint-type" className="w-1/3">
                Mint Type
              </label>
              <div className="w-2/3">
                <input
                  {...register("steward-license.mint-type")}
                  type="radio"
                  id="mint-type-new"
                  className="mr-2"
                  value={MintType.New}
                  checked
                />
                <label htmlFor="mint-type-new" className="">
                  Create New Stewardship Token
                </label>
              </div>
            </div>
            <div className="flex items-center mt-10">
              <label htmlFor="name" className="w-1/3">
                Name
              </label>
              <input
                {...register("steward-license.name")}
                type="text"
                id="name"
                placeholder="Name your token"
                className="w-2/3 bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-2xl placeholder-[#ADADAD]"
                required
                maxLength={32}
              />
            </div>
            <div className="flex items-center mt-10">
              <label htmlFor="symbol" className="w-1/3">
                Symbol
              </label>
              <input
                {...register("steward-license.symbol")}
                type="text"
                id="symbol"
                className="w-2/3 bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-2xl placeholder-[#ADADAD]"
                placeholder="An abbreviation for your token"
                required
                maxLength={10}
              />
            </div>
            <div className="flex items-center mt-10">
              <label htmlFor="media" className="self-start w-1/3 pt-3">
                URI (Metadata)
              </label>
              <div className="flex flex-col gap-2 w-2/3">
                <input
                  {...register("steward-license.media-uri")}
                  type="text"
                  id="media"
                  className="bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-2xl placeholder-[#ADADAD]"
                  placeholder="ipfs://"
                  required
                />
                <span className="text-xs">
                  Download{" "}
                  <a
                    className="underline"
                    target="_blank"
                    href="https://nftstorage.link/ipfs/bafybeidxfej5cokgom5ticchwgdwge3sibxdk73ua7s3tlmrxcydhhktjy?filename=metadata.zip"
                  >
                    this
                  </a>{" "}
                  JSON template , define your token metadata, upload it to
                  NFT.Storage, & add the resulting CID here
                </span>
              </div>
            </div>
            <div className="flex items-center mt-10">
              <label htmlFor="media" className="w-1/3">
                Number of Tokens
              </label>
              <input
                {...register("steward-license.max-token-count")}
                type="number"
                id="max-token-count"
                className="w-2/3 bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-2xl placeholder-[#ADADAD]"
                placeholder="12"
                required
                min={1}
              />
            </div>
            <div className="flex items-center mt-10 pt-3">
              <label htmlFor="should-mint" className="w-1/3">
                Mint Tokens at Creation
              </label>
              <input
                {...register("steward-license.should-mint")}
                type="checkbox"
                className="rounded-full text-black border-black focus:ring-0 focus:ring-offset-0 focus:outline-none"
                id="should-mint"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center mt-10 mb-24">
          <button
            className="absolute flex gap-2 sm:gap-3 bg-neon-green px-2 sm:px-4 py-1 font-serif text-2xl"
            onClick={() => prevStep()}
          >
            <Image src="/back-arrow.svg" alt="Back" width={18} height={18} />
            Back
          </button>
          {formContainerOffset && (
            <button
              type="submit"
              className="flex gap-2 sm:gap-3 bg-neon-green px-2 py-1 font-serif text-2xl absolute w-[250px] sm:w-full"
              style={{
                right: isMobile ? 0 : "",
                left: isMobile ? "" : formContainerOffset.left,
              }}
            >
              <Image
                src="/forward-arrow.svg"
                alt="Forward"
                width={18}
                height={18}
              />
              2. PCO Settings
            </button>
          )}
        </div>
      </form>
    </>
  );
}
