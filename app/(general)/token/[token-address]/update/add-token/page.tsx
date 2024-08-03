"use client";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import {
  Address,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useMediaQuery } from "react-responsive";
import { BranchIsWalletConnected } from "@/components/shared/branch-is-wallet-connected";
import { nativeStewardLicenseFacetABI } from "@/lib/blockchain";
import { fromUnitsToSeconds } from "@/lib/utils";

export default function AddToCollection({
  params,
}: {
  params: { "token-address": Address };
}) {
  const tokenAddress = params["token-address"];

  const { register, handleSubmit, watch } = useForm();
  const isMobile = useMediaQuery({ query: "(max-width: 640px)" });
  const { openConnectModal } = useConnectModal();

  const initialStartDate = watch("initial-start-date");
  const initialStartTime = watch("initial-start-time");
  const initialStartTimeOffset = fromUnitsToSeconds(
    watch("initial-start-time-offset"),
    watch("initial-start-time-offset-type")
  );

  const { data: prevMaxTokenCount } = useContractRead({
    address: tokenAddress,
    functionName: "maxTokenCount",
    abi: nativeStewardLicenseFacetABI,
  });

  const {
    write,
    data,
    isLoading: isTxnLoading,
  } = useContractWrite({
    abi: nativeStewardLicenseFacetABI,
    address: tokenAddress,
    functionName: "addTokensWithBaseURIToCollection",
    args: [
      watch("token-count"),
      initialStartDate && initialStartTime
        ? BigInt(Date.parse(`${initialStartDate}T${initialStartTime}`) / 1000)
        : BigInt(0),
      initialStartTimeOffset ? BigInt(initialStartTimeOffset) : BigInt(0),
      watch("media-uri") + "/metadata/",
      watch("should-mint"),
    ],
  });

  const { isLoading, isSuccess, isError, isFetched, isFetching } =
    useWaitForTransaction({
      hash: data?.hash,
    });

  const onSubmit = () => {
    write?.();
  };

  if (!isLoading && isFetched && isSuccess) {
    return (
      <div className="flex flex-col flex-center mt-32">
        <h3 className="mb-2 text-9xl font-bold">Done!</h3>
        <p className="mb-2 text-xl">
          <Link
            href={`/token/${tokenAddress}/${prevMaxTokenCount}`}
            className="mt-2 underline"
          >
            View Token Page
          </Link>
        </p>
      </div>
    );
  } else if (!isLoading && isFetched && isError) {
    return (
      <div className="flex flex-col flex-center mt-32">
        <h3 className="mb-2 text-9xl font-bold">Error!</h3>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-mono text-5xl sm:text-[75px] xl:text-[130px] 2xl:text-[145px] text-center mt-12 sm:mt-16 xl:mt-20 2xl:mt-24 min-[2000px]:mt-32">
        Add Art to <br />
        Collection
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="relative">
        <div className="flex flex-col items-center max-w-[320px] sm:max-w-[750px] xl:max-w-[1100px] 2xl:max-w-[1500px] m-auto">
          <div className="w-[320px] sm:w-[600px] xl:w-[750px] 2xl:w-[1100px] my-10 sm:mt-16 xl:mt-20 2xl:mt-24 text-lg sm:text-xl">
            <div className="flex items-center">
              <label htmlFor="media" className="self-start w-1/3 pt-3">
                URI (Metadata)
              </label>
              <div className="flex flex-col gap-2 w-2/3">
                <input
                  {...register("media-uri")}
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
                {...register("token-count")}
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
                {...register("should-mint")}
                type="checkbox"
                className="rounded-full text-black border-black focus:ring-0 focus:ring-offset-0 focus:outline-none"
                id="should-mint"
              />
            </div>
            <div className="flex mt-12">
              <label htmlFor="initial-start-time" className="w-1/3">
                Initial Auction
              </label>
              <div className="flex flex-col w-2/3">
                <label htmlFor="initial-start-time">
                  Set when the first on-chain Stewardship Inauguration starts.
                </label>
                <div className="flex mt-2">
                  <input
                    {...register("initial-start-date")}
                    id="initial-start-date"
                    type="date"
                    required
                    className="w-2/4 bg-transparent border-solid border-0 border-b border-black focus:outline-none focus:ring-0 focus:border-black font-serif text-2xl placeholder-[#ADADAD] mr-5 p-0 py-1"
                  />
                  <div className="flex w-2/4 border-solid border-0 border-b border-black">
                    <input
                      {...register("initial-start-time")}
                      id="initial-start-time"
                      type="time"
                      required
                      className="bg-transparent border-0 p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-2xl placeholder-[#ADADAD] p-0 py-1"
                    />
                    {!isMobile && (
                      <span className="flex items-center font-serif text-2xl pl-2">
                        {
                          new Date()
                            .toLocaleTimeString("default", {
                              timeZoneName: "short",
                            })
                            .split(" ")[2]
                        }
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex mt-10">
              <label htmlFor="initial-start-time-offset" className="w-1/3">
                Collection Offset
              </label>
              <div className="flex flex-col w-2/3">
                <label htmlFor="initial-start-time-offset">
                  Stagger the first auction for each token in your collection
                  sequentially by fixed amount. 0 means the auctions will all
                  start at the same time.
                </label>
                <div className="flex gap-5 mt-2">
                  <input
                    {...register("initial-start-time-offset")}
                    type="number"
                    id="initial-start-time-offset"
                    required
                    min={0}
                    placeholder="0"
                    className="w-2/4 bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-2xl placeholder-[#ADADAD]"
                  />
                  <select
                    {...register("initial-start-time-offset-type")}
                    defaultValue="hours"
                    className="w-2/4 bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-2xl placeholder-[#ADADAD]"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        <BranchIsWalletConnected>
          <button
            className="w-full mt-10 mb-24 xl:mb-32 px-2 py-1 bg-gradient-to-r from-[#05ff00] via-[#0094ff] to-[#fa00ff] font-serif text-2xl"
            disabled={isLoading || isFetching || isTxnLoading}
          >
            <div className="flex items-center gap-3 w-[320px] sm:w-[600px] xl:w-[750px] 2xl:w-[950px] m-auto">
              <Image
                src="/forward-arrow.svg"
                alt="Forward"
                width={18}
                height={18}
              />{" "}
              {isLoading || isFetching || isTxnLoading
                ? "UPDATING..."
                : "ADD TOKEN TO COLLECTION"}
            </div>
          </button>
          <button
            className="w-full mt-10 mb-24 xl:mb-32 px-2 py-1 bg-gradient-to-r from-[#05ff00] via-[#0094ff] to-[#fa00ff] font-serif text-2xl"
            onClick={(e) => {
              e.preventDefault();

              if (openConnectModal) {
                openConnectModal();
              }
            }}
          >
            <div className="flex items-center gap-3 w-[320px] sm:w-[600px] xl:w-[750px] 2xl:w-[1100px] m-auto">
              <Image
                src="/forward-arrow.svg"
                alt="Forward"
                width={18}
                height={18}
              />{" "}
              CONNECT
            </div>
          </button>
        </BranchIsWalletConnected>
      </form>
    </>
  );
}
