import { useEffect } from "react";

import { motion } from "framer-motion";
import { GlobalState, useStateMachine } from "little-state-machine";
import { FormProvider, useForm } from "react-hook-form";
import { Address, useAccount, useNetwork } from "wagmi";

import CreatorCircleAllocationEntry from "@/components/shared/CreatorCircleAllocationEntry";
import { FADE_DOWN_ANIMATION_VARIANTS } from "@/config/design";
import { ethXAddress } from "@/lib/blockchain";
import { IDABeneficiaryInit } from "@/lib/hooks/use-facet-init";

type FormPayload = {
  beneficiary: {
    owner: Address;
    ida: {
      token: Address;
    };
    allocation: {
      subscriber: Address;
      units: number;
    }[];
  };
};

function updateAction(state: GlobalState, payload: FormPayload) {
  const beneficiaryInput = payload["beneficiary"];

  return {
    ...state,
    beneficiaryInput,
    beneficiaryInitData: {
      owner: beneficiaryInput.owner,
      token: beneficiaryInput.ida.token,
      beneficiaries: beneficiaryInput.allocation.map((beneficiary) => {
        return { subscriber: beneficiary.subscriber, units: beneficiary.units };
      }),
    } as IDABeneficiaryInit,
  };
}

export default function ConfigBeneficiaryFacet({
  nextStep,
  prevStep,
}: {
  nextStep: () => void;
  prevStep: () => void;
}) {
  const network = useNetwork();
  const account = useAccount();

  const { actions, state } = useStateMachine({ updateAction });

  const methods = useForm({
    defaultValues: {
      beneficiary: (state as any).beneficiaryInput,
    },
  });
  const { register, handleSubmit, getValues, setValue, watch } = methods;

  useEffect(() => {
    setValue(
      "beneficiary.ida.token",
      network.chain
        ? ethXAddress[network.chain.id as keyof typeof ethXAddress]
        : undefined
    );
  }, [network]);

  useEffect(() => {
    setValue("beneficiary.owner", account.address);
  }, [account]);

  const watchAllocation = watch("beneficiary.allocation") as
    | {
        subscriber: Address;
        units: number;
      }[]
    | undefined;

  let totalUnits = watchAllocation?.reduce((acc, curr) => acc + curr.units, 0);
  if (totalUnits === undefined || isNaN(totalUnits)) {
    totalUnits = 0;
  }

  const onSubmit = (data: any) => {
    actions.updateAction(data);
    nextStep();
  };

  return (
    <div className="min-w-full rounded-md bg-neutral-100 p-4 text-center dark:bg-neutral-800">
      <motion.h2
        className="text-gradient-primary text-center text-3xl font-bold tracking-[-0.02em] drop-shadow-sm md:text-4xl md:leading-[8rem]"
        variants={FADE_DOWN_ANIMATION_VARIANTS}
      >
        3. Creator Circle
      </motion.h2>
      <label
        htmlFor="cycle"
        className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
      >
        The Creator Circle is the group of people/organizations that receive a
        token&apos;s Periodic Honorarium.
      </label>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-6">
          <label
            htmlFor="cycle"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Allocation Table
          </label>
          <label
            htmlFor="cycle"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Enter the addresses and allocation units to define your Creator
            Circle. You can enter a single Ethereum address if you have other
            mechanisms planned for allocation.
          </label>
          <FormProvider {...methods}>
            {watchAllocation?.map((_, index) => (
              <CreatorCircleAllocationEntry
                key={index}
                index={index}
                register={register}
                totalUnits={totalUnits!}
              />
            )) ?? (
              <CreatorCircleAllocationEntry
                index={0}
                register={register}
                totalUnits={totalUnits!}
              />
            )}
          </FormProvider>
          <div className="mb-6 flex">
            <button
              className="btn btn-sm mx-1 grow bg-gradient-to-r from-emerald-500 to-emerald-400 text-white"
              onClick={() => {
                setValue(
                  `beneficiary.allocation.${
                    watchAllocation?.length ?? 0 + 1
                  }.units`,
                  0
                );
              }}
            >
              + Add another recipient
            </button>
            <input
              type="number"
              id="name"
              className="dark:text-white-500 mx-1 w-20 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              disabled
              value={totalUnits}
            />
            <input
              type="text"
              id="name"
              className="dark:text-white-500 mx-1 w-20 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              disabled
              value={`100%`}
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
      </form>
    </div>
  );
}
