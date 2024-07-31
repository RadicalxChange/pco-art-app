"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import Link from "next/link";
import { formatEther, isAddress, parseEther } from "viem";
import { Address, useAccount, useContractRead, useContractReads } from "wagmi";
import { readContract, waitForTransaction, writeContract } from "wagmi/actions";
import { useConnectModal } from "@rainbow-me/rainbowkit";

import { BranchIsWalletConnected } from "@/components/shared/branch-is-wallet-connected";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  allowlistFacetABI,
  englishPeriodicAuctionFacetABI,
  nativeStewardLicenseFacetABI,
  periodicPcoParamsFacetABI,
} from "@/lib/blockchain";
import { useHasRole } from "@/lib/hooks/use-access-control-facet";
import {
  ZERO_ADDRESS,
  calculateTimeString,
  formatDate,
  truncateStr,
} from "@/lib/utils";
import fetchJson from "@/lib/utils/fetch-json";

type TokenInfo = {
  name: string;
  description: string;
  image: string;
  external_link?: string;
  properties?: { legal_license?: string };
};

type HighestBid = {
  round: bigint;
  bidder: Address;
  bidAmount: bigint;
};

export default function TokenPage({
  params,
}: {
  params: { "token-address": string; "token-id": string };
}) {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [transferRecipient, setTransferRecipient] = useState<Address>();
  const [newBidAmount, setNewBidAmount] = useState<string>("");
  const [openDialogTransfer, setOpenDialogTransfer] = useState<boolean>(false);
  const [auctionCountdown, setAuctionCountdown] = useState<string>("");
  const [isTransferLoading, setIsTransferLoading] = useState<boolean>(false);
  const [isPlaceBidLoading, setIsPlaceBidLoading] = useState<boolean>(false);
  const [isAuctionCloseLoading, setIsAuctionCloseLoading] =
    useState<boolean>(false);
  const [isBidWithdrawLoading, setIsBidWithdrawLoading] =
    useState<boolean>(false);

  const tokenAddress = params["token-address"] as Address;
  const tokenId = BigInt(params["token-id"]);

  const tokenContract = {
    address: tokenAddress,
    abi: nativeStewardLicenseFacetABI,
  };
  const { openConnectModal } = useConnectModal();
  const account = useAccount();
  const {
    hasAllowlistRole,
    hasAuctionRole,
    hasBeneficiaryRole,
    hasAddTokenToCollectionRole,
    hasPcoParamsRole,
  } = useHasRole({
    tokenAddress,
    accountAddress: account.address,
  });
  const { data: maxTokenCount } = useContractRead({
    ...tokenContract,
    functionName: "maxTokenCount",
  });
  const { data: auctionStartTime } = useContractRead({
    address: tokenAddress,
    functionName: "auctionStartTime",
    abi: englishPeriodicAuctionFacetABI,
    args: [tokenId],
    watch: true,
  });
  const { data: auctionEndTime } = useContractRead({
    address: tokenAddress,
    functionName: "auctionEndTime",
    abi: englishPeriodicAuctionFacetABI,
    args: [tokenId],
    watch: true,
  });
  const { data: isAuctionPeriod } = useContractRead({
    address: tokenAddress,
    functionName: "isAuctionPeriod",
    abi: englishPeriodicAuctionFacetABI,
    args: [tokenId],
    watch: true,
  });
  const { data: currentAuctionRound } = useContractRead({
    address: tokenAddress,
    functionName: "currentAuctionRound",
    abi: englishPeriodicAuctionFacetABI,
    args: [tokenId],
    watch: true,
  });
  const { data: bidOfUser } = useContractRead({
    address: tokenAddress,
    functionName: "bidOf",
    abi: englishPeriodicAuctionFacetABI,
    args: [tokenId, currentAuctionRound ?? BigInt(0), account?.address ?? "0x"],
    watch: true,
    enabled:
      typeof currentAuctionRound === "bigint" && account?.address
        ? true
        : false,
  });
  const { data: highestBid } = useContractRead({
    address: tokenAddress,
    functionName: "highestBid",
    abi: englishPeriodicAuctionFacetABI,
    args: [tokenId, currentAuctionRound ?? BigInt(0)],
    watch: true,
    enabled: typeof currentAuctionRound === "bigint",
  });
  const { data: availableCollateral } = useContractRead({
    address: tokenAddress,
    functionName: "availableCollateral",
    abi: englishPeriodicAuctionFacetABI,
    args: [account?.address ?? "0x"],
    watch: true,
    enabled: account?.address ? true : false,
  });
  const { data: lockedCollateral } = useContractRead({
    address: tokenAddress,
    functionName: "lockedCollateral",
    abi: englishPeriodicAuctionFacetABI,
    args: [tokenId, account?.address ?? "0x"],
    watch: true,
    enabled: account?.address ? true : false,
  });
  const { data } = useContractReads({
    contracts: [
      {
        ...tokenContract,
        functionName: "tokenURI",
        args: [tokenId],
      },
      {
        ...tokenContract,
        functionName: "ownerOf",
        args: [tokenId],
      },
      {
        ...tokenContract,
        abi: englishPeriodicAuctionFacetABI,
        functionName: "bidExtensionSeconds",
      },
      {
        ...tokenContract,
        abi: englishPeriodicAuctionFacetABI,
        functionName: "bidExtensionWindowLengthSeconds",
      },
      {
        ...tokenContract,
        abi: englishPeriodicAuctionFacetABI,
        functionName: "startingBid",
      },
      {
        ...tokenContract,
        abi: englishPeriodicAuctionFacetABI,
        functionName: "minBidIncrement",
      },
      {
        ...tokenContract,
        abi: periodicPcoParamsFacetABI,
        functionName: "licensePeriod",
      },
      {
        ...tokenContract,
        abi: periodicPcoParamsFacetABI,
        functionName: "feeNumerator",
      },
      {
        ...tokenContract,
        abi: periodicPcoParamsFacetABI,
        functionName: "feeDenominator",
      },
      {
        ...tokenContract,
        abi: allowlistFacetABI,
        functionName: "isAllowed",
        args: [account?.address as Address],
      },
      { ...tokenContract, functionName: "minter" },
      {
        ...tokenContract,
        abi: englishPeriodicAuctionFacetABI,
        functionName: "highestBid",
        args: [
          tokenId,
          currentAuctionRound && currentAuctionRound > 0
            ? currentAuctionRound - BigInt(1)
            : BigInt(0),
        ],
      },
    ],
  });

  const tokenUri =
    data && data[0].status === "success" ? (data[0].result as string) : null;
  const currentSteward =
    data && data[1].status === "success" ? (data[1].result as string) : null;
  const bidExtensionSeconds =
    data && data[2].status === "success" ? data[2].result : null;
  const bidExtensionWindowLengthSeconds =
    data && data[3].status === "success" ? data[3].result : null;
  const startingBidAmount =
    data && data[4].status === "success" ? data[4].result : null;
  const minBidIncrement =
    data && data[5].status === "success" ? data[5].result : null;
  const licensePeriod =
    data && data[6].status === "success" ? data[6].result : null;
  const perSecondFeeNumerator =
    data && data[7].status === "success" ? data[7].result : null;
  const perSecondFeeDenominator =
    data && data[8].status === "success" ? data[8].result : null;
  const isAllowed =
    data && data[9].status === "success" ? data[9].result : null;
  const artist = data && data[10].status === "success" ? data[10].result : null;
  const previousWinningBid =
    data && data[11].status === "success" ? data[11].result : null;
  const isAuctionStarted =
    auctionStartTime && auctionEndTime && auctionStartTime < Date.now() / 1000;
  const isAuctionFinished =
    auctionStartTime && auctionEndTime && auctionEndTime < Date.now() / 1000;
  const isNewBidLessThanMinBid =
    newBidAmount &&
    startingBidAmount &&
    (!account.address ||
      Number.isNaN(Number(newBidAmount)) ||
      parseEther(newBidAmount as `${number}`) < startingBidAmount);
  const isNewBidLessThanMinIncrement =
    newBidAmount &&
    highestBid &&
    minBidIncrement &&
    highestBid.bidAmount > 0 &&
    (!account.address ||
      Number.isNaN(Number(newBidAmount)) ||
      parseEther(newBidAmount as `${number}`) - highestBid.bidAmount <
        minBidIncrement);

  useEffect(() => {
    if (!tokenUri) {
      return;
    }

    (async () => {
      const tokenInfo: TokenInfo = await fetchJson(
        `https://w3s.link/ipfs/${tokenUri.replace("ipfs://", "")}`
      );

      setTokenInfo(tokenInfo);
    })();
  }, [tokenUri]);

  useEffect(() => {
    let timerId: NodeJS.Timer;

    if (auctionEndTime === null || !isAuctionStarted || isAuctionFinished) {
      return;
    }

    timerId = setInterval(
      () =>
        setAuctionCountdown(
          calculateTimeString(Number(auctionEndTime) * 1000 - Date.now())
        ),
      900
    );

    return () => clearInterval(timerId);
  }, [auctionEndTime, isAuctionStarted]);

  const handleTokenTransfer = async () => {
    if (!account) {
      return;
    }

    try {
      setIsTransferLoading(true);

      const { hash } = await writeContract({
        address: tokenAddress,
        abi: nativeStewardLicenseFacetABI,
        functionName: "transferFrom",
        args: [
          account.address as Address,
          transferRecipient as Address,
          tokenId,
        ],
        value: BigInt(0),
      });

      setOpenDialogTransfer(false);
      setIsTransferLoading(false);
    } catch (err) {
      console.error(err);
      setIsTransferLoading(false);
    }
  };

  const handlePlaceBid = async () => {
    if (!account || !newBidAmount) {
      return;
    }

    setIsPlaceBidLoading(true);

    try {
      const owner = currentSteward ?? artist;
      const amount = parseEther(newBidAmount as `${number}`);
      const existingCollateral = bidOfUser
        ? bidOfUser.collateralAmount
        : BigInt(0);
      const fee = await readContract({
        address: tokenAddress,
        abi: englishPeriodicAuctionFacetABI,
        functionName: "calculateFeeFromBid",
        args: [amount],
      });
      const { hash } = await writeContract({
        address: tokenAddress,
        abi: englishPeriodicAuctionFacetABI,
        functionName: "placeBid",
        args: [tokenId, amount],
        value:
          account.address === owner
            ? fee - existingCollateral
            : amount + fee - existingCollateral,
      });
      await waitForTransaction({ hash });

      setIsPlaceBidLoading(false);
      setNewBidAmount("");
    } catch (err) {
      console.error(err);
      setIsPlaceBidLoading(false);
    }
  };

  const handleCancelBid = async () => {
    if (!account || typeof currentAuctionRound !== "bigint") {
      return;
    }

    setIsBidWithdrawLoading(true);

    try {
      const { hash } = await writeContract({
        address: tokenAddress,
        abi: englishPeriodicAuctionFacetABI,
        functionName: "cancelBidAndWithdrawCollateral",
        args: [tokenId, currentAuctionRound],
      });
      await waitForTransaction({ hash });

      setIsBidWithdrawLoading(false);
    } catch (err) {
      console.error(err);
      setIsBidWithdrawLoading(false);
    }
  };

  const handleCancelAllBids = async () => {
    if (!account) {
      return;
    }

    setIsBidWithdrawLoading(true);

    try {
      const { hash } = await writeContract({
        address: tokenAddress,
        abi: englishPeriodicAuctionFacetABI,
        functionName: "cancelAllBidsAndWithdrawCollateral",
        args: [tokenId],
      });
      await waitForTransaction({ hash });

      setIsBidWithdrawLoading(false);
    } catch (err) {
      console.error(err);
      setIsBidWithdrawLoading(false);
    }
  };

  const handleWithdrawCollateral = async () => {
    if (!account || currentAuctionRound === null) {
      return;
    }

    setIsBidWithdrawLoading(true);

    try {
      const { hash } = await writeContract({
        address: tokenAddress,
        abi: englishPeriodicAuctionFacetABI,
        functionName: "withdrawCollateral",
      });

      await waitForTransaction({ hash });

      setIsBidWithdrawLoading(false);
    } catch (err) {
      console.error(err);
      setIsBidWithdrawLoading(false);
    }
  };

  const handleCloseAuction = async () => {
    if (!account) {
      return;
    }

    setIsAuctionCloseLoading(true);

    try {
      const { hash } = await writeContract({
        address: tokenAddress,
        abi: englishPeriodicAuctionFacetABI,
        functionName: "closeAuction",
        args: [tokenId],
      });
      await waitForTransaction({ hash });

      setIsAuctionCloseLoading(false);
    } catch (err) {
      console.error(err);
      setIsAuctionCloseLoading(false);
    }
  };

  const bidInfoView = (
    <div className="flex grow gap-3 bg-[#d9d9d9] p-3">
      <div className="flex flex-col w-2/4">
        <span>{isAuctionFinished ? "Winning Bid" : "Top Bid"}</span>
        {highestBid && highestBid.bidAmount > 0 ? (
          <div className="mt-2 font-serif text-4xl xl:text-[48px] 2xl:text-[80px] break-words text-wrap">
            <span>{formatEther(highestBid.bidAmount).slice(0, 6)}</span>
            {highestBid && highestBid.bidAmount > 0 && (
              <span className="hidden 2xl:inline-block text-2xl 2xl:text-[40px]">
                ETH
              </span>
            )}
          </div>
        ) : (
          <span className="font-serif text-4xl xl:text-[40px] 2xl:text-[48px]">
            No Bid Received
          </span>
        )}
      </div>
      <div className="flex flex-col justify-between w-2/4">
        <div>
          Honorarium
          <p className="font-serif text-2xl">
            {highestBid &&
            highestBid.bidAmount > 0 &&
            perSecondFeeNumerator &&
            perSecondFeeDenominator &&
            licensePeriod
              ? formatEther(
                  (highestBid.bidAmount * perSecondFeeNumerator) /
                    perSecondFeeDenominator
                ).slice(0, 12)
              : "N/A"}
          </p>
        </div>
        <div>
          {isAuctionFinished ? "New Steward" : "Bidder"}
          <p className="font-serif text-2xl">
            {highestBid && highestBid.bidder !== ZERO_ADDRESS
              ? truncateStr(highestBid.bidder, 12)
              : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );

  const userCollateralView = (
    <>
      <div className="mt-2 p-3 sm:p-0">
        <p>Locked Collateral</p>
        <p className="font-serif text-2xl">
          {lockedCollateral && lockedCollateral > 0
            ? formatEther(lockedCollateral).slice(0, 12)
            : 0}{" "}
          ETH
        </p>
      </div>
      <div className="mt-2 p-3 sm:p-0">
        <p>Available Collateral: </p>
        <p className="font-serif text-2xl">
          {availableCollateral && availableCollateral > 0
            ? formatEther(availableCollateral).slice(0, 12)
            : 0}{" "}
          ETH
        </p>
      </div>
    </>
  );

  const cancelBidButton = (
    <button
      className="flex items-center gap-2 bg-neon-red px-3 py-1 font-serif text-2xl disabled:opacity-50"
      disabled={isPlaceBidLoading}
      onClick={() => {
        if (
          bidOfUser &&
          lockedCollateral &&
          bidOfUser.collateralAmount < lockedCollateral
        ) {
          handleCancelAllBids();
        } else {
          handleCancelBid();
        }
      }}
    >
      <Image src="/back-arrow.svg" alt="Cancel" width={15} height={15} />
      {isBidWithdrawLoading ? "Canceling..." : "Cancel Bid & Withdraw"}
    </button>
  );

  const withdrawCollateralButton = (
    <button
      className="flex items-center gap-2 bg-neon-red px-3 py-1 font-serif text-2xl"
      onClick={handleWithdrawCollateral}
    >
      <Image src="/back-arrow.svg" alt="Reclaim" width={15} height={15} />
      {isBidWithdrawLoading ? "Reclaiming..." : "Reclaim Collateral"}
    </button>
  );

  if (!maxTokenCount || tokenId >= maxTokenCount) {
    return (
      <div className="flex flex-col flex-center mt-32">
        <h3 className="mb-2 text-9xl font-bold">NFT doesn't exists!</h3>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-mono text-6xl sm:text-[75px] xl:text-[100px] 2xl:text-[160px] text-center leading-none mt-12 sm:mt-16 xl:mt-20 2xl:mt-24 min-[2000px]:mt-32">
        {tokenInfo?.name}
      </h1>
      <h2 className="font-mono text-3xl text-center leading-none">
        TESTNET COLLECTION - For testing purposes only
      </h2>
      <div className="flex flex-col items-center max-w-[320px] sm:max-w-[750px] xl:max-w-[1100px] 2xl:max-w-[1500px] m-auto">
        <div className="w-[320px] sm:w-[600px] xl:w-[750px] 2xl:w-[1200px] mt-10 sm:mt-16 xl:mt-20 2xl:mt-24 text-lg sm:text-xl">
          <div className="flex flex-col justify-center gap-5 lg:flex-row mb-16 sm:mb-24 sm:pl-3">
            <img
              src={
                tokenInfo?.image
                  ? `https://w3s.link/ipfs/${tokenInfo.image.replace(
                      "ipfs://",
                      ""
                    )}`
                  : "/placeholder-image.svg"
              }
              alt="image"
              className="w-full lg:w-[400px] xl:w-[500px] 2xl:w-[800px] lg:h-[400px] xl:h-[500px] 2xl:h-[800px]"
            />
            <div className="flex flex-col w-full lg:w-1/3">
              <span>Artist</span>
              <span className="font-serif text-2xl">
                {artist ? truncateStr(artist, 12) : "N/A"}
              </span>
              <span className="mt-6">Current Steward</span>
              <span className="font-serif text-2xl">
                {currentSteward ? truncateStr(currentSteward, 12) : "N/A"}
              </span>
              <Link
                href={`/token/${tokenAddress}/creator-circle`}
                className="mt-6 underline"
              >
                Creator Circle
              </Link>
              <span className="mt-6 font-serif text-2xl">
                {tokenInfo?.description}
              </span>
            </div>
          </div>
          {account?.address === currentSteward &&
          (!isAuctionStarted || isAuctionFinished) &&
          !isAuctionPeriod ? (
            <>
              <div className="flex flex-col sm:flex-row mb-10">
                <span className="sm:w-2/4 2xl:w-1/3 sm:pl-3">
                  TokenID in Collection
                </span>
                <div className="flex flex-col sm:w-2/4 2xl:w-2/3">
                  <span className="font-serif text-2xl border-b border-black">
                    {tokenId.toString()}
                  </span>
                  <Dialog
                    open={openDialogTransfer}
                    onOpenChange={setOpenDialogTransfer}
                  >
                    <DialogTrigger asChild>
                      <button className="w-full text-start bg-neon-green px-2 py-1 font-serif text-2xl">
                        Transfer Token
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogTitle className="m-0">Transfer</DialogTitle>
                      <DialogDescription className="mb-5">
                        Input the address you want to transfer the token to.
                      </DialogDescription>
                      <fieldset className="flex items-center gap-3">
                        <label className="text-lg">Address</label>
                        <input
                          className="w-full bg-transparent border-solid border-0 border-b border-black focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD] mr-5 p-0 py-1"
                          placeholder="0x..."
                          value={transferRecipient}
                          onChange={(e) =>
                            setTransferRecipient(e.target.value as Address)
                          }
                        />
                      </fieldset>
                      {transferRecipient && !isAddress(transferRecipient) ? (
                        <span className="flex justify-end text-neon-red">
                          Not a valid address
                        </span>
                      ) : null}
                      <div className="mt-6 flex justify-end">
                        <button
                          className="w-full bg-neon-green font-serif text-xl px-2 py-1"
                          onClick={handleTokenTransfer}
                        >
                          {isTransferLoading ? (
                            <span className="lds-dual-ring" />
                          ) : (
                            "Send"
                          )}
                        </button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </>
          ) : null}
          <div className="flex flex-col">
            <div className="flex flex-col sm:flex-row justify-center">
              <span className="sm:w-2/4 2xl:w-1/3 mb-2 sm:mb-0 sm:pl-3">
                Stewardship Details
              </span>
              <div className="sm:w-2/4 2xl:w-2/3">
                <div>
                  <span>Last Valuation: </span>
                  <span className="font-serif text-2xl">
                    {currentAuctionRound &&
                    currentAuctionRound > 0 &&
                    previousWinningBid?.bidAmount
                      ? formatEther(previousWinningBid.bidAmount)
                      : 0}{" "}
                    ETH
                  </span>
                </div>
                <div>
                  <span>Stewardship Cycle: </span>
                  <span className="font-serif text-2xl">
                    {parseFloat(
                      (Number(licensePeriod) / 60 / 60 / 24).toFixed(4)
                    )}{" "}
                    Days
                  </span>
                </div>
                <div>
                  <span>Honorarium Rate: </span>
                  <span className="font-serif text-2xl">
                    {perSecondFeeDenominator && perSecondFeeNumerator
                      ? (
                          (Number(perSecondFeeNumerator) * 100) /
                          Number(perSecondFeeDenominator)
                        )
                          .toString()
                          .slice(0, 5)
                      : 0}
                    %
                  </span>
                </div>
                {tokenInfo?.properties?.legal_license ? (
                  <Link
                    target="_blank"
                    href={
                      tokenInfo.properties.legal_license.startsWith("ipfs")
                        ? `https://w3s.link/ipfs/${tokenInfo.properties.legal_license.replace(
                            "ipfs://",
                            ""
                          )}`
                        : tokenInfo?.properties?.legal_license
                    }
                    className="font-serif text-2xl underline"
                  >
                    Legal License
                  </Link>
                ) : null}
              </div>
            </div>
            {(!isAuctionPeriod && hasPcoParamsRole) ||
            hasBeneficiaryRole ||
            hasAuctionRole ||
            hasAllowlistRole ||
            hasAddTokenToCollectionRole ? (
              <div className="flex flex-col sm:flex-row mt-10">
                <span className="sm:w-2/4 2xl:w-1/3 mb-4 sm:mb-0 sm:pl-3">
                  Token Configuration
                </span>
                <div className="flex flex-col gap-2 sm:w-2/4 2xl:w-2/3">
                  {hasPcoParamsRole ? (
                    <Link href={`/token/${tokenAddress}/update/pco-settings`}>
                      <button className="flex item-center gap-3 w-full bg-neon-green text-start px-2 py-1 font-serif text-2xl">
                        <Image
                          src="/forward-arrow.svg"
                          alt="Forward"
                          width={15}
                          height={15}
                        />
                        PCO Settings
                      </button>
                    </Link>
                  ) : null}
                  {hasBeneficiaryRole ? (
                    <Link href={`/token/${tokenAddress}/update/creator-circle`}>
                      <button className="flex item-center gap-3 w-full bg-neon-green text-start px-2 py-1 font-serif text-2xl">
                        <Image
                          src="/forward-arrow.svg"
                          alt="Forward"
                          width={15}
                          height={15}
                        />
                        Creator Circle
                      </button>
                    </Link>
                  ) : null}
                  {hasAuctionRole ? (
                    <Link href={`/token/${tokenAddress}/update/auction-pitch`}>
                      <button className="flex item-center gap-3 w-full bg-neon-green text-start px-2 py-1 font-serif text-2xl">
                        <Image
                          src="/forward-arrow.svg"
                          alt="Forward"
                          width={15}
                          height={15}
                        />
                        Stewardship Inauguration
                      </button>
                    </Link>
                  ) : null}
                  {hasAllowlistRole ? (
                    <Link href={`/token/${tokenAddress}/update/eligibility`}>
                      <button className="flex item-center gap-3 w-full bg-neon-green text-start px-2 py-1 font-serif text-2xl">
                        <Image
                          src="/forward-arrow.svg"
                          alt="Forward"
                          width={15}
                          height={15}
                        />
                        Eligibility
                      </button>
                    </Link>
                  ) : null}
                  {hasAddTokenToCollectionRole ? (
                    <Link href={`/token/${tokenAddress}/update/add-token`}>
                      <button className="flex item-center gap-3 w-full bg-neon-green text-start px-2 py-1 font-serif text-2xl">
                        <Image
                          src="/forward-arrow.svg"
                          alt="Forward"
                          width={15}
                          height={15}
                        />
                        Add Tokens
                      </button>
                    </Link>
                  ) : null}
                  <Link href={`/token/${tokenAddress}/update/permissions`}>
                    <button className="flex item-center gap-3 w-full bg-neon-green text-start px-2 py-1 font-serif text-2xl">
                      <Image
                        src="/forward-arrow.svg"
                        alt="Forward"
                        width={15}
                        height={15}
                      />
                      Permissions
                    </button>
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex flex-col mt-12 mb-24 xl:mb-32">
        {isAuctionPeriod && isAuctionFinished ? (
          <>
            <div className="w-full bg-neon-green py-1 text-lg sm:text-xl">
              <div className="flex flex-col sm:flex-row items-center w-full sm:w-[600px] xl:w-[750px] 2xl:w-[1200px] m-auto">
                <span className="sm:w-2/4 2xl:w-1/3 pl-1 sm:pl-3">
                  Stewardship Inauguration
                </span>
                <span className="font-serif text-2xl sm:w-2/4 2xl:w-2/3 pl-1 sm:pl-3">
                  {calculateTimeString(
                    Number(auctionEndTime) * 1000 - Date.now()
                  )}
                </span>
              </div>
            </div>
            <div className="flex w-full items-center sm:w-[600px] xl:w-[750px] 2xl:w-[1200px] m-auto">
              <div className="flex flex-col w-full sm:w-2/4 2xl:w-2/3 ml-auto">
                {bidInfoView}
                {(availableCollateral && availableCollateral > 0) ||
                (lockedCollateral && lockedCollateral > 0)
                  ? userCollateralView
                  : null}
                {bidOfUser &&
                lockedCollateral &&
                highestBid &&
                (highestBid.bidAmount === BigInt(0) ||
                  bidOfUser.bidAmount < highestBid.bidAmount) &&
                lockedCollateral > 0
                  ? cancelBidButton
                  : availableCollateral && availableCollateral > 0
                  ? withdrawCollateralButton
                  : null}
                <BranchIsWalletConnected>
                  <button
                    className="flex items-center gap-2 bg-neon-green px-3 py-1 font-serif text-2xl"
                    disabled={isAuctionCloseLoading}
                    onClick={handleCloseAuction}
                  >
                    <Image
                      src="/forward-arrow.svg"
                      alt="Forward"
                      width={15}
                      height={15}
                    />
                    {isAuctionCloseLoading &&
                    artist === account.address &&
                    highestBid?.bidAmount === BigInt(0)
                      ? "Repossessing..."
                      : isAuctionCloseLoading
                      ? "Closing..."
                      : artist === account.address &&
                        highestBid?.bidAmount === BigInt(0)
                      ? "Repossess Token"
                      : "Complete Auction"}
                  </button>
                  <button
                    className="flex items-center gap-2 bg-neon-green px-3 py-1 font-serif text-2xl"
                    onClick={openConnectModal}
                  >
                    <Image
                      src="/forward-arrow.svg"
                      alt="Forward"
                      width={15}
                      height={15}
                    />
                    Connect
                  </button>
                </BranchIsWalletConnected>
              </div>
            </div>
          </>
        ) : isAuctionPeriod && isAuctionStarted ? (
          <>
            <div className="w-full bg-neon-green py-1 text-lg sm:text-xl">
              <div className="flex flex-col sm:flex-row items-center w-full sm:w-[600px] xl:w-[750px] 2xl:w-[1200px] m-auto">
                <span className="sm:w-2/4 2xl:w-1/3 pl-1 sm:pl-3">
                  Stewardship Inauguration
                </span>
                <div className="flex items-center gap-2 sm:w-2/4 2xl:w-2/3">
                  <span className="pl-1 sm:pl-3 font-serif text-2xl">
                    {auctionCountdown}
                  </span>
                  {bidExtensionWindowLengthSeconds && bidExtensionSeconds ? (
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger>
                        <Image
                          src="/info.svg"
                          alt="Info"
                          width={20}
                          height={20}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[200px] text-center">
                        <span className="">
                          Bids placed in the final{" "}
                          {Number(bidExtensionWindowLengthSeconds) / 60} minutes
                          will extend the auction{" "}
                          {Number(bidExtensionSeconds) / 60} minutes.
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row w-full sm:w-[600px] xl:w-[750px] 2xl:w-[1200px] m-auto text-xl">
              <>
                {!isAllowed ? (
                  <div className="flex flex-col grow w-full bg-neon-red sm:w-2/4 2xl:w-1/3 p-3">
                    Status
                    <span className="mt-2 font-serif text-4xl text-[48px] ">
                      You're not on the auction allowlist
                    </span>
                  </div>
                ) : bidOfUser &&
                  highestBid &&
                  bidOfUser.bidAmount > 0 &&
                  bidOfUser.bidAmount < highestBid.bidAmount ? (
                  <div className="flex flex-col grow w-full bg-neon-red sm:w-2/4 2xl:w-1/3 p-3">
                    Status
                    <span className="mt-2 font-serif text-[48px]">
                      You've Been Outbid!
                    </span>
                  </div>
                ) : bidOfUser &&
                  highestBid &&
                  bidOfUser.bidder === account.address &&
                  bidOfUser.bidAmount === highestBid.bidAmount ? (
                  <div className="flex flex-col grow w-full bg-neon-green sm:w-2/4 2xl:w-1/3 p-3">
                    Status
                    <span className="mt-2 font-serif text-[48px]">
                      You're The Top Bidder!
                    </span>
                  </div>
                ) : null}
              </>
              <div className="flex flex-col w-full sm:w-2/4 2xl:w-2/3 ml-auto">
                {bidInfoView}
              </div>
            </div>
            {(availableCollateral && availableCollateral > 0) ||
            (lockedCollateral && lockedCollateral > 0) ? (
              <div className="flex w-full sm:w-[600px] xl:w-[750px] 2xl:w-[1200px] m-auto text-xl">
                <div className="flex flex-col w-full sm:w-2/4 2xl:w-2/3 ml-auto p-3">
                  {userCollateralView}
                </div>
              </div>
            ) : null}
            <div className="flex w-full sm:w-[600px] xl:w-[750px] 2xl:w-[1200px] m-auto text-xl">
              <div className="flex flex-col w-full sm:w-2/4 2xl:w-2/3 bg-[#d9d9d9] ml-auto p-3">
                <fieldset className="flex flex-col">
                  <label style={{ color: !isAllowed ? "#888888" : "" }}>
                    Bid
                  </label>
                  <input
                    disabled={!isAllowed}
                    placeholder={`Must be at least ${
                      highestBid?.bidAmount && minBidIncrement
                        ? formatEther(highestBid.bidAmount + minBidIncrement)
                        : startingBidAmount
                        ? formatEther(startingBidAmount)
                        : "0"
                    }`}
                    value={newBidAmount}
                    onChange={(e) => setNewBidAmount(e.target.value)}
                    className="bg-transparent border-solid border-0 border-b border-black focus:outline-none focus:ring-0 focus:border-black font-serif text-2xl placeholder-[#ADADAD] p-0 pb-1"
                  />
                </fieldset>
                <fieldset className="flex flex-col mt-6">
                  <label style={{ color: !isAllowed ? "#888888" : "" }}>
                    Honorarium
                  </label>
                  <input
                    disabled
                    className="bg-transparent border-solid border-0 border-b border-black focus:outline-none focus:ring-0 focus:border-black font-serif text-2xl placeholder-[#ADADAD] p-0 pb-1"
                    value={
                      !isNewBidLessThanMinBid &&
                      !isNewBidLessThanMinIncrement &&
                      newBidAmount &&
                      !Number.isNaN(Number(newBidAmount)) &&
                      perSecondFeeNumerator &&
                      perSecondFeeDenominator
                        ? formatEther(
                            (parseEther(newBidAmount as `${number}`) *
                              perSecondFeeNumerator) /
                              perSecondFeeDenominator
                          ).slice(0, 12)
                        : ""
                    }
                    placeholder={`${
                      perSecondFeeDenominator && perSecondFeeNumerator
                        ? (
                            (Number(perSecondFeeNumerator) * 100) /
                            Number(perSecondFeeDenominator)
                          )
                            .toString()
                            .slice(0, 5)
                        : 0
                    }% of your bid`}
                    readOnly
                  />
                </fieldset>
                <fieldset className="flex flex-col mt-6">
                  <label style={{ color: !isAllowed ? "#888888" : "" }}>
                    Total
                  </label>
                  <input
                    disabled
                    className="bg-transparent border-solid border-0 border-b border-black focus:outline-none focus:ring-0 focus:border-black font-serif text-2xl placeholder-[#ADADAD] p-0 pb-1"
                    value={
                      !isNewBidLessThanMinBid &&
                      !isNewBidLessThanMinIncrement &&
                      newBidAmount &&
                      !Number.isNaN(Number(newBidAmount)) &&
                      perSecondFeeNumerator &&
                      perSecondFeeDenominator
                        ? formatEther(
                            parseEther(newBidAmount as `${number}`) +
                              (parseEther(newBidAmount as `${number}`) *
                                perSecondFeeNumerator) /
                                perSecondFeeDenominator
                          ).slice(0, 12)
                        : ""
                    }
                    readOnly
                    placeholder="Bid Value + Honorarium"
                  />
                </fieldset>
              </div>
            </div>
            <div className="flex w-full sm:w-[600px] xl:w-[750px] 2xl:w-[1200px] m-auto text-xl">
              <div className="flex flex-col w-full sm:w-2/4 2xl:w-2/3 ml-auto">
                {bidOfUser &&
                highestBid &&
                (highestBid.bidAmount === BigInt(0) ||
                  bidOfUser.bidAmount < highestBid.bidAmount) &&
                lockedCollateral &&
                lockedCollateral > 0
                  ? cancelBidButton
                  : availableCollateral && availableCollateral > 0
                  ? withdrawCollateralButton
                  : null}
                <button
                  className="flex gap-3 w-full bg-neon-green font-serif text-2xl px-3 py-1 disabled:opacity-50"
                  onClick={account?.address ? handlePlaceBid : openConnectModal}
                  disabled={
                    !!account.address &&
                    (!newBidAmount ||
                      isNewBidLessThanMinBid ||
                      isNewBidLessThanMinIncrement)
                      ? true
                      : false
                  }
                >
                  <Image
                    src="/forward-arrow.svg"
                    alt="Forward"
                    width={15}
                    height={15}
                  />
                  {!account?.address
                    ? "Connect"
                    : isPlaceBidLoading
                    ? "Bidding..."
                    : "Update Bid"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col sm:flex-row items-center sm:items-start w-full sm:w-[600px] xl:w-[750px] 2xl:w-[1200px] m-auto text-lg sm:text-xl">
            <span className="sm:w-2/4 2xl:w-1/3 sm:pl-3">
              Next Stewardship Inauguration
            </span>
            <div className="flex flex-col items-center sm:items-start sm:w-2/4 2xl:w-2/3">
              <span>English Auction [Extending]</span>
              <div className="mt-1 px-3 sm:px-0">
                Start:{" "}
                <span className="font-serif text-2xl">
                  {formatDate(Number(auctionStartTime) * 1000)} -{" "}
                </span>
              </div>
              <div className="mt-1 px-3 sm:px-0">
                Close:{" "}
                <span className="font-serif text-2xl">
                  {formatDate(Number(auctionEndTime) * 1000)} -{" "}
                </span>
              </div>
              <div className="mt-6 flex flex-col">
                {(availableCollateral && availableCollateral > 0) ||
                (lockedCollateral && lockedCollateral > 0) ? (
                  <div className="pb-3 border-b border-black">
                    {userCollateralView}
                  </div>
                ) : null}
                {lockedCollateral && lockedCollateral > 0
                  ? cancelBidButton
                  : availableCollateral && availableCollateral > 0
                  ? withdrawCollateralButton
                  : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
