"use client";
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
import PlusSignIcon from "@/components/shared/plus-sign-icon";
import ForwardArrowAnimated from "@/components/shared/forward-arrow-animated";
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
      <div className="flex justify-between w-full mt-12 sm:mt-16 xl:mt-20 2xl:mt-24 min-[2000px]:mt-32 px-4">
        <div className="flex flex-col justify-between">
          <PlusSignIcon />
          <PlusSignIcon />
        </div>
        <h1 className="font-mono text-5xl sm:text-[75px] xl:text-[130px] 2xl:text-[145px] text-center">
          Add Art to <br />
          Collection
        </h1>
        <div className="flex flex-col justify-between">
          <PlusSignIcon />
          <PlusSignIcon />
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col items-center">
          <div className="flex justify-between items-start w-full mt-12 sm:mt-16 xl:mt-20 2xl:mt-24 px-4">
            <PlusSignIcon />
            <div className="flex w-full sm:w-[600px] xl:w-[750px] 2xl:w-[1100px] m-auto">
              <div className="flex">
                <div className="flex items-start gap-2 w-[45%]">
                  <PlusSignIcon />
                  <label htmlFor="media" className="self-start">
                    URI (Metadata)
                  </label>
                </div>
                <div className="flex items-start gap-2 w-[55%]">
                  <div className="flex flex-col gap-2 w-full">
                    <input
                      {...register("media-uri")}
                      type="text"
                      id="media"
                      className="bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD]"
                      placeholder="ipfs://"
                      required
                    />
                    <span className="text-xs">
                      Download{" "}
                      <a
                        className="underline"
                        target="_blank"
                        href="https://gateway.pinata.cloud/ipfs/QmPPTSewMyDBaaGuFrzBeh2Kny64S7REFiw9C22Ap8QFfP/?filename=metadata.zip"
                      >
                        this
                      </a>{" "}
                      JSON template , define your token metadata, upload it to
                      NFT.Storage, & add the resulting CID here.
                    </span>
                  </div>
                  <PlusSignIcon />
                </div>
              </div>
            </div>
            <PlusSignIcon />
          </div>
          <div className="flex sm:justify-center w-full px-4 sm:px-0">
            <div className="w-full sm:w-[600px] xl:w-[750px] 2xl:w-[1100px] text-sm sm:text-lg">
              <div className="flex items-center mt-12">
                <div className="flex items-start gap-2 w-[45%]">
                  <PlusSignIcon />
                  <label htmlFor="media">Number of Tokens</label>
                </div>
                <div className="flex items-start gap-2 w-[55%]">
                  <input
                    {...register("token-count")}
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
              <div className="flex items-center mt-12 pt-3">
                <div className="flex items-start gap-2 w-[45%]">
                  <PlusSignIcon />
                  <label htmlFor="should-mint">Mint Tokens at Creation</label>
                </div>
                <div className="flex items-start gap-2 w-[55%]">
                  <input
                    {...register("should-mint")}
                    type="checkbox"
                    className="rounded-full text-black border-black focus:ring-0 focus:ring-offset-0 focus:outline-none"
                    id="should-mint"
                  />
                </div>
                <PlusSignIcon />
              </div>
              <div className="flex mt-12">
                <div className="flex items-start gap-2 w-[45%]">
                  <PlusSignIcon />
                  <label htmlFor="initial-start-time">Initial Auction</label>
                </div>
                <div className="flex items-start gap-2 w-[55%]">
                  <div className="flex flex-col w-full">
                    <label htmlFor="initial-start-time">
                      Set when the first on-chain Stewardship Inauguration
                      starts.
                    </label>
                    <div className="flex flex-col sm:flex-row mt-2">
                      <input
                        {...register("initial-start-date")}
                        id="initial-start-date"
                        type="date"
                        required
                        className="w-full sm:w-2/4 bg-transparent border-solid border-0 border-b border-black focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD] mr-5 p-0 py-1"
                      />
                      <div className="flex w-full sm:w-2/4 border-solid border-0 border-b border-black">
                        <input
                          {...register("initial-start-time")}
                          id="initial-start-time"
                          type="time"
                          required
                          className="bg-transparent border-0 p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD] p-0 py-1"
                        />
                        {!isMobile && (
                          <span className="flex items-center font-serif text-xl pl-2">
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
                  <PlusSignIcon />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-start w-full mt-12 px-4">
          <PlusSignIcon />
          <div className="flex items-start w-full sm:w-[600px] xl:w-[750px] 2xl:w-[1100px]">
            <div className="flex">
              <div className="flex items-start gap-2 w-[45%]">
                <PlusSignIcon />
                <label htmlFor="initial-start-time-offset">
                  Collection Offset
                </label>
              </div>
              <div className="flex items-start gap-2 w-[55%]">
                <div className="flex flex-col">
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
                      className="w-2/4 bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD]"
                    />
                    <select
                      {...register("initial-start-time-offset-type")}
                      defaultValue="hours"
                      className="w-2/4 bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD]"
                    >
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                    </select>
                  </div>
                </div>
                <PlusSignIcon />
              </div>
            </div>
          </div>
          <PlusSignIcon />
        </div>
        <BranchIsWalletConnected>
          <button
            className="w-full mt-12 mb-24 xl:mb-32 px-4 sm:px-0 font-serif text-2xl gradient-action-btn"
            disabled={isLoading || isFetching || isTxnLoading}
          >
            <div className="w-full sm:w-[600px] xl:w-[750px] 2xl:w-[950px] m-auto">
              <ForwardArrowAnimated>
                <span>
                  {isLoading || isFetching || isTxnLoading
                    ? "UPDATING..."
                    : "ADD TOKEN TO COLLECTION"}
                </span>
              </ForwardArrowAnimated>
            </div>
          </button>
          <button
            className="w-full mt-12 mb-24 xl:mb-32 px-4 sm:px-0 font-serif text-2xl gradient-action-btn"
            onClick={(e) => {
              e.preventDefault();

              if (openConnectModal) {
                openConnectModal();
              }
            }}
          >
            <div className="w-full sm:w-[600px] xl:w-[750px] 2xl:w-[1100px] m-auto">
              <ForwardArrowAnimated>
                <span>CONNECT</span>
              </ForwardArrowAnimated>
            </div>
          </button>
        </BranchIsWalletConnected>
      </form>
    </>
  );
}
