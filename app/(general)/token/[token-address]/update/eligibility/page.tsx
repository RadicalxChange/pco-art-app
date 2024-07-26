"use client";
import { useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import { Address, useContractReads } from "wagmi";
import { waitForTransaction, writeContract } from "wagmi/actions";

import { WalletConnect } from "@/components/blockchain/wallet-connect";
import { BranchIsWalletConnected } from "@/components/shared/branch-is-wallet-connected";
import {
  allowlistFacetABI,
  nativeStewardLicenseFacetABI,
} from "@/lib/blockchain";
import { truncateStr } from "@/lib/utils";

export default function UpdateEligibilityPage({
  params,
}: {
  params: { "token-address": string };
}) {
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const tokenAddress = params["token-address"] as Address;

  const { data } = useContractReads({
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
      {
        address: tokenAddress,
        abi: allowlistFacetABI,
        functionName: "getAllowlist",
      },
      {
        address: tokenAddress,
        abi: allowlistFacetABI,
        functionName: "getAllowAny",
      },
    ],
  });
  const { register, setValue, getValues, watch } = useForm();

  const tokenName =
    data && data[0].status === "success" ? data[0].result : null;
  const owner = data && data[1].status === "success" ? data[1].result : null;
  const currentAllowList =
    data && data[2].status === "success" ? data[2].result : null;
  const isAllowAny =
    data && data[3].status === "success" ? data[3].result : null;

  const watchAllowAny = watch("allowlist.allow-any");
  const watchAddresses = watch(`allowlist.addresses`);

  useEffect(() => {
    if (!currentAllowList) {
      return;
    }

    setValue("allowlist.allow-any", isAllowAny ? "true" : "false");
    setValue("allowlist.addresses", currentAllowList);
  }, [currentAllowList, isAllowAny]);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      let hash;
      const { allowlist } = getValues();
      const allowAny = allowlist["allow-any"] === "true";
      const newAllowList = allowlist.addresses.filter(String);
      const removeAddresses = currentAllowList
        ? currentAllowList.filter(
            (address: Address) => !newAllowList.includes(address)
          )
        : [];
      const addAddresses = currentAllowList
        ? newAllowList.filter(
            (address: Address) => !currentAllowList.includes(address)
          )
        : [];

      if (allowAny) {
        hash = await setAllowAny();
      } else if (removeAddresses.length > 0 && addAddresses.length > 0) {
        hash = await batchUpdateAllowlist(removeAddresses, addAddresses);
      } else if (removeAddresses.length > 0) {
        hash = await batchRemoveFromAllowlist(removeAddresses);
      } else {
        hash = await batchAddToAllowlist(addAddresses);
      }

      if (hash) {
        await waitForTransaction({ hash });
      }

      setIsSaving(false);
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  const setAllowAny = async () => {
    const { hash } = await writeContract({
      address: tokenAddress,
      abi: allowlistFacetABI,
      functionName: "setAllowAny",
      args: [true],
    });

    return hash;
  };

  const batchAddToAllowlist = async (
    addresses: Address[],
    allowAny?: boolean
  ) => {
    const { hash } = await writeContract({
      address: tokenAddress,
      abi: allowlistFacetABI,
      functionName: "batchAddToAllowlist",
      args: [addresses, false],
    });

    return hash;
  };

  const batchRemoveFromAllowlist = async (
    addresses: Address[],
    allowAny?: boolean
  ) => {
    const { hash } = await writeContract({
      address: tokenAddress,
      abi: allowlistFacetABI,
      functionName: "batchRemoveFromAllowlist",
      args: [addresses, allowAny ?? false],
    });

    return hash;
  };

  const batchUpdateAllowlist = async (
    removeAddresses: Address[],
    addAddresses: Address[],
    allowAny?: boolean
  ) => {
    const { hash } = await writeContract({
      address: tokenAddress,
      abi: allowlistFacetABI,
      functionName: "batchUpdateAllowlist",
      args: [removeAddresses, addAddresses, allowAny ?? false],
    });

    return hash;
  };

  return (
    <div className="m-auto w-2/4">
      <h1 className="text-4xl font-bold text-blue-500">
        {tokenName} ({truncateStr(tokenAddress, 12)})
      </h1>
      <h2 className="text-medium mt-5 text-2xl font-bold">
        Edit Inauguration Eligibility
      </h2>
      <div className="mb-6 mt-12">
        <label
          htmlFor="allowlist.allow-any"
          className="mb-2 block font-medium text-gray-900 dark:text-white"
        >
          Criteria
        </label>
        <label
          htmlFor="allowlist.allow-any"
          className="mb-2 block font-medium text-gray-900 dark:text-white"
        >
          Set who can participate in this token&apos;s Stewardship
          Inaugurations.
        </label>
        <select
          {...register("allowlist.allow-any")}
          className="grow rounded-lg border border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700"
        >
          <option value="true">Open Participation</option>
          <option value="false">Allowlist</option>
        </select>
      </div>
      {watchAllowAny === "false" && (
        <div className="mb-6">
          <label
            htmlFor="allowlist.addresses"
            className="mb-2 block font-medium text-gray-900 dark:text-white"
          >
            Allowlist
          </label>
          <label
            htmlFor="allowlist.addresses"
            className="mb-2 block font-medium text-gray-900 dark:text-white"
          >
            Provide the eligibile Ethereum addresses.
          </label>
          {watchAddresses?.map((_: any, index: number) => (
            <div key={index} className="mb-6 flex">
              {index > 0 && (
                <button
                  className="btn btn-sm mx-5 bg-gradient-to-r from-red-500 to-red-400 text-white"
                  onClick={() => {
                    // Remove item from watchAddresses
                    setValue(
                      `allowlist.addresses`,
                      watchAddresses?.toSpliced(index, 1)
                    );
                  }}
                >
                  -
                </button>
              )}
              <input
                {...register(`allowlist.addresses.${index}`)}
                type="string"
                id={`allowlist.addresses.${index}`}
                className="mx-1 grow rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                placeholder="0x"
                required
                pattern="^(0x)?[0-9a-fA-F]{40}$"
              />
            </div>
          ))}
          <div className="mb-6 flex">
            <button
              className="btn btn-sm mx-1 grow bg-gradient-to-r from-emerald-500 to-emerald-400 text-white"
              onClick={() => {
                setValue(
                  `allowlist.addresses.${watchAddresses?.length ?? 0 + 1}`,
                  ""
                );
              }}
            >
              + Add another address
            </button>
          </div>
        </div>
      )}
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
