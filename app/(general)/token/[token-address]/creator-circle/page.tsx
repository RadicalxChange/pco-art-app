"use client";
import { useEffect, useState } from "react";

import { gql, useQuery } from "@apollo/client";
import { Framework, NativeAssetSuperToken } from "@superfluid-finance/sdk-core";
import Link from "next/link";
import { formatEther } from "viem";
import { Address, useAccount, useContractRead, useNetwork } from "wagmi";
import { useMediaQuery } from "react-responsive";

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

  const isMobile = useMediaQuery({ query: "(max-width: 640px)" });

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
    <>
      <h1 className="font-mono text-5xl sm:text-[75px] xl:text-[100px] 2xl:text-[128px] text-center leading-none mt-12 sm:mt-16 xl:mt-20 2xl:mt-24 min-[2000px]:mt-32">
        Creator Circle
      </h1>
      <div className="flex flex-col items-center max-w-[320px] sm:max-w-[750px] xl:max-w-[1100px] 2xl:max-w-[1200px] m-auto">
        <div className="w-[320px] sm:w-[600px] xl:w-[750px] 2xl:w-[850px] my-10 sm:mt-16 xl:mt-20 2xl:mt-24">
          <h3 className="text-xl font-bold">Allocation Table</h3>
          {isMobile && (
            <>
              {creatorCircle?.indexes[0]?.subscriptions.map(
                (subscription: Subscription, i: number) => (
                  <div key={i} className="flex flex-col">
                    <span className="pt-3">Address</span>
                    <span className="pt-2 border-b border-black font-serif text-2xl">
                      {truncateStr(subscription.subscriber.id, 20)}
                    </span>
                    <span className="pt-3">Address</span>
                    <span className="pt-2 border-b border-black font-serif text-2xl">
                      {subscription.units}
                    </span>
                    <span className="pt-3">Percentage</span>
                    <span className="pt-2 border-b border-black font-serif text-2xl">
                      {parseFloat(
                        (
                          (Number(subscription.units) * 100) /
                          totalUnits
                        ).toFixed(2)
                      )}
                    </span>
                    <span className="pt-3">Amount</span>
                    <span className="pt-2 border-b border-black font-serif text-2xl">
                      {amountsReceived[i] ? amountsReceived[i] : "0"}
                    </span>
                    {subscription.subscriber.id ===
                      account.address?.toLowerCase() &&
                    !subscription.approved ? (
                      <button
                        className="bg-neon-green px-2 py-1 font-serif text-2xl"
                        onClick={handleClaim}
                      >
                        <span>
                          {isApproving ? "Approving..." : "Approve Units"}
                        </span>
                      </button>
                    ) : null}
                  </div>
                )
              )}
            </>
          )}
          {!isMobile && (
            <table className="mt-5 w-full">
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
                    <>
                      <tr key={i} className="font-serif text-2xl">
                        <td className="pt-3 border-b border-black text-center">
                          {truncateStr(subscription.subscriber.id, 20)}
                        </td>
                        <td className="pt-3 border-b border-black text-center">
                          {subscription.units}
                        </td>
                        <td className="pt-3 border-b border-black text-center">
                          {parseFloat(
                            (
                              (Number(subscription.units) * 100) /
                              totalUnits
                            ).toFixed(2)
                          )}
                        </td>
                        <td className="pt-3 border-b border-black text-center">
                          {amountsReceived[i] ? amountsReceived[i] : "0"}
                        </td>
                        {subscription.subscriber.id ===
                          account.address?.toLowerCase() &&
                        !subscription.approved ? (
                          <td className="flex justify-center pt-3">
                            <button
                              className="bg-neon-green px-2 py-1"
                              onClick={handleClaim}
                            >
                              <span>
                                {isApproving ? "Approving..." : "Approve Units"}
                              </span>
                            </button>
                          </td>
                        ) : null}
                      </tr>
                    </>
                  )
                )}
              </tbody>
            </table>
          )}
          {account?.address ? (
            <div className="mt-12 mb-24 2xl:mb-32">
              <h4 className="text-xl font-bold">Your Available Honorarium</h4>
              <p className="mt-2 leading-6">
                The Honorariums from all Creator Circles in which you have
                approved units are collected in the single balance shown below.
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
              <h5 className="mt-5 text-lg font-serif text-2xl">
                {superTokenBalance
                  ? formatEther(BigInt(superTokenBalance)).slice(0, 10)
                  : 0}{" "}
                ETHx
              </h5>
              {superTokenBalance && BigInt(superTokenBalance) > 0 ? (
                <button
                  className="mt-3 w-full bg-neon-green py-1 font-serif text-2xl"
                  onClick={handleWithdraw}
                >
                  {isWithdrawing ? "Witdrawing..." : "Withdraw Funds"}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
