"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { gql, useQuery } from "@apollo/client";
import { FormProvider, useForm } from "react-hook-form";
import { Address, useContractReads } from "wagmi";
import { waitForTransaction, writeContract } from "wagmi/actions";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { BranchIsWalletConnected } from "@/components/shared/branch-is-wallet-connected";

import { useMediaQuery } from "react-responsive";
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
      <h1 className="font-mono text-5xl sm:text-[75px] xl:text-[100px] 2xl:text-[160px] text-center leading-none mt-12 sm:mt-16 xl:mt-20 2xl:mt-24 min-[2000px]:mt-32">
        Edit
        <br />
        Creator Circle
      </h1>
      <form onSubmit={handleSubmit(handleSave)}>
        <div className="flex flex-col items-center max-w-[320px] sm:max-w-[750px] xl:max-w-[1100px] 2xl:max-w-[1500px] m-auto">
          <div className="w-[320px] sm:w-[600px] xl:w-[750px] 2xl:w-[1100px] my-10 sm:mt-16 xl:mt-20 2xl:mt-24 text-lg sm:text-xl">
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
        <BranchIsWalletConnected>
          <button
            className="w-full mt-10 mb-24 xl:mb-32 px-2 py-1 bg-gradient-to-r from-[#05ff00] via-[#0094ff] to-[#fa00ff] font-serif text-2xl"
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
            className="w-full mt-10 mb-24 xl:mb-32 px-2 py-1 bg-gradient-to-r from-[#05ff00] via-[#0094ff] to-[#fa00ff] font-serif text-2xl"
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
