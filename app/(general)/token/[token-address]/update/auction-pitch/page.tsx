"use client";
import { useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import { formatEther, parseEther } from "viem";
import { Address, useContractReads } from "wagmi";
import { waitForTransaction, writeContract } from "wagmi/actions";

import { WalletConnect } from "@/components/blockchain/wallet-connect";
import { BranchIsWalletConnected } from "@/components/shared/branch-is-wallet-connected";
import {
  englishPeriodicAuctionFacetABI,
  nativeStewardLicenseFacetABI,
} from "@/lib/blockchain";
import {
  fromSecondsToUnits,
  fromUnitsToSeconds,
  truncateStr,
} from "@/lib/utils";

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

  const { register, getValues, setValue } = useForm();

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
    <div className="m-auto w-2/4">
      <h1 className="text-4xl font-bold text-blue-500">
        {tokenName} ({truncateStr(tokenAddress, 12)})
      </h1>
      <h2 className="text-medium mt-5 text-2xl font-bold">
        Edit Auction Pitch
      </h2>
      <div className="mb-6 mt-2">
        <span className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
          This auction starts at a low/zero initial price and accepts ascending
          bids until close.
          <br />
          You can configure an auction extension window to disincentivize
          last-second bids.
        </span>
      </div>
      <div className="min-w-full rounded-md">
        <div className="mb-6">
          <label
            htmlFor="auction.duration"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Duration
          </label>
          <label
            htmlFor="auction.duration"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Set the standard length of your auction. The start time of your
            auction can shift each stewardship cycle, so don&apos;t
            over-optimize for tight timezone windows.
          </label>
          <div className="flex">
            <input
              {...register("auction.duration")}
              type="number"
              id="auction.duration"
              required
              min={1}
              placeholder={"24"}
              className="mr-5 w-40 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            />
            <select
              {...register("auction.duration-type")}
              className="w-40 rounded-lg border border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700"
            >
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
            </select>
          </div>
        </div>
        <div className="mb-6">
          <label
            htmlFor="auction.starting-bid"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Starting Bid
          </label>
          <div className="flex">
            <input
              {...register("auction.starting-bid")}
              type="number"
              id="auction.starting-bid"
              required
              min={0}
              step={0.001}
              placeholder={"0"}
              className="mr-5 w-40 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            />
            <p>ETH</p>
          </div>
        </div>
        <div className="mb-6">
          <label
            htmlFor="auction.min-bid-increase"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Minimum Bid Increase
          </label>
          <label
            htmlFor="auction.min-bid-increase"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Avoid infinitesimal increase bidding wars.
          </label>
          <div className="flex">
            <input
              {...register("auction.min-bid-increase")}
              type="number"
              id="auction.min-bid-increase"
              required
              min={0}
              step={0.001}
              placeholder={"0.001"}
              className="mr-5 w-40 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            />
            <p>ETH</p>
          </div>
        </div>
        <div className="mb-6">
          <label
            htmlFor="auction.extension-window"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Extension Window
          </label>
          <label
            htmlFor="auction.extension-window"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Bids placed during this window at the end of the auction will extend
            it. Set this to 0 if you want auction extensions.
          </label>
          <div className="flex">
            <input
              {...register("auction.extension-window")}
              type="number"
              id="auction.extension-window"
              required
              min={0}
              placeholder={"15"}
              className="mr-5 w-40 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            />
            <p>Minutes</p>
          </div>
        </div>
        <div className="mb-6">
          <label
            htmlFor="auction.extension-length"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Extension Length
          </label>
          <label
            htmlFor="auction.extension-length"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            How long each bid during the extension window will extend the
            auction.
          </label>
          <div className="flex">
            <input
              {...register("auction.extension-length")}
              type="number"
              id="auction.extension-length"
              required
              placeholder={"15"}
              min={0}
              className="mr-5 w-40 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            />
            <p>Minutes</p>
          </div>
        </div>
      </div>
      <BranchIsWalletConnected>
        <button
          className="float-right w-full rounded-full bg-blue-500 px-8 py-4 text-xl font-bold lg:w-40"
          onClick={handleSave}
        >
          {isSaving ? <span className="lds-dual-ring" /> : "Save"}
        </button>
        <div className="float-right">
          <WalletConnect />
        </div>
      </BranchIsWalletConnected>
    </div>
  );
}
