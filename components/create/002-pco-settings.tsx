import { useEffect } from "react";

import { motion } from "framer-motion";
import { GlobalState, useStateMachine } from "little-state-machine";
import { useForm } from "react-hook-form";
import { Address, useAccount } from "wagmi";

import { FADE_DOWN_ANIMATION_VARIANTS } from "@/config/design";
import { PeriodicPCOParamsInit } from "@/lib/hooks/use-facet-init";
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="min-w-full rounded-md bg-neutral-100 p-4 dark:bg-neutral-800">
        <motion.h2
          className="text-gradient-primary text-center text-3xl font-bold tracking-[-0.02em] drop-shadow-sm md:text-4xl md:leading-[8rem]"
          variants={FADE_DOWN_ANIMATION_VARIANTS}
        >
          2. PCO Settings
        </motion.h2>
        <div className="mb-6">
          <label
            htmlFor="cycle"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Stewardship Cycle
          </label>
          <label
            htmlFor="cycle"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            The duration between auction pitches. Weeks, months, and years are
            converted to seconds based on 7, 30, & 365 days respectively.
          </label>
          <div className="flex">
            <input
              {...register("pco-settings.cycle")}
              type="number"
              id="cycle"
              required
              min={1}
              className="mr-5 grow rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            />
            <select
              {...register("pco-settings.cycle-type")}
              className="w-40 rounded-lg border-gray-600 dark:bg-gray-700"
            >
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="years">Years</option>
            </select>
          </div>
        </div>
        <div className="mb-6">
          <label
            htmlFor="rate"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Honorarium Rate
          </label>
          <label
            htmlFor="rate"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            The percent of a winning Auction Pitch bid that is contributed to
            the Creator Circle in each Stewardship Cycle.
          </label>
          <div className="flex text-center">
            <input
              {...register("pco-settings.rate")}
              type="number"
              id="rate"
              className="w-20 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="%"
              required
              min={0}
              step={0.01}
            />
            <label
              htmlFor="rate"
              className="w-50 dark:text-white-500 mx-10 mb-2 font-medium text-gray-500"
            >
              = an Annualized Rate of
            </label>
            <input
              type="text"
              className="w-30 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              value={
                annualizedRate ? `${parseFloat(annualizedRate.toFixed(2))}%` : 0
              }
              disabled
            />
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
