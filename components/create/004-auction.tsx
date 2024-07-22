import { useEffect } from "react";

import { ethers } from "ethers";
import { motion } from "framer-motion";
import { GlobalState, useStateMachine } from "little-state-machine";
import { useForm } from "react-hook-form";
import { Address, useAccount } from "wagmi";

import { FADE_DOWN_ANIMATION_VARIANTS } from "@/config/design";
import { EnglishPeriodicAuctionInit } from "@/lib/hooks/use-facet-init";
import { fromUnitsToSeconds } from "@/lib/utils";

function updateAction(
  state: GlobalState,
  payload: {
    auction: {
      owner: Address;
      "initial-start-time": string;
      "initial-start-time-offset": number;
      "initial-start-time-offset-type": string;
      duration: number;
      "duration-type": string;
      "starting-bid": number;
      "min-bid-increase": number;
      "extension-window": number;
      "extension-length": number;
    };
  }
) {
  const auctionInput = payload["auction"];

  return {
    ...state,
    auctionInput,
    auctionInitData: {
      owner: auctionInput.owner,
      initialPeriodStartTime:
        Date.parse(auctionInput["initial-start-time"]) / 1000,
      initialPeriodStartTimeOffset: fromUnitsToSeconds(
        auctionInput["initial-start-time-offset"],
        auctionInput["initial-start-time-offset-type"]
      ),
      startingBid: ethers.utils.parseEther(
        auctionInput["starting-bid"].toString()
      ),
      auctionLengthSeconds: fromUnitsToSeconds(
        auctionInput.duration,
        auctionInput["duration-type"]
      ),
      minBidIncrement: ethers.utils.parseEther(
        auctionInput["min-bid-increase"].toString()
      ),
      bidExtensionWindowLengthSeconds: auctionInput["extension-window"] * 60,
      bidExtensionSeconds: auctionInput["extension-length"] * 60,
    } as EnglishPeriodicAuctionInit,
  };
}

export default function ConfigAuctionFacet({
  nextStep,
  prevStep,
}: {
  nextStep: () => void;
  prevStep: () => void;
}) {
  const account = useAccount();

  const { actions, state } = useStateMachine({ updateAction });

  const { register, handleSubmit, getValues, setValue } = useForm({
    defaultValues: {
      auction: (state as any).auctionInput,
    },
  });

  useEffect(() => {
    setValue("auction.owner", account.address);
  }, [account]);

  const onSubmit = (data: any) => {
    actions.updateAction(data);
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="min-w-full rounded-md bg-neutral-100 p-4 dark:bg-neutral-800">
        <motion.h2
          className="text-gradient-primary text-center text-3xl font-bold tracking-[-0.02em] drop-shadow-sm md:text-4xl md:leading-[8rem]"
          variants={FADE_DOWN_ANIMATION_VARIANTS}
        >
          4. English Auction Configuration
        </motion.h2>
        <div className="mb-6">
          <label
            htmlFor="auction.initial-start-time"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Initial Auction
          </label>
          <label
            htmlFor="auction.initial-start-time"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Set when the first on-chain Auction Pitch starts. Subsequent
            auctions will automatically be triggered at the end of each
            Stewardship Cycle. You can set this date one cycle into the future
            and run an offline auction if you choose.
          </label>
          <div className="flex">
            <input
              {...register("auction.initial-start-time")}
              id="auction.initial-start-time"
              type="datetime-local"
              className="mr-5 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              required
              min={new Date(
                Date.now() - new Date().getTimezoneOffset() * 60 * 1000
              )
                .toISOString()
                .slice(0, 16)}
            />
            <label>{Intl.DateTimeFormat().resolvedOptions().timeZone}</label>
          </div>
        </div>
        <div className="mb-6">
          <label
            htmlFor="auction.initial-start-time-offset"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Collection Offset
          </label>
          <label
            htmlFor="auction.initial-start-time-offset"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Stagger the first auction for each token in your collection
            sequentially by fixed amount. 0 means the auctions will all start at
            the same time.
          </label>
          <div className="flex">
            <input
              {...register("auction.initial-start-time-offset")}
              type="number"
              id="auction.initial-start-time-offset"
              required
              min={0}
              placeholder="0"
              className="mr-5 w-40 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            />
            <select
              {...register("auction.initial-start-time-offset-type")}
              className="w-40 rounded-lg dark:border-gray-300 dark:bg-gray-700"
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
              className="dark:brder-gray-300 w-40 rounded-lg dark:bg-gray-700"
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
        <div className="flex items-center justify-center">
          <button
            className="btn bg-gradient-button btn-xl w-30"
            onClick={() => {
              onSubmit(getValues());
              prevStep();
            }}
          >
            Back
          </button>
          <div className="grow" />
          <input
            type="submit"
            className="btn bg-gradient-button btn-xl w-30"
            value="Next"
          />
        </div>
      </div>
    </form>
  );
}
