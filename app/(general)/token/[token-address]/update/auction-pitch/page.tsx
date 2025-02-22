"use client";

import { useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import { formatEther, parseEther } from "viem";
import { Address, useContractReads } from "wagmi";
import { waitForTransaction, writeContract } from "wagmi/actions";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useMediaQuery } from "react-responsive";

import PlusSignIcon from "@/components/shared/plus-sign-icon";
import ForwardArrowAnimated from "@/components/shared/forward-arrow-animated";
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
      <div className="flex justify-between w-full mt-12 sm:mt-16 xl:mt-20 2xl:mt-24 min-[2000px]:mt-32 px-4">
        <div className="flex flex-col justify-between">
          <PlusSignIcon />
          <PlusSignIcon />
        </div>
        <h1 className="font-mono text-5xl sm:text-[75px] xl:text-[130px] 2xl:text-[145px] text-center">
          Edit Stewardship Inauguration
        </h1>
        <div className="flex flex-col justify-between">
          <PlusSignIcon />
          <PlusSignIcon />
        </div>
      </div>
      <form onSubmit={handleSubmit(handleSave)} className="relative">
        <div className="flex flex-col items-center text-sm sm:text-lg">
          <div className="flex justify-between items-start w-full mt-12 sm:mt-16 xl:mt-20 2xl:mt-24 px-4">
            <PlusSignIcon />
            <div className="flex w-full sm:w-[600px] xl:w-[750px] 2xl:w-[1100px] m-auto">
              <div className="flex">
                <div className="flex items-start gap-2 w-[45%]">
                  <PlusSignIcon />
                  <span>Intro</span>
                </div>
                <div className="flex items-start gap-2 w-[55%]">
                  <span>
                    This auction starts at a low/zero initial price and accepts
                    ascending bids until close. You can configure an auction
                    extension window to disincentivize last-second bids.
                  </span>
                  <PlusSignIcon />
                </div>
              </div>
            </div>
            <PlusSignIcon />
          </div>
          <div className="flex sm:justify-center w-full px-4 sm:px-0">
            <div className="w-full sm:w-[600px] xl:w-[750px] 2xl:w-[1100px]">
              <div className="flex mt-12">
                <div className="flex items-start gap-2 w-[45%]">
                  <PlusSignIcon />
                  <label htmlFor="auction.duration">Duration</label>
                </div>
                <div className="flex items-start gap-2 w-[55%]">
                  <div className="flex flex-col w-full">
                    <label htmlFor="auction.duration">
                      Set the standard length of your auction. The start time of
                      your auction can shift each stewardship cycle, so
                      don&apos;t over-optimize for tight timezone windows.
                    </label>
                    <div className="flex mt-2 gap-5">
                      <input
                        {...register("auction.duration")}
                        type="number"
                        id="auction.duration"
                        required
                        min={1}
                        placeholder={"24"}
                        className="w-2/4 bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD]"
                      />
                      <select
                        {...register("auction.duration-type")}
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
              <div className="flex items-center mt-12">
                <div className="flex items-start gap-2 w-[45%]">
                  <PlusSignIcon />
                  <label htmlFor="auction.starting-bid">Starting Bid</label>
                </div>
                <div className="flex items-start gap-2 w-[55%]">
                  <div className="flex w-full">
                    <input
                      {...register("auction.starting-bid")}
                      type="number"
                      id="auction.starting-bid"
                      required
                      min={0.000000000000000001}
                      step="any"
                      placeholder={"0 ETH"}
                      className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD]"
                    />
                  </div>
                  <PlusSignIcon />
                </div>
              </div>
              <div className="flex mt-12">
                <div className="flex items-start gap-2 w-[45%]">
                  <PlusSignIcon />
                  <label htmlFor="auction.min-bid-increase">
                    Minimum Bid Increase
                  </label>
                </div>
                <div className="flex items-start gap-2 w-[55%]">
                  <div className="flex flex-col w-full">
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
                        className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD] mt-2"
                      />
                    </div>
                  </div>
                  <PlusSignIcon />
                </div>
              </div>
              <div className="flex mt-12">
                <div className="flex items-start gap-2 w-[45%]">
                  <PlusSignIcon />
                  <label htmlFor="auction.extension-window">
                    Extension Window
                  </label>
                </div>
                <div className="flex items-start gap-2 w-[55%]">
                  <div className="flex flex-col w-full">
                    <label htmlFor="auction.extension-window">
                      Bids placed during this window at the end of the auction
                      will extend it. Set this to 0 if you want auction
                      extensions.
                    </label>
                    <div className="flex">
                      <input
                        {...register("auction.extension-window")}
                        type="number"
                        id="auction.extension-window"
                        required
                        min={0}
                        placeholder={"15 Minutes"}
                        className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD] mt-2"
                      />
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
            <div className="flex w-full">
              <div className="flex items-start gap-2 w-[45%]">
                <PlusSignIcon />
                <label htmlFor="auction.extension-length">
                  Extension Length
                </label>
              </div>
              <div className="flex items-start gap-2 w-[55%]">
                <div className="flex flex-col w-full">
                  <label htmlFor="auction.extension-length">
                    How long each bid during the extension window will extend
                    the auction.
                  </label>
                  <div className="flex">
                    <input
                      {...register("auction.extension-length")}
                      type="number"
                      id="auction.extension-length"
                      required
                      placeholder={"15 Minutes"}
                      min={0}
                      className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD] mt-2"
                    />
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
            disabled={isSaving}
          >
            <div className="w-full sm:w-[600px] xl:w-[750px] 2xl:w-[1100px] m-auto">
              <ForwardArrowAnimated>
                <span>{isSaving ? "SAVING..." : "SAVE"}</span>
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
            <div className="flex items-center gap-3 w-full sm:w-[600px] xl:w-[750px] 2xl:w-[1100px] m-auto">
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
