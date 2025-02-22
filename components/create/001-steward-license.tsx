import { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import { GlobalState, useStateMachine } from "little-state-machine";
import { useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import { useMediaQuery } from "react-responsive";

import { NativeStewardLicenseInit } from "@/lib/hooks/use-facet-init";
import useElementOffset from "@/lib/hooks/use-element-offset";

import PlusSignIcon from "@/components/shared/plus-sign-icon";

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
  const isMobileOrIsTablet = useMediaQuery({ query: "(max-width: 1240px)" });

  useEffect(() => {
    setValue("steward-license.minter", account.address);
  }, [account]);

  const onSubmit = async (data: any) => {
    actions.updateAction(data);
    nextStep();
  };

  return (
    <>
      <div className="flex justify-between w-full mt-12 sm:mt-16 xl:mt-20 2xl:mt-24 min-[2000px]:mt-32 px-4">
        <div className="flex flex-col justify-between">
          <PlusSignIcon />
          <PlusSignIcon />
        </div>
        <h1 className="font-mono text-5xl sm:text-[75px] xl:text-[130px] 2xl:text-[145px] text-center">
          1.
          <br />
          The Art
        </h1>
        <div className="flex flex-col justify-between">
          <PlusSignIcon />
          <PlusSignIcon />
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="relative">
        <div className="flex flex-col items-center text-sm sm:text-lg">
          <div className="flex justify-between items-start w-full mt-12 sm:mt-16 xl:mt-20 2xl:mt-24 px-4">
            <PlusSignIcon />
            <div
              ref={formContainerRef}
              className="w-full sm:w-[600px] xl:w-[750px] 2xl:w-[1100px]"
            >
              <div className="flex w-full text-sm sm:text-lg">
                <div className="flex items-start gap-2 w-[45%]">
                  <PlusSignIcon />
                  <label htmlFor="mint-type">Mint Type</label>
                </div>
                <div className="flex items-start gap-2 w-[55%]">
                  <div className="w-full">
                    <input
                      {...register("steward-license.mint-type")}
                      type="radio"
                      id="mint-type-new"
                      className="mr-2"
                      value={MintType.New}
                      checked
                    />
                    <label htmlFor="mint-type-new">
                      Create New Stewardship Token
                    </label>
                  </div>
                  <PlusSignIcon />
                </div>
              </div>
            </div>
            <PlusSignIcon />
          </div>
          <div className="flex sm:justify-center w-full px-4 sm:px-0">
            <div
              ref={formContainerRef}
              className="w-full sm:w-[600px] xl:w-[750px] 2xl:w-[1100px]"
            >
              <div className="flex items-center mt-12 text-sm sm:text-lg">
                <div className="flex items-start gap-2 w-[45%]">
                  <PlusSignIcon />
                  <label htmlFor="name">Name</label>
                </div>
                <div className="flex items-start gap-2 w-[55%]">
                  <input
                    {...register("steward-license.name")}
                    type="text"
                    id="name"
                    placeholder="Name your token"
                    className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD]"
                    required
                    maxLength={32}
                  />
                  <PlusSignIcon />
                </div>
              </div>
              <div className="flex items-center mt-12 text-sm sm:text-lg">
                <div className="flex items-start gap-2 w-[45%]">
                  <PlusSignIcon />
                  <label htmlFor="symbol">Symbol</label>
                </div>
                <div className="flex items-start gap-2 w-[55%]">
                  <input
                    {...register("steward-license.symbol")}
                    type="text"
                    id="symbol"
                    className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD]"
                    placeholder="An abbreviation for your token"
                    required
                    maxLength={10}
                  />
                  <PlusSignIcon />
                </div>
              </div>
              <div className="flex items-start mt-12 text-sm sm:text-lg">
                <div className="flex items-start gap-2 w-[45%]">
                  <PlusSignIcon />
                  <label htmlFor="media">URI (Metadata)</label>
                </div>
                <div className="flex items-start gap-2 w-[55%]">
                  <div className="w-full">
                    <input
                      {...register("steward-license.media-uri")}
                      type="text"
                      id="media"
                      className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD]"
                      placeholder="ipfs://"
                      required
                    />
                    <div className="mt-2 text-xs sm:text-sm">
                      Download{" "}
                      <a
                        href="https://gateway.pinata.cloud/ipfs/QmPPTSewMyDBaaGuFrzBeh2Kny64S7REFiw9C22Ap8QFfP/?filename=metadata.zip"
                        download
                        className="underline"
                        target="_blank"
                      >
                        this JSON template
                      </a>
                      , define your token metadata according to{" "}
                      <Link
                        href="https://docs.pco.art/for-artists/instantiating-your-art/#metadata"
                        className="underline"
                        target="_blank"
                      >
                        these instructions
                      </Link>
                      , upload it to a decentralized storage provider, & add the
                      resulting URI here. You can use{" "}
                      <span className="break-all">
                        ipfs://Qmd4KHEUWdWWRJnceqk3vGfML84cUQ1ezYFjZvs5eHX8sa
                      </span>{" "}
                      to test mint a collection of 3 tokens with our sample
                      data.
                    </div>
                  </div>
                  <PlusSignIcon />
                </div>
              </div>
              <div className="flex items-center mt-12 text-sm sm:text-lg">
                <div className="flex items-start gap-2 w-[45%]">
                  <PlusSignIcon />
                  <label htmlFor="media">Number of Tokens</label>
                </div>
                <div className="flex items-start gap-2 w-[55%]">
                  <input
                    {...register("steward-license.max-token-count")}
                    type="number"
                    id="max-token-count"
                    className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD]"
                    placeholder="12"
                    required
                    min={1}
                  />
                  <PlusSignIcon />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-start w-full mt-12 px-4">
          <PlusSignIcon />
          <div className="flex items-start w-full sm:w-[600px] xl:w-[750px] 2xl:w-[1100px]">
            <div className="flex items-center w-full text-sm sm:text-lg">
              <div className="flex items-start gap-2 w-[45%]">
                <PlusSignIcon />
                <label htmlFor="should-mint">Mint Tokens at Creation</label>
              </div>
              <div className="flex items-start gap-2 w-[55%]">
                <input
                  {...register("steward-license.should-mint")}
                  type="checkbox"
                  className="rounded-full text-black border-black focus:ring-0 focus:ring-offset-0 focus:outline-none"
                  id="should-mint"
                />
                <span className="ml-auto">
                  <PlusSignIcon />
                </span>
              </div>
            </div>
          </div>
          <PlusSignIcon />
        </div>
        <div className="flex items-center text-sm sm:text-lg mt-16 sm:mt-24 mb-24 xl:mb-32">
          <button
            className="absolute left-0 flex items-center gap-2 sm:gap-3 bg-neon-green px-2 sm:px-4 py-1 font-serif text-2xl"
            onClick={() => prevStep()}
          >
            <Image src="/back-arrow.svg" alt="Back" width={18} height={18} />
            Back
          </button>
          {formContainerOffset && (
            <button
              type="submit"
              className="flex items-center gap-2 sm:gap-3 bg-neon-green px-2 py-1 font-serif text-2xl absolute w-[250px] sm:w-3/4"
              style={{
                right: isMobileOrIsTablet ? 0 : "",
                left: isMobileOrIsTablet ? "" : formContainerOffset.left,
                width: isMobileOrIsTablet
                  ? ""
                  : document.documentElement.clientWidth -
                    formContainerOffset.left,
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
