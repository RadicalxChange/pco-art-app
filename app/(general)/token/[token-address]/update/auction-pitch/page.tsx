"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import { formatEther, parseEther } from "viem";
import { Address, useContractReads } from "wagmi";
import { waitForTransaction, writeContract } from "wagmi/actions";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useMediaQuery } from "react-responsive";

import { BranchIsWalletConnected } from "@/components/shared/branch-is-wallet-connected";
import {
  englishPeriodicAuctionFacetABI,
  nativeStewardLicenseFacetABI,
} from "@/lib/blockchain";
import { fromSecondsToUnits, fromUnitsToSeconds } from "@/lib/utils";

export default function UpdateAuctionPitchPage({
  params,
}: {
  params: { "token-address": string };
}) {
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const tokenAddress = params["token-address"] as Address;
  const auctionContract = {
    address: tokenAddress,
    abi: englishPeriodicAuctionFacetABI,
  };

  const isMobile = useMediaQuery({ query: "(max-width: 640px)" });
  const { openConnectModal } = useConnectModal();
  const { data } = useContractReads({
    contracts: [
      {
        address: tokenAddress,
        abi: nativeStewardLicenseFacetABI,
        functionName: "name",
      },
      {
        address: tokenAddress,
        abi: nativeStewardLicenseFacetABI,
        functionName: "ownerOf",
        args: [BigInt(0)],
      },
      { ...auctionContract, functionName: "auctionLengthSeconds" },
      { ...auctionContract, functionName: "startingBid" },
      { ...auctionContract, functionName: "minBidIncrement" },
      { ...auctionContract, functionName: "bidExtensionWindowLengthSeconds" },
      { ...auctionContract, functionName: "bidExtensionSeconds" },
      { ...auctionContract, functionName: "repossessor" },
    ],
  });

  const tokenName =
    data && data[0].status === "success" ? data[0].result : null;
  const owner = data && data[1].status === "success" ? data[1].result : null;
  const auctionLength =
    data && data[2].status === "success" ? data[2].result : null;
  const startingBid =
    data && data[3].status === "success" ? data[3].result : null;
  const minBidIncrement =
    data && data[4].status === "success" ? data[4].result : null;
  const extensionWindow =
    data && data[5].status === "success" ? data[5].result : null;
  const extensionLength =
    data && data[6].status === "success" ? data[6].result : null;
  const repossessor =
    data && data[7].status === "success" ? data[7].result : null;

  const { register, getValues, setValue, handleSubmit } = useForm();

  useEffect(() => {
    if (
      auctionLength === null ||
      startingBid === null ||
      minBidIncrement === null ||
      extensionWindow === null ||
      extensionLength === null
    ) {
      return;
    }

    const timeUnits =
      auctionLength < 3600
        ? "minutes"
        : auctionLength > 86400
        ? "days"
        : "hours";

    setValue(
      "auction.duration",
      fromSecondsToUnits(Number(auctionLength), timeUnits)
    );
    setValue("auction.duration-type", timeUnits);
    setValue("auction.starting-bid", formatEther(startingBid));
    setValue("auction.min-bid-increase", formatEther(minBidIncrement));
    setValue(
      "auction.extension-window",
      fromSecondsToUnits(Number(extensionWindow), "minutes")
    );
    setValue(
      "auction.extension-length",
      fromSecondsToUnits(Number(extensionLength), "minutes")
    );
  }, [auctionLength, minBidIncrement, extensionWindow, extensionLength]);

  const handleSave = async () => {
    if (!repossessor) {
      throw Error("Missing repossessor");
    }

    const { auction } = getValues();

    setIsSaving(true);

    try {
      const { hash } = await writeContract({
        address: tokenAddress,
        abi: englishPeriodicAuctionFacetABI,
        functionName: "setAuctionParameters",
        args: [
          repossessor,
          BigInt(
            fromUnitsToSeconds(
              Number(auction.duration),
              auction["duration-type"]
            )
          ),
          parseEther(auction["min-bid-increase"] as `${number}`),
          BigInt(
            fromUnitsToSeconds(Number(auction["extension-window"]), "minutes")
          ),
          BigInt(
            fromUnitsToSeconds(Number(auction["extension-length"]), "minutes")
          ),
          parseEther(auction["starting-bid"]),
        ],
      });
      await waitForTransaction({ hash });
      setIsSaving(false);
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  return (
    <>
      <h1 className="font-mono text-5xl sm:text-[75px] xl:text-[100px] 2xl:text-[128px] text-center leading-none mt-12 sm:mt-16 xl:mt-20 2xl:mt-24 min-[2000px]:mt-32">
        Edit Stewardship Inauguration
      </h1>
      <form onSubmit={handleSubmit(handleSave)} className="relative">
        <div className="flex flex-col items-center max-w-[320px] sm:max-w-[750px] xl:max-w-[1100px] 2xl:max-w-[1200px] m-auto">
          <div className="w-[320px] sm:w-[600px] xl:w-[750px] 2xl:w-[950px] my-10 sm:mt-16 xl:mt-20 2xl:mt-24 text-lg sm:text-xl">
            <div className="flex">
              <span className="w-1/3">Intro</span>
              <span className="w-2/3">
                This auction starts at a low/zero initial price and accepts
                ascending bids until close. You can configure an auction
                extension window to disincentivize last-second bids.
              </span>
            </div>
            <div className="flex mt-10">
              <label htmlFor="auction.duration" className="w-1/3">
                Duration
              </label>
              <div className="flex flex-col w-2/3">
                <label htmlFor="auction.duration">
                  Set the standard length of your auction. The start time of
                  your auction can shift each stewardship cycle, so don&apos;t
                  over-optimize for tight timezone windows.
                </label>
                <div className="flex mt-2 gap-5">
                  <input
                    {...register("auction.duration")}
                    type="number"
                    id="auction.duration"
                    required
                    min={1}
                    placeholder={"24"}
                    className="w-2/4 bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-2xl placeholder-[#ADADAD]"
                  />
                  <select
                    {...register("auction.duration-type")}
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
            <div className="flex items-center mt-10">
              <label htmlFor="auction.starting-bid" className="w-1/3">
                Starting Bid
              </label>
              <div className="flex w-2/3">
                <input
                  {...register("auction.starting-bid")}
                  type="number"
                  id="auction.starting-bid"
                  required
                  min={0.000000000000000001}
                  step="any"
                  placeholder={"0 ETH"}
                  className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-2xl placeholder-[#ADADAD]"
                />
              </div>
            </div>
            <div className="flex mt-10">
              <label htmlFor="auction.min-bid-increase" className="w-1/3">
                Minimum Bid Increase
              </label>
              <div className="flex flex-col w-2/3">
                <label htmlFor="auction.min-bid-increase">
                  Avoid infinitesimal increase bidding wars.
                </label>
                <div className="flex">
                  <input
                    {...register("auction.min-bid-increase")}
                    type="number"
                    id="auction.min-bid-increase"
                    required
                    min={0.000000000000000001}
                    step="any"
                    placeholder={"0.001 ETH"}
                    className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-2xl placeholder-[#ADADAD] mt-2"
                  />
                </div>
              </div>
            </div>
            <div className="flex mt-10">
              <label htmlFor="auction.extension-window" className="w-1/3">
                Extension Window
              </label>
              <div className="flex flex-col w-2/3">
                <label htmlFor="auction.extension-window">
                  Bids placed during this window at the end of the auction will
                  extend it. Set this to 0 if you want auction extensions.
                </label>
                <div className="flex">
                  <input
                    {...register("auction.extension-window")}
                    type="number"
                    id="auction.extension-window"
                    required
                    min={0}
                    placeholder={"15 Minutes"}
                    className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-2xl placeholder-[#ADADAD] mt-2"
                  />
                </div>
              </div>
            </div>
            <div className="flex mt-10">
              <label htmlFor="auction.extension-length" className="w-1/3">
                Extension Length
              </label>
              <div className="flex flex-col w-2/3">
                <label htmlFor="auction.extension-length">
                  How long each bid during the extension window will extend the
                  auction.
                </label>
                <div className="flex">
                  <input
                    {...register("auction.extension-length")}
                    type="number"
                    id="auction.extension-length"
                    required
                    placeholder={"15 Minutes"}
                    min={0}
                    className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-2xl placeholder-[#ADADAD] mt-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <BranchIsWalletConnected>
          <button
            className="w-full mt-10 mb-24 xl:mb-32 px-2 py-1 bg-gradient-to-r from-[#05ff00] via-[#0094ff] to-[#fa00ff] font-serif text-2xl"
            disabled={isSaving}
          >
            <div className="flex items-center gap-3 w-[320px] sm:w-[600px] xl:w-[750px] 2xl:w-[950px] m-auto">
              <Image
                src="/forward-arrow.svg"
                alt="Forward"
                width={18}
                height={18}
              />{" "}
              {isSaving ? "SAVING..." : "SAVE"}
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
            <div className="flex items-center gap-3 w-[320px] sm:w-[600px] xl:w-[750px] 2xl:w-[950px] m-auto">
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
