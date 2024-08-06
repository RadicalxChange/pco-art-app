"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

import { useForm } from "react-hook-form";
import { Address, useContractReads } from "wagmi";
import { waitForTransaction, writeContract } from "wagmi/actions";
import { useConnectModal } from "@rainbow-me/rainbowkit";

import { BranchIsWalletConnected } from "@/components/shared/branch-is-wallet-connected";
import {
  nativeStewardLicenseFacetABI,
  periodicPcoParamsFacetABI,
} from "@/lib/blockchain";
import { fromSecondsToUnits, fromUnitsToSeconds } from "@/lib/utils";

export default function UpdatePCOSettingsPage({
  params,
}: {
  params: { "token-address": string };
}) {
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const tokenAddress = params["token-address"] as Address;

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
        abi: periodicPcoParamsFacetABI,
        functionName: "licensePeriod",
      },
      {
        address: tokenAddress,
        abi: periodicPcoParamsFacetABI,
        functionName: "feeNumerator",
      },
      {
        address: tokenAddress,
        abi: periodicPcoParamsFacetABI,
        functionName: "feeDenominator",
      },
    ],
  });

  const tokenName =
    data && data[0].status === "success" ? data[0].result : null;
  const currentLicensePeriod =
    data && data[1].status === "success" ? data[1].result : null;
  const feeNumerator =
    data && data[2].status === "success" ? data[2].result : null;
  const feeDenominator =
    data && data[3].status === "success" ? data[3].result : null;

  const { register, getValues, setValue, watch, handleSubmit } = useForm();

  const watchPcoSettings = watch("pco-settings");
  const annualizedRate = watchPcoSettings
    ? (watchPcoSettings.rate * 365 * 24 * 60 * 60) /
      fromUnitsToSeconds(watchPcoSettings.cycle, watchPcoSettings["cycle-type"])
    : null;
  const licensePeriodInSeconds = watchPcoSettings
    ? fromUnitsToSeconds(watchPcoSettings.cycle, watchPcoSettings["cycle-type"])
    : null;

  useEffect(() => {
    if (
      feeNumerator === null ||
      feeDenominator === null ||
      currentLicensePeriod === null
    ) {
      return;
    }

    const rate = (Number(feeNumerator) / Number(feeDenominator)) * 100;
    const timeUnit =
      currentLicensePeriod >= 86400
        ? "days"
        : currentLicensePeriod >= 3600
        ? "hours"
        : "minutes";

    setValue("pco-settings.rate", rate.toString().slice(0, 5));
    setValue(
      "pco-settings.cycle",
      fromSecondsToUnits(Number(currentLicensePeriod), timeUnit)
    );
    setValue("pco-settings.cycle-type", timeUnit);
  }, [feeNumerator, feeDenominator, currentLicensePeriod]);

  const handleSave = async () => {
    if (licensePeriodInSeconds === null) {
      return;
    }

    setIsSaving(true);

    try {
      const pcoSettings = getValues()["pco-settings"];
      const rateNumerator = pcoSettings.rate * 100;
      const rateDenominator = pcoSettings.rate > 0 ? 10000 : 1;

      const { hash } = await writeContract({
        address: tokenAddress,
        abi: periodicPcoParamsFacetABI,
        functionName: "setPCOParameters",
        args: [
          BigInt(Math.round(licensePeriodInSeconds)),
          BigInt(rateNumerator),
          BigInt(rateDenominator),
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
      <h1 className="font-mono text-5xl sm:text-[75px] xl:text-[130px] 2xl:text-[145px] text-center mt-12 sm:mt-16 xl:mt-20 2xl:mt-24 min-[2000px]:mt-32">
        Edit
        <br />
        PCO Settings
      </h1>
      <form onSubmit={handleSubmit(handleSave)} className="relative">
        <div className="flex flex-col items-center max-w-[320px] sm:max-w-[750px] xl:max-w-[1100px] 2xl:max-w-[1500px] m-auto">
          <div className="w-[320px] sm:w-[600px] xl:w-[750px] 2xl:w-[1100px] my-10 sm:mt-16 xl:mt-20 2xl:mt-24 textm sm:text-lg">
            <div className="flex">
              <label htmlFor="cycle" className="w-[45%]">
                Stewardship Cycle
              </label>
              <div className="flex flex-col w-[55%]">
                <label htmlFor="cycle">
                  The duration between Stewardship Inaugurations. Weeks, months,
                  and years are converted to seconds based on 7, 30, & 365 days
                  respectively.
                </label>
                <input
                  {...register("pco-settings.cycle")}
                  type="number"
                  id="cycle"
                  required
                  min={1}
                  placeholder="365"
                  className="bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD] p-1"
                />
                <select
                  {...register("pco-settings.cycle-type")}
                  className="bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl text-[#ADADAD] p-1"
                  defaultValue="days"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="years">Years</option>
                </select>
              </div>
            </div>
            <div className="flex mt-10">
              <label htmlFor="rate" className="w-[45%]">
                Honorarium Rate
              </label>
              <div className="flex flex-col w-[55%]">
                <label htmlFor="rate">
                  The percent of a winning Stewardship Inauguration bid that is
                  contributed to the Creator Circle in each Stewardship Cycle.
                </label>
                <input
                  {...register("pco-settings.rate")}
                  type="number"
                  id="rate"
                  className="bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD] p-1"
                  placeholder="%"
                  required
                  min={0.01}
                  step={0.01}
                />
                <div className="bg-transparent border-solid border-0 border-b border-black p-0 font-serif text-xl text-[#ADADAD] p-1">
                  = an Annualized Rate of{" "}
                  {annualizedRate
                    ? `${parseFloat(annualizedRate.toFixed(2))}%`
                    : 0}
                </div>
              </div>
            </div>
          </div>
        </div>
        <BranchIsWalletConnected>
          <button
            className="w-full mt-10 mb-24 xl:mb-32 px-2 py-1 font-serif text-2xl gradient-action-btn"
            disabled={isSaving}
          >
            <div className="flex items-center gap-3 w-[320px] sm:w-[600px] xl:w-[750px] 2xl:w-[1100px] m-auto">
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
            className="w-full mt-10 mb-24 xl:mb-32 px-2 py-1 font-serif text-2xl gradient-action-btn"
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
