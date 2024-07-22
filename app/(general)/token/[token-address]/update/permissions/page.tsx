"use client";
import { useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import { keccak256, toHex } from "viem";
import { Address, useAccount, useContractReads } from "wagmi";
import { waitForTransaction, writeContract } from "wagmi/actions";

import { WalletConnect } from "@/components/blockchain/wallet-connect";
import { BranchIsWalletConnected } from "@/components/shared/branch-is-wallet-connected";
import {
  accessControlFacetABI,
  nativeStewardLicenseFacetABI,
} from "@/lib/blockchain";
import {
  ADMIN_ROLE,
  useGetRoleMember,
  useHasRole,
} from "@/lib/hooks/use-access-control-facet";
import { ZERO_ADDRESS, truncateStr } from "@/lib/utils";

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

  const { register, getValues, setValue, watch } = useForm();
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
    <div className="m-auto w-2/4">
      <h1 className="text-4xl font-bold text-blue-500">
        {tokenName} ({truncateStr(tokenAddress, 12)})
      </h1>
      <h2 className="text-medium mt-5 mb-2 text-2xl font-bold">
        Edit Permissions
      </h2>
      <p>
        Certain aspects of your Stewardship License can be configured to allow
        for updates. Carefully consider the expectations of your future Stewards
        & Creator Circle. There are social and security trade-offs with
        upgradability vs. immutability.
        <br />
        <br />
        You can forgo, maintain, or allocate these permissions. We've set
        suggested defaults. Make sure secure access to the selected addresses
        can be maintained. We cannot change these values for you.
      </p>
      <h3 className="mt-10 mb-2 text-lg font-bold">Collection Owner</h3>
      <p>
        This role mimics the permissions that you are exercising now at minting
        (with technical limitations around backward compatibility). This address
        can change a token's PCO settings, implementation/configuration of core
        components, and reassign the roles below.
      </p>
      <div className="mt-5 flex flex-col gap-2 lg:flex-row lg:items-center">
        <input
          {...register("owner")}
          type="text"
          className="mr-5 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 lg:w-4/6"
          style={{
            pointerEvents:
              account.address === collectionOwner ? "auto" : "none",
            opacity: account.address === collectionOwner ? 1 : 0.6,
          }}
        />
        {isTransferPending && nomineeOwner === account.address ? (
          <button
            className="rounded-full bg-blue-500 py-3 lg:w-60"
            onClick={handleTransferAcceptance}
          >
            {isAcceptingOwnership ? (
              <span className="lds-dual-ring" />
            ) : (
              <span className="font-bold">Accept Ownership</span>
            )}
          </button>
        ) : isTransferPending ? (
          <span className="font-bold">Pending Acceptance</span>
        ) : null}
      </div>
      <h4 className="mt-10 mb-2 text-lg font-bold">Component Configuration</h4>
      <p>
        Assign the ability to configure the details of each core component.
        Token Admins can reassign these roles at any time.
      </p>
      <form onSubmit={(e) => e.preventDefault()}>
        <div
          className="mb-6 mt-8 flex flex-col justify-between lg:flex-row lg:items-center"
          style={{
            pointerEvents: hasAdminRole ? "auto" : "none",
            opacity: hasAdminRole ? 1 : 0.6,
          }}
        >
          <label
            htmlFor="cycle"
            className="mb-2 block font-medium text-gray-900 dark:text-white"
          >
            Role Admin
          </label>
          <input
            {...register("roleAdmin")}
            type="text"
            className="mr-5 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 lg:w-4/6"
          />
        </div>
        <div
          className="mb-6 mt-8 flex flex-col justify-between lg:flex-row lg:items-center"
          style={{
            pointerEvents: hasAdminRole ? "auto" : "none",
            opacity: hasAdminRole ? 1 : 0.6,
          }}
        >
          <label
            htmlFor="cycle"
            className="mb-2 block font-medium text-gray-900 dark:text-white"
          >
            PCO Settings
          </label>
          <input
            {...register("permissions.pcoParams")}
            type="text"
            className="mr-5 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 lg:w-4/6"
          />
        </div>
        <div
          className="mb-6 mt-8 flex flex-col justify-between lg:flex-row lg:items-center"
          style={{
            pointerEvents: hasAdminRole ? "auto" : "none",
            opacity: hasAdminRole ? 1 : 0.6,
          }}
        >
          <label
            htmlFor="cycle"
            className="mb-2 block font-medium text-gray-900 dark:text-white"
          >
            Auction Pitch
          </label>
          <input
            {...register("permissions.auction")}
            type="text"
            className="mr-5 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 lg:w-4/6"
          />
        </div>
        <div
          className="mb-6 mt-8 flex flex-col justify-between lg:flex-row lg:items-center"
          style={{
            pointerEvents: hasAdminRole ? "auto" : "none",
            opacity: hasAdminRole ? 1 : 0.6,
          }}
        >
          <label
            htmlFor="cycle"
            className="mb-2 block font-medium text-gray-900 dark:text-white"
          >
            Auction Pitch Eligibility
          </label>
          <input
            {...register("permissions.allowlist")}
            type="text"
            className="mr-5 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 lg:w-4/6"
          />
        </div>
        <div
          className="mb-6 mt-8 flex flex-col justify-between lg:flex-row lg:items-center"
          style={{
            pointerEvents: hasAdminRole ? "auto" : "none",
            opacity: hasAdminRole ? 1 : 0.6,
          }}
        >
          <label
            htmlFor="cycle"
            className="mb-2 block font-medium text-gray-900 dark:text-white"
          >
            Creator Circle
          </label>
          <input
            {...register("permissions.beneficiary")}
            type="text"
            className="mr-5 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 lg:w-4/6"
          />
        </div>
        <div
          className="mb-6 mt-8 flex flex-col justify-between lg:flex-row lg:items-center"
          style={{
            pointerEvents: hasAdminRole ? "auto" : "none",
            opacity: hasAdminRole ? 1 : 0.6,
          }}
        >
          <label
            htmlFor="cycle"
            className="mb-2 block font-medium text-gray-900 dark:text-white"
          >
            Mint Additional Tokens
          </label>
          <input
            {...register("permissions.addTokenToCollection")}
            type="text"
            className="mr-5 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 lg:w-4/6"
          />
        </div>
        <BranchIsWalletConnected>
          <button
            className="float-right mr-2 w-full rounded-full bg-blue-500 px-8 py-4 text-xl font-bold lg:mr-4 lg:w-40"
            onClick={handleSave}
            style={{
              pointerEvents: actions.length > 0 ? "auto" : "none",
              opacity: actions.length > 0 ? 1 : 0.6,
            }}
          >
            {isSaving ? (
              <>
                <span className="lds-dual-ring" /> {completedActions + 1}/
                {actions.length}
              </>
            ) : (
              <span>
                Save {actions.length > 0 ? `(${actions.length})` : null}
              </span>
            )}
          </button>
          <div className="float-right">
            <WalletConnect />
          </div>
        </BranchIsWalletConnected>
      </form>
    </div>
  );
}
