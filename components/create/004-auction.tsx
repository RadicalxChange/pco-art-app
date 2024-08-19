import { useEffect, useRef } from "react";
import Image from "next/image";

import { ethers } from "ethers";
import { GlobalState, useStateMachine } from "little-state-machine";
import { useForm } from "react-hook-form";
import { Address, useAccount } from "wagmi";
import { useMediaQuery } from "react-responsive";

import PlusSignIcon from "@/components/shared/plus-sign-icon";
import useElementOffset from "@/lib/hooks/use-element-offset";
import { EnglishPeriodicAuctionInit } from "@/lib/hooks/use-facet-init";
import { fromUnitsToSeconds } from "@/lib/utils";

function updateAction(
  state: GlobalState,
  payload: {
    auction: {
      owner: Address;
      "initial-start-date": string;
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
        Date.parse(
          `${auctionInput["initial-start-date"]}T${auctionInput["initial-start-time"]}`
        ) / 1000,
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
  const formContainerRef = useRef<HTMLDivElement>(null);

  const { address } = useAccount();
  const formContainerOffset = useElementOffset(formContainerRef);
  const isMobile = useMediaQuery({ query: "(max-width: 640px)" });
  const isTablet = useMediaQuery({ query: "(max-width: 1240px)" });
  const { actions, state } = useStateMachine({ updateAction });
  const { register, handleSubmit, getValues, setValue, watch } = useForm({
    defaultValues: {
      auction: (state as any).auctionInput,
    },
  });

  useEffect(() => {
    setValue("auction.owner", address);
  }, [address]);

  const onSubmit = (data: any) => {
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
        <h1 className="max-w-[320px] sm:max-w-[750px] xl:max-w-[1100px] 2xl:max-w-[1500px] font-mono text-5xl sm:text-[75px] xl:text-[130px] 2xl:text-[145px] text-center">
          4.
          <br />
          English Auction Configuration
        </h1>
        <div className="flex flex-col justify-between">
          <PlusSignIcon />
          <PlusSignIcon />
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col items-center text-sm sm:text-lg">
          <div className="flex justify-between items-start w-full mt-12 sm:mt-16 xl:mt-20 2xl:mt-24 px-4">
            <PlusSignIcon />
            <div
              ref={formContainerRef}
              className="w-full sm:w-[600px] xl:w-[750px] 2xl:w-[1100px]"
            >
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
                  <label htmlFor="auction.initial-start-time">
                    Initial Auction
                  </label>
                </div>
                <div className="flex items-start gap-2 w-[55%]">
                  <div className="flex flex-col w-full">
                    <label htmlFor="auction.initial-start-time">
                      Set when the first on-chain Stewardship Inauguration
                      starts. Subsequent auctions will automatically be
                      triggered at the end of each Stewardship Cycle. You can
                      set this date one cycle into the future and run an offline
                      auction if you choose.
                    </label>
                    <div className="flex flex-col sm:flex-row mt-2">
                      <input
                        {...register("auction.initial-start-date")}
                        id="auction.initial-start-date"
                        type="date"
                        required
                        className="w-full sm:w-2/4 bg-transparent border-solid border-0 border-b border-black focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD] mr-5 p-0 py-1"
                      />
                      <div className="flex w-full sm:w-2/4 border-solid border-0 border-b border-black">
                        <input
                          {...register("auction.initial-start-time")}
                          id="auction.initial-start-time"
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
              <div className="flex mt-12">
                <div className="flex items-start gap-2 w-[45%]">
                  <PlusSignIcon />
                  <label htmlFor="auction.initial-start-time-offset">
                    Collection Offset
                  </label>
                </div>
                <div className="flex items-start gap-2 w-[55%]">
                  <div className="flex flex-col">
                    <label htmlFor="auction.initial-start-time-offset">
                      Stagger the first auction for each token in your
                      collection sequentially by fixed amount. 0 means the
                      auctions will all start at the same time.
                    </label>
                    <div className="flex gap-5 mt-2">
                      <input
                        {...register("auction.initial-start-time-offset")}
                        type="number"
                        id="auction.initial-start-time-offset"
                        required
                        min={0}
                        placeholder="0"
                        className="w-2/4 bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD]"
                      />
                      <select
                        {...register("auction.initial-start-time-offset-type")}
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
              <div className="flex mt-12">
                <div className="flex items-start gap-2 w-[45%]">
                  <PlusSignIcon />
                  <label htmlFor="auction.duration">Duration</label>
                </div>
                <div className="flex items-start gap-2 w-[55%]">
                  <div className="flex flex-col">
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
        <div className="flex justify-between items-start w-full mt-12 sm:mb-24 px-4 text-sm sm:text-lg">
          <PlusSignIcon />
          <div className="w-full sm:w-[600px] xl:w-[750px] 2xl:w-[1100px]">
            <div className="flex w-full">
              <div className="flex items-start gap-2 w-[45%]">
                <PlusSignIcon />
                <label htmlFor="auction.extension-length">
                  Extension Length
                </label>
              </div>
              <div className="flex items-start gap-2 w-[55%]">
                <div className="flex flex-col">
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
        <div className="flex items-center mt-20 mb-24 xl:mb-32">
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
              className="flex gap-2 items-center sm:gap-3 bg-neon-green px-2 py-1 font-serif text-2xl absolute w-[250px] sm:w-3/4"
              style={{
                right: isMobile || isTablet ? 0 : "",
                left: isMobile || isTablet ? "" : formContainerOffset.left,
                width:
                  isMobile || isTablet
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
              5. Auction Eligibility
            </button>
          )}
        </div>
      </form>
    </>
  );
}
