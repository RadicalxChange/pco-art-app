import { useEffect, useRef } from "react";
import Image from "next/image";

import { GlobalState, useStateMachine } from "little-state-machine";
import { FormProvider, useForm } from "react-hook-form";
import { Address, useAccount, useNetwork } from "wagmi";
import { useMediaQuery } from "react-responsive";
import useElementOffset from "@/lib/hooks/use-element-offset";

import PlusSignIcon from "@/components/shared/plus-sign-icon";
import CreatorCircleAllocationEntry from "@/components/shared/CreatorCircleAllocationEntry";
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
  const formContainerRef = useRef<HTMLDivElement>(null);

  const network = useNetwork();
  const account = useAccount();
  const isMobile = useMediaQuery({ query: "(max-width: 640px)" });
  const isTablet = useMediaQuery({ query: "(max-width: 1240px)" });
  const formContainerOffset = useElementOffset(formContainerRef);

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
    <>
      <div className="flex justify-between w-full mt-12 sm:mt-16 xl:mt-20 2xl:mt-24 min-[2000px]:mt-32 px-4">
        <div className="flex flex-col justify-between">
          <PlusSignIcon />
          <PlusSignIcon />
        </div>
        <h1 className="font-mono text-5xl sm:text-[75px] xl:text-[130px] 2xl:text-[145px] text-center">
          3.
          <br />
          Creator Circle
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
                    The Creator Circle is the group of people/organizations that
                    receive a token&apos;s Periodic Honorarium.
                  </span>
                  <PlusSignIcon />
                </div>
              </div>
            </div>
            <PlusSignIcon />
          </div>
          <div className="flex justify-between items-start w-full mt-12 px-4">
            <PlusSignIcon />
            <div className="w-full sm:w-[600px] xl:w-[750px] 2xl:w-[1100px]">
              <div className="flex w-full">
                <div className="flex items-start gap-2 w-[45%]">
                  <PlusSignIcon />
                  <label htmlFor="cycle">Allocation Table</label>
                </div>
                <div className="flex items-start gap-2 w-[55%]">
                  <div>
                    <label htmlFor="cycle">
                      Enter the addresses and allocation units to define your
                      Creator Circle. Don't forget to include yourself as the
                      Artist! You can enter a single Ethereum address (e.g. a
                      DAO treasury) if you have other mechanisms planned for
                      allocation.
                      <br />
                      <br />
                      Note: Always use the smallest number of units required to
                      achieve your desired Honorarium split.
                    </label>
                    {!isMobile && (
                      <>
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
                        <div className="flex gap-5">
                          <button
                            className="w-full flex items-center gap-1 bg-transparent"
                            onClick={() => {
                              setValue(
                                `beneficiary.allocation.${
                                  watchAllocation?.length ?? 0 + 1
                                }.units`,
                                0
                              );
                            }}
                          >
                            <Image
                              src="/add.svg"
                              alt="Add"
                              width={23}
                              height={23}
                            />
                            Add another recipient
                          </button>
                          <input
                            type="number"
                            id="name"
                            className="w-4/12 bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD]"
                            disabled
                            value={totalUnits}
                          />
                          <input
                            type="text"
                            id="name"
                            className="w-4/12 bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD]"
                            disabled
                            value={`100%`}
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <PlusSignIcon />
                </div>
              </div>
            </div>
            <PlusSignIcon />
          </div>
          {isMobile && (
            <div className="px-4">
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
              <div className="flex gap-5">
                <button
                  className="w-full flex items-center gap-1 bg-transparent"
                  onClick={() => {
                    setValue(
                      `beneficiary.allocation.${
                        watchAllocation?.length ?? 0 + 1
                      }.units`,
                      0
                    );
                  }}
                >
                  <Image src="/add.svg" alt="Add" width={23} height={23} />
                  Add another recipient
                </button>
                <input
                  type="number"
                  id="name"
                  className="w-4/12 bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD]"
                  disabled
                  value={totalUnits}
                />
                <input
                  type="text"
                  id="name"
                  className="w-4/12 bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD]"
                  disabled
                  value={`100%`}
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center mt-16 sm:mt-24 mb-24 xl:mb-32">
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
              {isMobile
                ? "4. English Auction"
                : "4. English Auction Configuration"}
            </button>
          )}
        </div>
      </form>
    </>
  );
}
