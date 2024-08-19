import { useEffect, useRef } from "react";
import Image from "next/image";

import { GlobalState, useStateMachine } from "little-state-machine";
import { useForm } from "react-hook-form";
import { Address, useAccount } from "wagmi";
import { useMediaQuery } from "react-responsive";

import PlusSignIcon from "@/components/shared/plus-sign-icon";
import { PeriodicPCOParamsInit } from "@/lib/hooks/use-facet-init";
import useElementOffset from "@/lib/hooks/use-element-offset";

import { fromUnitsToSeconds } from "@/lib/utils";

function updateAction(
  state: GlobalState,
  payload: {
    "pco-settings": {
      owner: Address;
      cycle: number;
      "cycle-type": string;
      rate: number;
    };
  }
) {
  const pcoSettingsInput = payload["pco-settings"];

  const licensePeriodInSeconds = fromUnitsToSeconds(
    pcoSettingsInput.cycle,
    pcoSettingsInput["cycle-type"]
  );
  const rateNumerator = pcoSettingsInput.rate * 100;
  const rateDenominator = pcoSettingsInput.rate > 0 ? 10000 : 1;

  return {
    ...state,
    pcoSettingsInput,
    pcoSettingsInitData: {
      owner: pcoSettingsInput.owner,
      licensePeriodInSeconds,
      rateNumerator,
      rateDenominator,
    } as PeriodicPCOParamsInit,
  };
}

export default function ConfigPCOSettingsFacet({
  nextStep,
  prevStep,
}: {
  nextStep: () => void;
  prevStep: () => void;
}) {
  const formContainerRef = useRef<HTMLDivElement>(null);

  const formContainerOffset = useElementOffset(formContainerRef);
  const isMobileOrIsTablet = useMediaQuery({ query: "(max-width: 1240px)" });
  const { address } = useAccount();
  const { actions, state } = useStateMachine({ updateAction });
  const { register, handleSubmit, getValues, watch, setValue } = useForm({
    defaultValues: {
      "pco-settings": (state as any).pcoSettingsInput,
    },
  });

  const watchPcoSettings = watch("pco-settings");
  const annualizedRate =
    watchPcoSettings !== undefined
      ? (watchPcoSettings.rate * 365 * 24 * 60 * 60) /
        fromUnitsToSeconds(
          watchPcoSettings.cycle,
          watchPcoSettings["cycle-type"]
        )
      : undefined;

  useEffect(() => {
    setValue("pco-settings.owner", address);
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
        <h1 className="font-mono text-5xl sm:text-[75px] xl:text-[130px] 2xl:text-[145px] text-center">
          2.
          <br />
          PCO Settings
        </h1>
        <div className="flex flex-col justify-between">
          <PlusSignIcon />
          <PlusSignIcon />
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="relative">
        <div className="flex flex-col items-center text-sm sm:text-lg">
          <div className="flex justify-between items-start w-full mt-12 sm:mt-16 xl:mt-20 2xl:mt-24 px-4">
            <PlusSignIcon />
            <div
              ref={formContainerRef}
              className="w-full sm:w-[600px] xl:w-[750px] 2xl:w-[1100px]"
            >
              <div className="flex text-sm sm:text-lg">
                <div className="flex items-start gap-2 w-[45%]">
                  <PlusSignIcon />
                  <label htmlFor="cycle">Stewardship Cycle</label>
                </div>
                <div className="flex items-start gap-2 w-[55%]">
                  <div className="flex flex-col">
                    <label htmlFor="cycle">
                      The duration between Stewardship Inaugurations. Weeks,
                      months, and years are converted to seconds based on 7, 30,
                      & 365 days respectively.
                    </label>
                    <input
                      {...register("pco-settings.cycle")}
                      type="number"
                      id="cycle"
                      required
                      min={1}
                      placeholder="365"
                      className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD] p-1"
                    />
                    <select
                      {...register("pco-settings.cycle-type")}
                      className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl p-1"
                      defaultValue="days"
                    >
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="years">Years</option>
                    </select>
                  </div>
                  <PlusSignIcon />
                </div>
              </div>
            </div>
            <PlusSignIcon />
          </div>
          <div className="flex justify-between items-start w-full mt-12 px-4">
            <PlusSignIcon />
            <div className="w-full sm:w-[600px] xl:w-[750px] 2xl:w-[1100px]">
              <div className="flex text-sm sm:text-lg">
                <div className="flex items-start gap-2 w-[45%]">
                  <PlusSignIcon />
                  <label htmlFor="rate" className="w-[45%]">
                    Honorarium Rate
                  </label>
                </div>
                <div className="flex items-start gap-2 w-[55%]">
                  <div className="flex flex-col">
                    <label htmlFor="rate">
                      The percent of a winning Stewardship Inauguration bid that
                      is contributed to the Creator Circle in each Stewardship
                      Cycle.
                    </label>
                    <input
                      {...register("pco-settings.rate")}
                      type="number"
                      id="rate"
                      className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD] p-1"
                      placeholder="%"
                      required
                      min={0.01}
                      step={0.01}
                    />
                    <div className="w-full bg-transparent border-solid border-0 border-b border-black p-0 font-serif text-xl p-1">
                      = an Annualized Rate of{" "}
                      {annualizedRate
                        ? `${parseFloat(annualizedRate.toFixed(2))}%`
                        : 0}
                    </div>
                  </div>
                  <PlusSignIcon />
                </div>
              </div>
            </div>
            <PlusSignIcon />
          </div>
        </div>
        <div className="flex items-center text-lg sm:text-xl mt-16 sm:mt-24 mb-24 xl:mb-32">
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
                right: isMobileOrIsTablet ? 0 : "",
                left: isMobileOrIsTablet ? "" : formContainerOffset.left,
                width: isMobileOrIsTablet
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
              3. Creator Circle
            </button>
          )}
        </div>
      </form>
    </>
  );
}
