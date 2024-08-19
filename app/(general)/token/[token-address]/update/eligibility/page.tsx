"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { useForm } from "react-hook-form";
import { Address, useContractReads } from "wagmi";
import { waitForTransaction, writeContract } from "wagmi/actions";
import { useConnectModal } from "@rainbow-me/rainbowkit";

import PlusSignIcon from "@/components/shared/plus-sign-icon";
import ForwardArrowAnimated from "@/components/shared/forward-arrow-animated";
import { BranchIsWalletConnected } from "@/components/shared/branch-is-wallet-connected";
import {
  allowlistFacetABI,
  nativeStewardLicenseFacetABI,
} from "@/lib/blockchain";

export default function UpdateEligibilityPage({
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
  const { register, setValue, getValues, watch, handleSubmit } = useForm();

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
    <>
      <div className="flex justify-between w-full mt-12 sm:mt-16 xl:mt-20 2xl:mt-24 min-[2000px]:mt-32 px-4">
        <div className="flex flex-col justify-between">
          <PlusSignIcon />
          <PlusSignIcon />
        </div>
        <h1 className="font-mono text-5xl sm:text-[75px] xl:text-[130px] 2xl:text-[145px] text-center">
          Edit
          <br />
          Inauguration Eligibility
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
              <div className="flex w-full">
                <div className="flex items-start gap-2 w-[45%]">
                  <PlusSignIcon />
                  <label htmlFor="allowlist.allow-any">Criteria</label>
                </div>
                <div className="flex items-start gap-2 w-[55%]">
                  <div className="flex flex-col">
                    <label htmlFor="allowlist.allow-any">
                      Set who can participate in this token&apos;s Stewardship
                      Inaugurations.
                    </label>
                    <select
                      {...register("allowlist.allow-any")}
                      className="bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD] mt-2"
                    >
                      <option value="true">Open Participation</option>
                      <option value="false">Allowlist</option>
                    </select>
                  </div>
                  <PlusSignIcon />
                </div>
              </div>
            </div>
            <PlusSignIcon />
          </div>
          <div className="flex sm:justify-center w-full px-4 sm:px-0">
            <div className="w-full sm:w-[600px] xl:w-[750px] 2xl:w-[1100px] text-sm sm:text-lg">
              {watchAllowAny === "false" && (
                <div className="flex w-full mt-12">
                  <div className="flex items-start gap-2 w-[45%]">
                    <PlusSignIcon />
                    <label htmlFor="allowlist.addresses">Allowlist</label>
                  </div>
                  <div className="flex items-start gap-2 w-[55%]">
                    <div className="flex flex-col w-full">
                      <label htmlFor="allowlist.addresses">
                        Provide the eligibile Ethereum addresses.
                      </label>
                      {watchAddresses?.map((_: any, index: number) => (
                        <div key={index} className="flex">
                          {index > 0 && (
                            <button
                              className="bg-transparent mt-1 mr-1"
                              onClick={() => {
                                // Remove item from watchAddresses
                                setValue(
                                  `allowlist.addresses`,
                                  watchAddresses?.toSpliced(index, 1)
                                );
                              }}
                            >
                              <Image
                                src="/cancel.svg"
                                alt="Cancel"
                                width={24}
                                height={24}
                              />
                            </button>
                          )}
                          <input
                            {...register(`allowlist.addresses.${index}`)}
                            type="string"
                            id={`allowlist.addresses.${index}`}
                            className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD] mb-2"
                            placeholder="0x"
                            required
                            pattern="^(0x)?[0-9a-fA-F]{40}$"
                          />
                        </div>
                      ))}
                      <div className="flex mt-2">
                        <button
                          className="w-full flex items-center gap-1 bg-transparent"
                          onClick={() => {
                            setValue(
                              `allowlist.addresses.${
                                watchAddresses?.length ?? 0 + 1
                              }`,
                              ""
                            );
                          }}
                        >
                          <Image
                            src="/add.svg"
                            alt="Add"
                            width={23}
                            height={23}
                          />
                          Add another address
                        </button>
                      </div>
                    </div>
                    <PlusSignIcon />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <BranchIsWalletConnected>
          <button
            className="w-full mt-12 mb-24 xl:mb-32 px-4 sm:px-0 font-serif text-2xl gradient-action-btn"
            disabled={isSaving}
          >
            <div className="w-full sm:w-[600px] xl:w-[750px] 2xl:w-[1100px] m-auto">
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
            <div className="w-full sm:w-[600px] xl:w-[750px] 2xl:w-[1100px] m-auto">
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
