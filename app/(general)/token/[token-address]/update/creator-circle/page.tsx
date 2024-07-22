"use client";
import { useEffect, useState } from "react";

import { gql, useQuery } from "@apollo/client";
import { FormProvider, useForm } from "react-hook-form";
import { Address, useContractReads } from "wagmi";
import { waitForTransaction, writeContract } from "wagmi/actions";

import { WalletConnect } from "@/components/blockchain/wallet-connect";
import { BranchIsWalletConnected } from "@/components/shared/branch-is-wallet-connected";
import CreatorCircleAllocationEntry from "@/components/shared/CreatorCircleAllocationEntry";
import {
  idaBeneficiaryFacetABI,
  nativeStewardLicenseFacetABI,
} from "@/lib/blockchain";
import { truncateStr } from "@/lib/utils";

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
  const { register, watch, getValues, setValue } = form;
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
    <div className="m-auto w-2/4">
      <h1 className="text-4xl font-bold text-blue-500">
        {tokenName} ({truncateStr(tokenAddress, 12)})
      </h1>
      <h2 className="text-medium mt-5 text-2xl font-bold">
        Edit Creator Circle
      </h2>
      <label
        htmlFor="cycle"
        className="mt-12 mb-2 block text-sm font-medium text-gray-900 dark:text-white"
      >
        The Creator Circle is the group of people/organizations that receive a
        token&apos;s Periodic Honorarium.
      </label>
      <div className="mb-6">
        <label
          htmlFor="cycle"
          className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
        >
          Allocation Table
        </label>
        <label
          htmlFor="cycle"
          className="mb-5 block text-sm font-medium text-gray-900 dark:text-white"
        >
          Enter the addresses and allocation units to define your Creator
          Circle. You can enter a single Ethereum address if you have other
          mechanisms planned for allocation.
        </label>
        <FormProvider {...form}>
          {watcher?.map((_, index) => (
            <CreatorCircleAllocationEntry
              key={index}
              index={index}
              register={register}
              totalUnits={totalUnits}
            />
          ))}
        </FormProvider>
        <div className="mb-6 flex">
          <button
            className="btn btn-sm mx-1 grow bg-gradient-to-r from-emerald-500 to-emerald-400 text-white"
            onClick={() => {
              setValue(
                `beneficiary.allocation.${watcher?.length ?? 0 + 1}.units`,
                "0"
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
      <BranchIsWalletConnected>
        <button
          className="float-right w-full rounded-full bg-blue-500 px-8 py-4 text-xl font-bold lg:w-40"
          onClick={handleSave}
        >
          {isSaving ? <span className="lds-dual-ring" /> : "Save"}
        </button>
        <div className="float-right">
          <WalletConnect />
        </div>
      </BranchIsWalletConnected>
    </div>
  );
}
