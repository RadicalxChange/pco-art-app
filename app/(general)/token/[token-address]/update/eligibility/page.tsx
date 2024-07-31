"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { useForm } from "react-hook-form";
import { Address, useContractReads } from "wagmi";
import { waitForTransaction, writeContract } from "wagmi/actions";
import { useConnectModal } from "@rainbow-me/rainbowkit";

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
      <h1 className="font-mono text-5xl sm:text-[75px] xl:text-[100px] 2xl:text-[160px] text-center leading-none mt-12 sm:mt-16 xl:mt-20 2xl:mt-24 min-[2000px]:mt-32">
        Edit
        <br />
        Inauguration Eligibility
      </h1>
      <form onSubmit={handleSubmit(handleSave)}>
        <div className="flex flex-col items-center max-w-[320px] sm:max-w-[750px] xl:max-w-[1100px] 2xl:max-w-[1500px] m-auto">
          <div className="w-[320px] sm:w-[600px] xl:w-[750px] 2xl:w-[1100px] my-10 sm:mt-16 xl:mt-20 2xl:mt-24 text-lg sm:text-xl">
            <div className="flex">
              <label htmlFor="allowlist.allow-any" className="w-1/3">
                Criteria
              </label>
              <div className="flex flex-col w-2/3">
                <label htmlFor="allowlist.allow-any">
                  Set who can participate in this token&apos;s Stewardship
                  Inaugurations.
                </label>
                <select
                  {...register("allowlist.allow-any")}
                  className="bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-2xl placeholder-[#ADADAD] mt-2"
                >
                  <option value="true">Open Participation</option>
                  <option value="false">Allowlist</option>
                </select>
              </div>
            </div>
            {watchAllowAny === "false" && (
              <div className="flex mt-10">
                <label htmlFor="allowlist.addresses" className="w-1/3">
                  Allowlist
                </label>
                <div className="flex flex-col w-2/3">
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
                        className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-2xl placeholder-[#ADADAD] mb-2"
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
                      <Image src="/add.svg" alt="Add" width={23} height={23} />
                      Add another address
                    </button>
                  </div>
                </div>
              </div>
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
