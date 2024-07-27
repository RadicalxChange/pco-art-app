import { useEffect, useRef } from "react";
import Image from "next/image";

import { GlobalState, useStateMachine } from "little-state-machine";
import { FormProvider, useForm } from "react-hook-form";
import { Address, useAccount, useNetwork } from "wagmi";
import { useMediaQuery } from "react-responsive";
import useElementOffset from "@/lib/hooks/use-element-offset";

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
      <h1 className="font-mono text-5xl sm:text-[75px] xl:text-[100px] 2xl:text-[128px] text-center leading-none mt-12 sm:mt-16 xl:mt-20 2xl:mt-24 min-[2000px]:mt-32">
        3.
        <br />
        Creator Circle
      </h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col items-center max-w-[320px] sm:max-w-[750px] xl:max-w-[1100px] 2xl:max-w-[1200px] m-auto">
          <div
            ref={formContainerRef}
            className="w-[320px] sm:w-[600px] xl:w-[750px] 2xl:w-[850px] my-10 sm:mt-16 xl:mt-20 2xl:mt-24"
          >
            <div className="flex">
              <span className="w-1/3">Intro</span>
              <span className="w-2/3">
                The Creator Circle is the group of people/organizations that
                receive a token&apos;s Periodic Honorarium.
              </span>
            </div>
            <div className="flex mt-10">
              <label htmlFor="cycle" className="w-1/3">
                Allocation Table
              </label>
              <div className="w-2/3">
                <label htmlFor="cycle">
                  Enter the addresses and allocation units to define your
                  Creator Circle. Always use the smallest number of units
                  required to achieve your desired Honorarium split.
                  <br />
                  <br />
                  You can enter a single Ethereum address (e.g. a DAO treasury)
                  if you have other mechanisms planned for allocation.
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
                        className="w-4/12 bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-2xl placeholder-[#ADADAD]"
                        disabled
                        value={totalUnits}
                      />
                      <input
                        type="text"
                        id="name"
                        className="w-4/12 bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-2xl placeholder-[#ADADAD]"
                        disabled
                        value={`100%`}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
            {isMobile && (
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
                    <Image src="/add.svg" alt="Add" width={23} height={23} />
                    Add another recipient
                  </button>
                  <input
                    type="number"
                    id="name"
                    className="w-4/12 bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-2xl placeholder-[#ADADAD]"
                    disabled
                    value={totalUnits}
                  />
                  <input
                    type="text"
                    id="name"
                    className="w-4/12 bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-2xl placeholder-[#ADADAD]"
                    disabled
                    value={`100%`}
                  />
                </div>
              </>
            )}
            <div className="flex items-center mt-20 mb-24 xl:mb-32">
              <button
                className="absolute left-0 flex items-center gap-2 sm:gap-3 bg-neon-green px-2 sm:px-4 py-1 font-serif text-2xl"
                onClick={() => prevStep()}
              >
                <Image
                  src="/back-arrow.svg"
                  alt="Back"
                  width={18}
                  height={18}
                />
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
          </div>
        </div>
      </form>
    </>
  );
}
