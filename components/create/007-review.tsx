import { useEffect } from "react";

import { motion } from "framer-motion";
import { useStateMachine } from "little-state-machine";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useWaitForTransaction } from "wagmi";

import { FADE_DOWN_ANIMATION_VARIANTS } from "@/config/design";
import { useOwnableDiamondFactoryAbiCreateDiamond } from "@/lib/blockchain";
import {
  FacetInit,
  useAccessControlInit,
  useAllowlistInit,
  useEnglishPeriodicAuctionInit,
  useIDABeneficiaryInit,
  useNativeStewardLicenseInit,
  usePeriodicPCOParamsInit,
} from "@/lib/hooks/use-facet-init";

function updateAction() {
  return {};
}

export default function ConfigReview({
  prevStep,
}: {
  prevStep: () => void;
  setStep: (step: number) => void;
}) {
  const { state, actions } = useStateMachine({ updateAction });
  const { handleSubmit } = useForm();
  const stewardLicenseInitData = useNativeStewardLicenseInit(
    (state as any).stewardLicenseInitData
  );
  const allowlistInitData = useAllowlistInit((state as any).allowlistInitData);
  const auctionInitData = useEnglishPeriodicAuctionInit(
    (state as any).auctionInitData
  );
  const beneficiaryInitData = useIDABeneficiaryInit(
    (state as any).beneficiaryInitData
  );
  const pcoSettingsInitData = usePeriodicPCOParamsInit(
    (state as any).pcoSettingsInitData
  );
  const accessControlInitData = useAccessControlInit(
    (state as any).permissionsInitData
  );

  const {
    write,
    data,
    isLoading: isTxnLoading,
  } = useOwnableDiamondFactoryAbiCreateDiamond({
    args: [
      [
        stewardLicenseInitData,
        allowlistInitData,
        auctionInitData,
        beneficiaryInitData,
        pcoSettingsInitData,
        accessControlInitData,
      ].filter((v) => v !== null) as FacetInit[],
    ],
  });

  const {
    data: txnReceipt,
    isLoading,
    isSuccess,
    isError,
    isFetched,
    isFetching,
  } = useWaitForTransaction({
    hash: data?.hash,
  });

  const onSubmit = () => {
    write?.();
  };

  useEffect(() => {
    if (isSuccess) {
      actions.updateAction();
    }
  }, [isSuccess]);

  if (!isLoading && isFetched && isSuccess) {
    const newTokenAddress =
      txnReceipt?.logs[txnReceipt?.logs.length - 1].topics[1];
    const tokenAddress = newTokenAddress
      ? "0x" + newTokenAddress.slice(26)
      : "";

    return (
      <div className="min-w-full rounded-md bg-neutral-100 p-4 text-center dark:bg-neutral-800">
        <h3 className="mb-2 text-3xl font-bold">Contracts Deployed!</h3>
        <p className="mb-2 text-lg font-medium">
          <Link href={`/token/${tokenAddress}/0`} className="mt-2 underline">
            View Token Page
          </Link>
        </p>
      </div>
    );
  } else if (!isLoading && isFetched && isError) {
    return (
      <div className="min-w-full rounded-md bg-neutral-100 p-4 text-center dark:bg-neutral-800">
        <h3 className="mb-2 text-3xl font-bold">Error minting asset!</h3>
      </div>
    );
  }

  if (
    !stewardLicenseInitData ||
    !allowlistInitData ||
    !auctionInitData ||
    !beneficiaryInitData ||
    !pcoSettingsInitData
  ) {
    return (
      <div className="min-w-full rounded-md bg-neutral-100 p-4 text-center dark:bg-neutral-800">
        <h3 className="mb-2 text-3xl font-bold">Something went wrong</h3>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="min-w-full rounded-md bg-neutral-100 p-4 dark:bg-neutral-800">
        <motion.h2
          className="text-gradient-primary text-center text-3xl font-bold tracking-[-0.02em] drop-shadow-sm md:text-4xl md:leading-[8rem]"
          variants={FADE_DOWN_ANIMATION_VARIANTS}
        >
          7. Review
        </motion.h2>
        <div className="mb-6">
          <motion.h3
            className="text-2xl font-bold tracking-[-0.02em] drop-shadow-sm md:leading-[8rem]"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            The Art
          </motion.h3>
          <motion.p
            className="text-md md:leading-[2rem]"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            Mint Type:{" "}
            {(state as any).stewardLicenseInput["mint-type"] === "new"
              ? "New Token"
              : "Wrapped Token"}
          </motion.p>
          <motion.p
            className="text-md md:leading-[2rem]"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            Name: {(state as any).stewardLicenseInput.name}
          </motion.p>
          <motion.p
            className="text-md md:leading-[2rem]"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            Symbol: {(state as any).stewardLicenseInput.symbol}
          </motion.p>
          <motion.p
            className="text-md md:leading-[2rem]"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            URI (Metadata): {(state as any).stewardLicenseInput["media-uri"]}
          </motion.p>
          <motion.p
            className="text-md md:leading-[2rem]"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            Number of Tokens:{" "}
            {(state as any).stewardLicenseInput["max-token-count"]}
          </motion.p>
          <motion.p
            className="text-md md:leading-[2rem]"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            Mint Tokens Now:{" "}
            {(state as any).stewardLicenseInput["should-mint"] === true
              ? "Yes"
              : "No"}
          </motion.p>
        </div>
        <div className="mb-6">
          <motion.h3
            className="text-2xl font-bold tracking-[-0.02em] drop-shadow-sm md:leading-[8rem]"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            PCO Settings
          </motion.h3>
          <motion.p
            className="text-md md:leading-[2rem]"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            Stewardship Cycle:{" "}
            {`${(state as any).pcoSettingsInput?.cycle} ${
              (state as any).pcoSettingsInput?.["cycle-type"]
            }`}
          </motion.p>
          <motion.p
            className="text-md md:leading-[2rem]"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            Honorarium Rate: {`${(state as any).pcoSettingsInput?.rate}`}%
          </motion.p>
        </div>
        <div className="mb-6">
          <motion.h3
            className="text-2xl font-bold tracking-[-0.02em] drop-shadow-sm md:leading-[8rem]"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            Creator Circle
          </motion.h3>
          <motion.p
            className="text-md md:leading-[2rem]"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            Type: Allocation Table
          </motion.p>
        </div>
        <div className="mb-6">
          <motion.h3
            className="text-2xl font-bold tracking-[-0.02em] drop-shadow-sm md:leading-[8rem]"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            English Auction
          </motion.h3>
          <motion.p
            className="text-md md:leading-[2rem]"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            Initial Auction:{" "}
            {new Date(
              (state as any).auctionInitData?.initialPeriodStartTime * 1000
            ).toLocaleString()}
          </motion.p>
          <motion.p
            className="text-md md:leading-[2rem]"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            Offset:{" "}
            {Number(
              (state as any).auctionInput?.["initial-start-time-offset"]
            ) > 0
              ? `${
                  (state as any).auctionInput?.["initial-start-time-offset"]
                } ${
                  (state as any).auctionInput?.[
                    "initial-start-time-offset-type"
                  ]
                }`
              : 0}
          </motion.p>
          <motion.p
            className="text-md md:leading-[2rem]"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            Duration:{" "}
            {`${(state as any).auctionInput?.["duration"]} ${
              (state as any).auctionInput?.["duration-type"]
            }`}
          </motion.p>
          <motion.p
            className="text-md md:leading-[2rem]"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            Starting Bid: {(state as any).auctionInput?.["starting-bid"]} ETH
          </motion.p>
          <motion.p
            className="text-md md:leading-[2rem]"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            Minimum Bid Increase:{" "}
            {(state as any).auctionInput?.["min-bid-increase"]} ETH
          </motion.p>
          <motion.p
            className="text-md md:leading-[2rem]"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            Extension Window:{" "}
            {(state as any).auctionInput?.["extension-window"]} minutes
          </motion.p>
          <motion.p
            className="text-md md:leading-[2rem]"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            Extension Length:{" "}
            {(state as any).auctionInput?.["extension-length"]} minutes
          </motion.p>
          <motion.p
            className="text-md md:leading-[2rem]"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            Eligibility:{" "}
            {(state as any).allowlistInput?.["allow-any"] === "true"
              ? "Open"
              : "Allowlist"}
          </motion.p>
        </div>
        <div className="mb-6">
          <motion.h3
            className="text-2xl font-bold tracking-[-0.02em] drop-shadow-sm md:leading-[8rem]"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            Permissions
          </motion.h3>
          <motion.p
            className="text-md md:leading-[2rem]"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            Token Admin: {(state as any).permissionsInput?.["token-admin"]}
          </motion.p>
          <motion.p
            className="text-md md:leading-[2rem]"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            Role Admin: {(state as any).permissionsInput?.["role-admin"]}
          </motion.p>
          <motion.p
            className="text-md md:leading-[2rem]"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            PCO Configuration: {(state as any).pcoSettingsInput?.owner}
          </motion.p>
          <motion.p
            className="text-md md:leading-[2rem]"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            Auction Configuration: {(state as any).auctionInput?.owner}
          </motion.p>
          <motion.p
            className="text-md md:leading-[2rem]"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            Eligibility Configuration: {(state as any).allowlistInput?.owner}
          </motion.p>
          <motion.p
            className="text-md md:leading-[2rem]"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            Creator Circle Configuration:{" "}
            {(state as any).beneficiaryInput?.owner}
          </motion.p>
          <motion.p
            className="text-md md:leading-[2rem]"
            variants={FADE_DOWN_ANIMATION_VARIANTS}
          >
            Additional Token Minter:{" "}
            {(state as any).stewardLicenseInput?.minter}
          </motion.p>
        </div>
        <div className="flex items-center justify-center">
          <button
            className="btn bg-gradient-button btn-xl w-30"
            onClick={() => {
              prevStep();
            }}
          >
            Back
          </button>
          <div className="grow" />
          {isLoading || isFetching || isTxnLoading ? (
            <button className="btn bg-gradient-button btn-xl" disabled>
              <span className="lds-dual-ring" />
            </button>
          ) : (
            <input
              type="submit"
              className="btn bg-gradient-button btn-xl w-30"
              value="Mint PCO Token"
            />
          )}
        </div>
      </div>
    </form>
  );
}
