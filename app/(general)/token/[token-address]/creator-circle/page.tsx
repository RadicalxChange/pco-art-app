"use client";
import { useEffect, useState } from "react";

import { gql, useQuery } from "@apollo/client";
import { Framework, NativeAssetSuperToken } from "@superfluid-finance/sdk-core";
import Link from "next/link";
import { formatEther } from "viem";
import { Address, useAccount, useContractRead, useNetwork } from "wagmi";

import { nativeStewardLicenseFacetABI } from "@/lib/blockchain";
import { useEthersProvider, useEthersSigner } from "@/lib/hooks/use-ethers-js";
import { truncateStr } from "@/lib/utils";

type Subscription = {
  subscriber: { id: string };
  units: string;
  totalAmountReceivedUntilUpdatedAt: string;
  approved: boolean;
};

export default function CreatorCirclePage({
  params,
}: {
  params: { "token-address": string };
}) {
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const [superTokenBalance, setSuperTokenBalance] = useState<string>();
  const [sfFramework, setSfFramework] = useState<Framework>();
  const [amountsReceived, setAmountsReceived] = useState<string[]>([]);

  const CREATOR_CIRCLE_QUERY = gql`
    query CreatorCircle($publisher: String!) {
      indexes(first: 1, where: { publisher: $publisher }) {
        subscriptions {
          subscriber {
            id
          }
          approved
          totalAmountReceivedUntilUpdatedAt
          indexValueUntilUpdatedAt
          units
        }
        token {
          id
        }
        totalUnits
        totalAmountDistributedUntilUpdatedAt
        indexValue
        indexId
      }
    }
  `;
  const tokenAddress = params["token-address"].toLowerCase() as Address;

  const { data: creatorCircle, refetch } = useQuery(CREATOR_CIRCLE_QUERY, {
    variables: { publisher: tokenAddress },
  });
  const account = useAccount();
  const signer = useEthersSigner();
  const provider = useEthersProvider();
  const { chain } = useNetwork();
  const { data: tokenName } = useContractRead({
    address: tokenAddress,
    abi: nativeStewardLicenseFacetABI,
    functionName: "name",
  });

  const totalUnits = creatorCircle?.indexes[0]?.totalUnits ?? null;
  const totalDistribution =
    creatorCircle?.indexes[0]?.totalAmountDistributedUntilUpdatedAt ?? null;
  const superToken = creatorCircle?.indexes[0]?.token.id ?? null;
  const indexId = creatorCircle?.indexes[0]?.indexId ?? null;

  useEffect(() => {
    (async () => {
      if (
        !provider ||
        !chain ||
        !creatorCircle?.indexes[0] ||
        !account.address ||
        !signer ||
        isApproving ||
        isWithdrawing
      ) {
        return;
      }

      const index = creatorCircle.indexes[0];
      const sfFramework = await Framework.create({
        chainId: chain.id,
        provider: provider,
      });
      const amountsReceived: string[] = [];

      for (const subscription of index.subscriptions) {
        const amountReceived = calcAmountReceived(
          BigInt(index.indexValue),
          BigInt(subscription.totalAmountReceivedUntilUpdatedAt),
          BigInt(subscription.indexValueUntilUpdatedAt),
          BigInt(subscription.units)
        );

        amountsReceived.push(amountReceived);
      }

      const nativeSuperToken = await sfFramework.loadNativeAssetSuperToken(
        superToken
      );
      const superTokenBalance = await nativeSuperToken.balanceOf({
        account: account.address,
        providerOrSigner: signer,
      });

      setAmountsReceived(amountsReceived);
      setSfFramework(sfFramework);
      setSuperTokenBalance(superTokenBalance);
    })();
  }, [provider, chain, creatorCircle, signer, isApproving, isWithdrawing]);

  const handleClaim = async () => {
    if (!account.address || !signer || !sfFramework) {
      return;
    }

    setIsApproving(true);

    try {
      const tx = await sfFramework.idaV1
        .approveSubscription({
          superToken,
          indexId,
          publisher: tokenAddress,
        })
        .exec(signer);
      await tx.wait();

      setIsApproving(false);
      refetch();
    } catch (err) {
      console.error(err);
      setIsApproving(false);
    }
  };

  const handleWithdraw = async () => {
    if (!sfFramework) {
      throw Error("Could not find Superfluid framework");
    }

    if (!signer) {
      throw Error("Could not find signer");
    }

    try {
      setIsWithdrawing(true);

      const nativeSuperToken = (await sfFramework.loadSuperToken(
        superToken
      )) as NativeAssetSuperToken;
      const op = nativeSuperToken.downgrade({
        amount: superTokenBalance ?? "0",
      });
      const tx = await op.exec(signer);

      await tx.wait();

      setIsWithdrawing(false);
    } catch (err) {
      setIsWithdrawing(false);
    }
  };

  const calcAmountReceived = (
    publisherIndexValue: bigint,
    subscriberTotalAmountReceivedUntilUpdatedAt: bigint,
    subscriberIndexValueUntilUpdatedAt: bigint,
    subscriberUnits: bigint
  ) => {
    const amountReceived =
      subscriberTotalAmountReceivedUntilUpdatedAt +
      (publisherIndexValue - subscriberIndexValueUntilUpdatedAt) *
        subscriberUnits;

    return formatEther(amountReceived);
  };

  return (
    <div className="w-10/12 lg:w-9/12">
      <h1 className="text-4xl font-bold text-blue-500">Creator Circle</h1>
      <h2 className="text-medium mt-5 text-2xl font-bold">{tokenName}</h2>
      <h3 className="text-medium mt-12 text-xl font-bold">Allocation Table</h3>
      <table className="mt-4 w-full border-separate border-spacing-4">
        <thead>
          <tr>
            <th>Address</th>
            <th>Units</th>
            <th>%</th>
            <th className="lg:hidden">Honorarium</th>
            <th className="hidden lg:block">To-Date Honorarium</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {creatorCircle?.indexes[0]?.subscriptions.map(
            (subscription: Subscription, i: number) => (
              <tr key={i} className="">
                <td className="rounded-lg bg-gray-300 p-2 dark:bg-gray-700">
                  {truncateStr(subscription.subscriber.id, 20)}
                </td>
                <td className="rounded-lg bg-gray-300 p-2 dark:bg-gray-700">
                  {subscription.units}
                </td>
                <td className="rounded-lg bg-gray-300 p-2 dark:bg-gray-700">
                  {parseFloat(
                    ((Number(subscription.units) * 100) / totalUnits).toFixed(2)
                  )}
                </td>
                <td className="rounded-lg bg-gray-300 p-2 dark:bg-gray-700">
                  {amountsReceived[i] ? amountsReceived[i] : "0"}
                </td>
                {subscription.subscriber.id ===
                  account.address?.toLowerCase() && !subscription.approved ? (
                  <td className="flex justify-center">
                    <button
                      className="w-28 rounded-lg bg-green-500 px-5 py-2 font-bold lg:w-40"
                      onClick={handleClaim}
                    >
                      {isApproving ? (
                        <span className="lds-dual-ring" />
                      ) : (
                        <>
                          <span className="hidden lg:block">Approve Units</span>
                          <span className="lg:hidden">Approve</span>
                        </>
                      )}
                    </button>
                  </td>
                ) : null}
              </tr>
            )
          )}
        </tbody>
      </table>
      {account?.address ? (
        <div className="mt-12">
          <h4 className="text-xl font-bold">Your Available Honorarium</h4>
          <p className="mt-2 leading-6">
            The Honorariums from all Creator Circles in which you have approved
            units are collected in the single balance shown below.
            <br /> You can utilize this{" "}
            <Link
              href="https://docs.superfluid.finance/superfluid/developers/super-tokens"
              target="_blank"
              prefetch={false}
              className="underline"
            >
              Super Token
            </Link>{" "}
            balance as is or withdraw to ETH.
          </p>
          <h5 className="mt-5 text-lg font-bold">
            {superTokenBalance
              ? formatEther(BigInt(superTokenBalance)).slice(0, 10)
              : 0}{" "}
            ETHx
          </h5>
          {superTokenBalance && BigInt(superTokenBalance) > 0 ? (
            <button
              className="mt-3 w-48 rounded-lg bg-green-500 px-5 py-2 font-bold"
              onClick={handleWithdraw}
            >
              {isWithdrawing ? (
                <span className="lds-dual-ring" />
              ) : (
                "Withdraw Funds"
              )}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
