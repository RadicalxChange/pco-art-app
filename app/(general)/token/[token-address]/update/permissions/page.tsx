"use client";

import { useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import { keccak256, toHex } from "viem";
import { Address, useAccount, useContractReads } from "wagmi";
import { waitForTransaction, writeContract } from "wagmi/actions";
import { useConnectModal } from "@rainbow-me/rainbowkit";

import PlusSignIcon from "@/components/shared/plus-sign-icon";
import { BranchIsWalletConnected } from "@/components/shared/branch-is-wallet-connected";
import ForwardArrowAnimated from "@/components/shared/forward-arrow-animated";
import {
  accessControlFacetABI,
  nativeStewardLicenseFacetABI,
} from "@/lib/blockchain";
import {
  ADMIN_ROLE,
  useGetRoleMember,
  useHasRole,
} from "@/lib/hooks/use-access-control-facet";
import { ZERO_ADDRESS } from "@/lib/utils";

const roles: { [key: string]: string } = {
  pcoParams: "PeriodicPCOParamsFacet.COMPONENT_ROLE",
  auction: "EnglishPeriodicAuctionFacet.COMPONENT_ROLE",
  allowlist: "AllowlistFacet.COMPONENT_ROLE",
  beneficiary: "IDABeneficiaryFacet.COMPONENT_ROLE",
  addTokenToCollection: "StewardLicenseBase.ADD_TOKEN_TO_COLLECTION_ROLE",
};

const ownableDiamondABI = [
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "nomineeOwner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "acceptOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

type Action = {
  functionName:
    | "transferOwnership"
    | "grantRole"
    | "revokeRole"
    | "renounceRole";
  abi: typeof ownableDiamondABI | typeof accessControlFacetABI;
  args: readonly Address[];
};

export default function UpdatePCOSettingsPage({
  params,
}: {
  params: { "token-address": string };
}) {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isAcceptingOwnership, setIsAcceptingOwnership] =
    useState<boolean>(false);
  const [completedActions, setCompletedActions] = useState<number>(0);
  const [actions, setActions] = useState<Action[]>([]);

  const tokenAddress = params["token-address"] as Address;

  const { openConnectModal } = useConnectModal();
  const account = useAccount();
  const { data } = useContractReads({
    contracts: [
      {
        address: tokenAddress,
        abi: nativeStewardLicenseFacetABI,
        functionName: "name",
      },
      {
        address: tokenAddress,
        abi: ownableDiamondABI,
        functionName: "owner",
      },
      {
        address: tokenAddress,
        abi: ownableDiamondABI,
        functionName: "nomineeOwner",
      },
    ],
    watch: true,
  });
  const {
    hasAllowlistRole,
    hasAuctionRole,
    hasBeneficiaryRole,
    hasAddTokenToCollectionRole,
    hasPcoParamsRole,
    hasAdminRole,
  } = useHasRole({
    tokenAddress,
    accountAddress: account.address,
    watch: true,
  });
  const roleMember = useGetRoleMember({
    tokenAddress,
    index: BigInt(0),
    watch: true,
  });

  const tokenName =
    data && data[0].status === "success" ? data[0].result : null;
  const collectionOwner =
    data && data[1].status === "success" ? data[1].result : null;
  const nomineeOwner =
    data && data[2].status === "success" ? data[2].result : null;
  const isTransferPending = nomineeOwner && nomineeOwner !== ZERO_ADDRESS;

  const { register, getValues, setValue, watch, handleSubmit } = useForm();
  const watchPermissions = watch();

  useEffect(() => {
    if (!roleMember || !collectionOwner) {
      return;
    }

    setValue("owner", isTransferPending ? nomineeOwner : collectionOwner);
    setValue("permissions.pcoParams", roleMember.pcoParams);
    setValue("permissions.auction", roleMember.auction);
    setValue("permissions.allowlist", roleMember.allowlist);
    setValue("permissions.beneficiary", roleMember.beneficiary);
    setValue(
      "permissions.addTokenToCollection",
      roleMember.addTokenToCollection
    );
    setValue("roleAdmin", roleMember.adminRole);

    const subscription = watch((value, { name, type }) => {
      const { owner, roleAdmin, permissions } = value;

      let totalActions = 0;
      const permissionsKeys = Object.keys(permissions);
      const actions: Action[] = [];

      if (
        owner?.toLowerCase() !== collectionOwner?.toLowerCase() ||
        (isTransferPending &&
          owner?.toLowerCase() !== nomineeOwner.toLowerCase())
      ) {
        actions.push({
          functionName: "transferOwnership",
          abi: ownableDiamondABI,
          args: [owner],
        });
      }

      if (roleAdmin?.toLowerCase() !== roleMember.adminRole?.toLowerCase()) {
        actions.push({
          functionName: "grantRole",
          abi: accessControlFacetABI,
          args: [ADMIN_ROLE, roleAdmin],
        });
        actions.push({
          functionName: "renounceRole",
          abi: accessControlFacetABI,
          args: [ADMIN_ROLE],
        });
      }

      for (const key of permissionsKeys) {
        if (
          permissions[key]?.toLowerCase() !== roleMember[key]?.toLowerCase()
        ) {
          actions.push(
            {
              functionName: "revokeRole",
              abi: accessControlFacetABI,
              args: [keccak256(toHex(roles[key])), roleMember[key] ?? "0x"],
            },
            {
              functionName: "grantRole",
              abi: accessControlFacetABI,
              args: [keccak256(toHex(roles[key])), permissions[key]],
            }
          );
        }
      }

      setActions(actions);
    });

    return () => subscription.unsubscribe();
  }, [
    watch,
    collectionOwner,
    nomineeOwner,
    roleMember.pcoParams,
    roleMember.auction,
    roleMember.allowlist,
    roleMember.beneficiary,
    roleMember.addTokenToCollection,
    roleMember.adminRole,
  ]);

  const handleSave = async () => {
    const remainingActions = actions.slice();

    setIsSaving(true);

    try {
      for (const action of actions) {
        const { hash } = await writeContract({
          address: tokenAddress,
          ...(action as any),
        });
        await waitForTransaction({ hash });
        remainingActions.splice(1);
        setCompletedActions((prev) => prev + 1);
      }

      setIsSaving(false);
      setCompletedActions(0);
      setActions([]);
    } catch (err) {
      console.error(err);
      setIsSaving(false);
      setActions(remainingActions);
    }
  };

  const handleTransferAcceptance = async () => {
    setIsAcceptingOwnership(true);

    try {
      const { hash } = await writeContract({
        address: tokenAddress,
        abi: ownableDiamondABI,
        functionName: "acceptOwnership",
      });
      await waitForTransaction({ hash });

      setIsAcceptingOwnership(false);
    } catch (err) {
      console.error(err);
      setIsAcceptingOwnership(false);
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
          Permissions
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
            <div className="flex w-full sm:w-[600px] xl:w-[750px] 2xl:w-[1100px]">
              <div className="flex items-start gap-2 w-[45%]">
                <PlusSignIcon />
                <span>Intro</span>
              </div>
              <div className="flex items-start gap-2 w-[55%]">
                <span>
                  Certain aspects of your Stewardship License can be configured
                  to allow for updates. Carefully consider the expectations of
                  your future Stewards & Creator Circle. There are social and
                  security trade-offs with upgradability vs. immutability. You
                  can forgo, maintain, or allocate these permissions. We&apos;ve
                  set suggested defaults. Make sure secure access to the
                  selected addresses can be maintained. We cannot change these
                  values for you.
                </span>
                <PlusSignIcon />
              </div>
            </div>
            <PlusSignIcon />
          </div>
          <div className="flex sm:justify-center w-full px-4 sm:px-0">
            <div className="w-full sm:w-[600px] xl:w-[750px] 2xl:w-[1100px] text-sm sm:text-lg">
              <div className="flex mt-12">
                <div className="flex items-start gap-2 w-[45%]">
                  <PlusSignIcon />
                  <label htmlFor="owner">Token Admin</label>
                </div>
                <div className="flex items-start gap-2 w-[55%]">
                  <div className="flex flex-col">
                    <label htmlFor="owner">
                      This role mimics the permissions that you are exercising
                      now at minting (with technical limitations around backward
                      compatibility). This address can change a token&apos;s PCO
                      settings, implementation/configuration of core components,
                      and reassign the roles below. Set to 0x0 if/when you
                      don&apos;t want an admin.
                    </label>
                    <div className="flex flex-col">
                      <input
                        {...register(`owner`)}
                        type="text"
                        className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD] mt-2"
                        placeholder="0x"
                        required
                        pattern="^(0x)?[0-9a-fA-F]{40}$"
                        style={{
                          pointerEvents:
                            account.address === collectionOwner
                              ? "auto"
                              : "none",
                          opacity:
                            account.address === collectionOwner ? 1 : 0.4,
                        }}
                      />
                    </div>
                    {isTransferPending && nomineeOwner === account.address ? (
                      <button
                        className="w-full bg-neon-green font-serif text-xl py-1"
                        onClick={handleTransferAcceptance}
                      >
                        <span className="font-bold">
                          {isAcceptingOwnership
                            ? "Accepting..."
                            : "Accept Ownership"}
                        </span>
                      </button>
                    ) : isTransferPending ? (
                      <span className="pt-1">Pending Acceptance</span>
                    ) : null}
                  </div>
                  <PlusSignIcon />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-start w-full mt-12 px-4">
          <PlusSignIcon />
          <div className="flex items-start w-full sm:w-[600px] xl:w-[750px] 2xl:w-[1100px]">
            <div className="flex items-start gap-2 w-[45%]">
              <PlusSignIcon />
              <label>Component Configuration</label>
            </div>
            <div className="flex items-start gap-2 w-[55%]">
              <div className="flex flex-col">
                <label>
                  Assign the ability to configure the details of each core
                  component. Token Admins can reassign these roles at any time.
                </label>
                <label htmlFor="roleAdmin" className="mt-6">
                  Role Admin
                </label>
                <input
                  {...register(`roleAdmin`)}
                  type="text"
                  className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD] mt-2"
                  placeholder="0x"
                  required
                  pattern="^(0x)?[0-9a-fA-F]{40}$"
                  style={{
                    pointerEvents: hasAdminRole ? "auto" : "none",
                    opacity: hasAdminRole ? 1 : 0.4,
                  }}
                />
                <label htmlFor="permissions.pcoParams" className="mt-6">
                  PCO Settings
                </label>
                <input
                  {...register(`permissions.pcoParams`)}
                  type="text"
                  className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD] mt-2"
                  placeholder="0x"
                  required
                  pattern="^(0x)?[0-9a-fA-F]{40}$"
                  style={{
                    pointerEvents: hasAdminRole ? "auto" : "none",
                    opacity: hasAdminRole ? 1 : 0.4,
                  }}
                />
                <label htmlFor="permissions.auction" className="mt-6">
                  Stewardship Inauguration
                </label>
                <input
                  {...register(`permissions.auction`)}
                  type="text"
                  className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD] mt-2"
                  placeholder="0x"
                  required
                  pattern="^(0x)?[0-9a-fA-F]{40}$"
                  style={{
                    pointerEvents: hasAdminRole ? "auto" : "none",
                    opacity: hasAdminRole ? 1 : 0.4,
                  }}
                />
                <label htmlFor="permissions.allowlist" className="mt-6">
                  Inauguration Eligibility
                </label>
                <input
                  {...register(`permissions.allowlist`)}
                  type="text"
                  className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD] mt-2"
                  placeholder="0x"
                  required
                  pattern="^(0x)?[0-9a-fA-F]{40}$"
                  style={{
                    pointerEvents: hasAdminRole ? "auto" : "none",
                    opacity: hasAdminRole ? 1 : 0.4,
                  }}
                />
                <label htmlFor="permissions.beneficiary" className="mt-6">
                  Creator Circle
                </label>
                <input
                  {...register(`permissions.beneficiary`)}
                  type="text"
                  className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD] mt-2"
                  placeholder="0x"
                  required
                  pattern="^(0x)?[0-9a-fA-F]{40}$"
                  style={{
                    pointerEvents: hasAdminRole ? "auto" : "none",
                    opacity: hasAdminRole ? 1 : 0.4,
                  }}
                />
                <label
                  htmlFor="permissions.addTokenToCollection"
                  className="mt-6"
                >
                  Mint Additional Tokens
                </label>
                <input
                  {...register("permissions.addTokenToCollection")}
                  type="text"
                  className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD] mt-2"
                  placeholder="0x"
                  required
                  pattern="^(0x)?[0-9a-fA-F]{40}$"
                  style={{
                    pointerEvents: hasAdminRole ? "auto" : "none",
                    opacity: hasAdminRole ? 1 : 0.4,
                  }}
                />
              </div>
              <PlusSignIcon />
            </div>
          </div>
          <PlusSignIcon />
        </div>
        <BranchIsWalletConnected>
          <button
            className="w-full mt-12 mb-24 xl:mb-32 px-4 sm:px-0 font-serif text-2xl gradient-action-btn"
            disabled={isSaving || actions.length === 0}
          >
            <div className="w-full sm:w-[600px] xl:w-[750px] 2xl:w-[1100px] m-auto">
              <ForwardArrowAnimated>
                <span>
                  {isSaving
                    ? `SAVING (${completedActions + 1}/${actions.length})`
                    : actions.length > 0
                    ? `SAVE (${actions.length})`
                    : "SAVE"}
                </span>
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
