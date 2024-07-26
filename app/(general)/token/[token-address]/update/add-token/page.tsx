"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useForm } from "react-hook-form";
import {
  Address,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";

import { WalletConnect } from "@/components/blockchain/wallet-connect";
import { useMediaQuery } from "react-responsive";
import { BranchIsWalletConnected } from "@/components/shared/branch-is-wallet-connected";
import { FADE_DOWN_ANIMATION_VARIANTS } from "@/config/design";
import { nativeStewardLicenseFacetABI } from "@/lib/blockchain";
import { fromUnitsToSeconds } from "@/lib/utils";

function AddToCollection({ params }: { params: { "token-address": Address } }) {
  const tokenAddress = params["token-address"];

  const { register, handleSubmit, watch } = useForm();
  const isMobile = useMediaQuery({ query: "(max-width: 640px)" });

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
      <div className="min-w-full rounded-md bg-neutral-100 p-4 text-center dark:bg-neutral-800">
        <h3 className="mb-2 text-3xl font-bold">Done!</h3>
        <p className="mb-2 text-lg font-medium">
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
      <div className="min-w-full rounded-md bg-neutral-100 p-4 text-center dark:bg-neutral-800">
        <h3 className="mb-2 text-3xl font-bold">Error!</h3>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="min-w-full rounded-md bg-neutral-100 p-4 dark:bg-neutral-800">
        <div className="mb-6">
          <label
            htmlFor="media"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            URI (Metadata)
          </label>
          <label
            htmlFor="cycle"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Each token requires its own metadata.{" "}
            <a
              className="text-cyan-400 underline"
              target="_blank"
              href="https://nftstorage.link/ipfs/bafybeidxfej5cokgom5ticchwgdwge3sibxdk73ua7s3tlmrxcydhhktjy?filename=metadata.zip"
            >
              Download this folder template
            </a>
            , add media & a JSON doc for each token, upload it wit NFTUp, & add
            the resulting CID here.
          </label>
          <input
            {...register("media-uri")}
            type="text"
            id="media-uri"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            placeholder="ipfs://"
            required
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="media"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Number of Tokens You're Creating
          </label>
          <input
            {...register("token-count")}
            type="number"
            id="token-count"
            className="w-40 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            placeholder=""
            required
            min={1}
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="initial-start-time"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Initial Auction
          </label>
          <label
            htmlFor="initial-start-time"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Set when the first on-chain Stewardship Inauguration starts.
            Subsequent auctions will automatically be triggered at the end of
            each Stewardship Cycle. You can set this date one cycle into the
            future and run an offline auction if you choose.
          </label>
          <div className="flex mt-2">
            <input
              {...register("auction.initial-start-date")}
              id="auction.initial-start-date"
              type="date"
              required
              className="w-2/4 bg-transparent border-solid border-0 border-b border-black focus:outline-none focus:ring-0 focus:border-black font-serif text-2xl placeholder-[#ADADAD] mr-5 p-0 py-1"
            />
            <div className="flex w-2/4 border-solid border-0 border-b border-black">
              <input
                {...register("auction.initial-start-time")}
                id="auction.initial-start-time"
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
        <div className="mb-6">
          <label
            htmlFor="initial-start-time-offset"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Collection Offset
          </label>
          <label
            htmlFor="initial-start-time-offset"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Stagger the first auction for each token in your collection
            sequentially by fixed amount. 0 means the auctions will all start at
            the same time.
          </label>
          <div className="flex">
            <input
              {...register("initial-start-time-offset")}
              type="number"
              id="initial-start-time-offset"
              required
              min={0}
              placeholder="0"
              className="mr-5 w-40 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            />
            <select
              {...register("initial-start-time-offset-type")}
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
            htmlFor="should-mint"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Mint Tokens at Creation
          </label>
          <input
            {...register("should-mint")}
            type="checkbox"
            id="should-mint"
            className="rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          />
        </div>
        {isLoading || isFetching || isTxnLoading ? (
          <button className="btn bg-gradient-button btn-xl" disabled>
            <span className="lds-dual-ring" />
          </button>
        ) : (
          <input
            type="submit"
            className="btn bg-gradient-button btn-xl w-30"
            value="Add Art to Collection"
          />
        )}
      </div>
    </form>
  );
}

export default function TokenAddToCollectionPage({
  params,
}: {
  params: { "token-address": Address };
}) {
  return (
    <>
      <div className="relative flex flex-1">
        <div className="flex-center flex h-full flex-1 flex-col items-center justify-center">
          <motion.div
            className="min-w-full max-w-5xl px-5 xl:px-48"
            initial="hidden"
            whileInView="show"
            animate="show"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.15,
                },
              },
            }}
          >
            <motion.h1
              className="text-gradient-primary text-center text-3xl font-bold tracking-[-0.02em] drop-shadow-sm md:text-4xl md:leading-[8rem]"
              variants={FADE_DOWN_ANIMATION_VARIANTS}
            >
              Add Art to Collection
            </motion.h1>
            <div className="mt-8 flex min-w-fit items-center justify-center">
              <BranchIsWalletConnected>
                <AddToCollection params={params} />
                <WalletConnect />
              </BranchIsWalletConnected>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
