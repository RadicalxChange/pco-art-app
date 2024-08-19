"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { gql, useQuery } from "@apollo/client";
import { FormProvider, useForm } from "react-hook-form";
import { Address, useContractReads } from "wagmi";
import { waitForTransaction, writeContract } from "wagmi/actions";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { BranchIsWalletConnected } from "@/components/shared/branch-is-wallet-connected";
import ForwardArrowAnimated from "@/components/shared/forward-arrow-animated";
import { useMediaQuery } from "react-responsive";

import PlusSignIcon from "@/components/shared/plus-sign-icon";
import CreatorCircleAllocationEntry from "@/components/shared/CreatorCircleAllocationEntry";
import {
  idaBeneficiaryFacetABI,
  nativeStewardLicenseFacetABI,
} from "@/lib/blockchain";

export default function UpdateCreatorCirclePage({
  params,
}: {
  params: { "token-address": string };
}) {
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const tokenAddress = params["token-address"].toLowerCase() as Address;

  const CREATOR_CIRCLE_QUERY = gql`
    query CreatorCircle($publisher: String!) {
      indexes(first: 1, where: { publisher: $publisher }) {
        subscriptions {
          subscriber {
            id
          }
          units
        }
      }
    }
  `;

  const {
    loading,
    error,
    data: currentCreatorCircle,
  } = useQuery(CREATOR_CIRCLE_QUERY, {
    variables: { publisher: tokenAddress },
  });

  const isMobile = useMediaQuery({ query: "(max-width: 640px)" });
  const { openConnectModal } = useConnectModal();
  const { data: tokenInfo } = useContractReads({
    contracts: [
      {
        address: tokenAddress,
        abi: nativeStewardLicenseFacetABI,
        functionName: "name",
      },
      {
        address: tokenAddress,
        abi: nativeStewardLicenseFacetABI,
        functionName: "ownerOf",
        args: [BigInt(0)],
      },
    ],
  });

  const defaultBeneficiaries = {
    allocation: [
      {
        subscriber: "",
        units: "",
      },
    ],
  };
  const form = useForm({
    defaultValues: {
      beneficiary: defaultBeneficiaries,
    },
  });
  const { register, watch, getValues, setValue, handleSubmit } = form;
  const watcher = watch("beneficiary.allocation");

  const tokenName =
    tokenInfo && tokenInfo[0].status === "success" ? tokenInfo[0].result : null;
  const owner =
    tokenInfo && tokenInfo[1].status === "success" ? tokenInfo[1].result : null;
  let totalUnits = watcher?.reduce(
    (acc: number, curr: { subscriber: string; units: string }) =>
      acc + Number(curr.units),
    0
  );

  if (totalUnits === undefined || isNaN(totalUnits)) {
    totalUnits = 0;
  }

  useEffect(() => {
    if (!currentCreatorCircle?.indexes[0]) {
      return;
    }

    const creatorCircle = currentCreatorCircle.indexes[0].subscriptions.map(
      (subscription: { subscriber: { id: string }; units: string }) => {
        return {
          subscriber: subscription.subscriber.id,
          units: subscription.units,
        };
      }
    );

    setValue("beneficiary.allocation", creatorCircle);
  }, [currentCreatorCircle]);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const creatorCircle = getValues();
      const { hash } = await writeContract({
        address: tokenAddress,
        abi: idaBeneficiaryFacetABI,
        functionName: "updateBeneficiaryUnits",
        args: [
          creatorCircle.beneficiary.allocation.map((elem) => {
            return {
              subscriber: elem.subscriber as Address,
              units: BigInt(elem.units),
            };
          }),
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
      <div className="flex justify-between w-full mt-12 sm:mt-16 xl:mt-20 2xl:mt-24 min-[2000px]:mt-32 px-4">
        <div className="flex flex-col justify-between">
          <PlusSignIcon />
          <PlusSignIcon />
        </div>
        <h1 className="font-mono text-5xl sm:text-[75px] xl:text-[130px] 2xl:text-[145px] text-center">
          Edit
          <br />
          Creator Circle
        </h1>
        <div className="flex flex-col justify-between">
          <PlusSignIcon />
          <PlusSignIcon />
        </div>
      </div>
      <form onSubmit={handleSubmit(handleSave)}>
        <div className="flex flex-col items-center text-sm sm:text-lg">
          <div className="flex justify-between items-start w-full mt-12 sm:mt-16 xl:mt-20 2xl:mt-24 px-4">
            <PlusSignIcon />
            <div className="flex w-full sm:w-[600px] xl:w-[750px] 2xl:w-[1100px] m-auto">
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
        </div>
        <div className="flex flex-col items-center text-sm sm:text-lg mt-12">
          <div className="flex justify-between items-start w-full px-4">
            <PlusSignIcon />
            <div className="w-full sm:w-[600px] xl:w-[750px] 2xl:w-[1100px] text-sm sm:text-lg">
              <div className="flex">
                <div className="flex items-start gap-2 w-[45%]">
                  <PlusSignIcon />
                  <label htmlFor="cycle">Allocation Table</label>
                </div>
                <div className="flex items-start gap-2 w-[55%]">
                  <div>
                    <label htmlFor="cycle">
                      Enter the addresses and allocation units to define your
                      Creator Circle. Always use the smallest number of units
                      required to achieve your desired Honorarium split.
                      <br />
                      <br />
                      You can enter a single Ethereum address (e.g. a DAO
                      treasury) if you have other mechanisms planned for
                      allocation.
                    </label>
                    {!isMobile && (
                      <>
                        <FormProvider {...form}>
                          {watcher?.map((_, index) => (
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
                                  watcher?.length ?? 0 + 1
                                }.units`,
                                "0"
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
              {isMobile && (
                <>
                  <FormProvider {...form}>
                    {watcher?.map((_, index) => (
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
                            watcher?.length ?? 0 + 1
                          }.units`,
                          "0"
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
                </>
              )}
            </div>
            <PlusSignIcon />
          </div>
        </div>
        <BranchIsWalletConnected>
          <button
            className="w-full mt-12 mb-24 xl:mb-32 px-4 sm:px-0 font-serif text-2xl gradient-action-btn"
            disabled={isSaving}
          >
            <div className="flex items-center w-full sm:w-[600px] xl:w-[750px] 2xl:w-[1100px] m-auto">
              <ForwardArrowAnimated>
                <span>{isSaving ? "SAVING..." : "SAVE"}</span>
              </ForwardArrowAnimated>
            </div>
          </button>
          <button
            className="w-full mt-12 mb-24 xl:mb-32 px-4 sm:px-0 font-serif text-2xl gradient-action-btn"
            onClick={(e) => {
              e.preventDefault();

              if (openConnectModal) {
                openConnectModal();
              }
            }}
          >
            <div className="flex items-center w-full sm:w-[600px] xl:w-[750px] 2xl:w-[1100px] m-auto">
              <ForwardArrowAnimated>
                <span>CONNECT</span>
              </ForwardArrowAnimated>
            </div>
          </button>
        </BranchIsWalletConnected>
      </form>
    </>
  );
}
