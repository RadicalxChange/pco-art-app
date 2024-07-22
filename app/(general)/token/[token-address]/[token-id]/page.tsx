"use client";
import { useEffect, useState } from "react";

import Link from "next/link";
import { BiInfoCircle } from "react-icons/bi";
import { formatEther, isAddress, parseEther } from "viem";
import { Address, useAccount, useContractRead, useContractReads } from "wagmi";
import { readContract, waitForTransaction, writeContract } from "wagmi/actions";

import { WalletConnect } from "@/components/blockchain/wallet-connect";
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
    <div className="mt-5 flex h-[128px] flex-col justify-center gap-3 rounded-xl bg-gray-300 px-16 text-lg font-medium dark:bg-black">
      <span>
        {isAuctionFinished ? "Winning Bid" : "Top Bid"} :{" "}
        {highestBid && highestBid.bidAmount > 0
          ? formatEther(highestBid.bidAmount)
          : "No Bid Received"}
      </span>
      <span>
        Honorarium:{" "}
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
      </span>
      <span>
        {isAuctionFinished ? "New Steward" : "Bidder"}:{" "}
        {highestBid && highestBid.bidder !== ZERO_ADDRESS
          ? truncateStr(highestBid.bidder, 12)
          : "N/A"}
      </span>
    </div>
  );

  const userCollateralView = (
    <>
      <p className="font-bold">
        Locked Collateral:{" "}
        {lockedCollateral && lockedCollateral > 0
          ? formatEther(lockedCollateral).slice(0, 12)
          : 0}{" "}
        ETH
      </p>
      <p className="font-bold">
        Available Collateral:{" "}
        {availableCollateral && availableCollateral > 0
          ? formatEther(availableCollateral).slice(0, 12)
          : 0}{" "}
        ETH
      </p>
    </>
  );

  const cancelBidButton = (
    <button
      className="mt-2 w-80 rounded-full bg-red-400 px-1 py-2 font-medium hover:bg-red-500 lg:w-3/6"
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
      style={{
        pointerEvents: isPlaceBidLoading ? "none" : "auto",
        opacity: isPlaceBidLoading ? 0.6 : 1,
      }}
    >
      {isBidWithdrawLoading ? (
        <span className="lds-dual-ring" />
      ) : (
        "Cancel Bid & Withdraw"
      )}
    </button>
  );

  const withdrawCollateralButton = (
    <button
      className="mt-2 w-80 rounded-full bg-red-400 px-1 py-2 font-medium hover:bg-red-500 lg:w-3/6"
      onClick={handleWithdrawCollateral}
    >
      {isBidWithdrawLoading ? (
        <span className="lds-dual-ring" />
      ) : (
        "Withdraw Collateral"
      )}
    </button>
  );

  if (!maxTokenCount || tokenId >= maxTokenCount) {
    return <>NFT doesn't exists</>;
  }

  return (
    <div className="flex h-full flex-col sm:w-2/3">
      <div className="flex flex-col justify-center gap-5 sm:flex-row">
        <figure className="mb-20 flex h-80 w-80 flex-col justify-between sm:h-96 sm:w-96">
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
          />
          <figcaption className="text-ellipsis break-words">
            {tokenInfo?.image}
          </figcaption>
        </figure>
        <div className="flex flex-col">
          <span className="m-auto mt-5 text-2xl font-bold sm:m-0">
            {tokenInfo?.name}
          </span>
          <span className="mt-2 text-lg">
            Artist: {artist ? truncateStr(artist, 12) : "N/A"}
          </span>
          <span className="mt-2 text-lg">
            Current Steward:{" "}
            {currentSteward ? truncateStr(currentSteward, 12) : "N/A"}
          </span>
          <Link
            href={`/token/${tokenAddress}/creator-circle`}
            className="mt-2 underline"
          >
            Creator Circle
          </Link>
          <span className="mt-5 text-lg">{tokenInfo?.description}</span>
        </div>
      </div>
      {account?.address === currentSteward &&
      (!isAuctionStarted || isAuctionFinished) &&
      !isAuctionPeriod ? (
        <Dialog open={openDialogTransfer} onOpenChange={setOpenDialogTransfer}>
          <DialogTrigger asChild>
            <div className="m-auto mb-5 flex justify-end">
              <button className="w-40 rounded-full bg-blue-700 py-2 text-xl font-bold">
                Transfer
              </button>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle className="m-0 text-xl">Transfer</DialogTitle>
            <DialogDescription className="mb-5">
              Input the address you want to transfer the token to.
            </DialogDescription>
            <fieldset className="flex items-center gap-5">
              <label className="w-[90px] text-right text-[15px]">Address</label>
              <input
                className="inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-md px-[10px] text-[15px]"
                placeholder="0x..."
                value={transferRecipient}
                onChange={(e) =>
                  setTransferRecipient(e.target.value as Address)
                }
              />
            </fieldset>
            {transferRecipient && !isAddress(transferRecipient) ? (
              <span className="mt-2 flex justify-end text-red-500">
                Not a valid address
              </span>
            ) : null}
            <div className="mt-6 flex justify-end">
              <button
                className="inline-flex h-[35px] items-center justify-center rounded-full bg-green-500 px-8 font-medium hover:bg-green-600"
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
      ) : null}
      <div className="flex flex-col justify-between lg:flex-row">
        <div className="flex flex-col text-lg">
          <span className="mb-3 text-2xl font-bold">Stewardship Details</span>
          <span className="mb-1 text-lg">
            Last Valuation:{" "}
            {currentAuctionRound &&
            currentAuctionRound > 0 &&
            previousWinningBid?.bidAmount
              ? formatEther(previousWinningBid.bidAmount)
              : 0}{" "}
            ETH
          </span>
          <span className="mb-1 text-lg">
            Stewardship Cycle:{" "}
            {parseFloat((Number(licensePeriod) / 60 / 60 / 24).toFixed(4))} Days
          </span>
          <span className="mb-1 text-lg">
            Honorarium Rate:{" "}
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
              className="text-lg underline"
            >
              Legal License
            </Link>
          ) : null}
        </div>
        {!isAuctionPeriod &&
        (hasPcoParamsRole ||
          hasBeneficiaryRole ||
          hasAuctionRole ||
          hasAllowlistRole ||
          hasAddTokenToCollectionRole) ? (
          <div className="flex flex-col text-lg">
            <span className="mb-3 text-2xl font-bold">Token Configuration</span>
            <div className="grid grid-cols-2 grid-rows-2 gap-4">
              {hasPcoParamsRole ? (
                <Link href={`/token/${tokenAddress}/update/pco-settings`}>
                  <button className="w-40 rounded-full bg-sky-500 px-4 py-2 hover:bg-sky-600">
                    PCO Settings
                  </button>
                </Link>
              ) : null}
              {hasBeneficiaryRole ? (
                <Link href={`/token/${tokenAddress}/update/creator-circle`}>
                  <button className="w-40 rounded-full bg-sky-500 px-4 py-2 hover:bg-sky-600">
                    Creator Circle
                  </button>
                </Link>
              ) : null}
              {hasAuctionRole ? (
                <Link href={`/token/${tokenAddress}/update/auction-pitch`}>
                  <button className="w-40 rounded-full bg-sky-500 px-4 py-2 hover:bg-sky-600">
                    Auction Pitch
                  </button>
                </Link>
              ) : null}
              {hasAllowlistRole ? (
                <Link href={`/token/${tokenAddress}/update/eligibility`}>
                  <button className="w-40 rounded-full bg-sky-500 px-4 py-2 hover:bg-sky-600">
                    Eligibility
                  </button>
                </Link>
              ) : null}
              {hasAddTokenToCollectionRole ? (
                <Link href={`/token/${tokenAddress}/update/add-token`}>
                  <button className="w-40 rounded-full bg-sky-500 px-4 py-2 hover:bg-sky-600">
                    Add Tokens
                  </button>
                </Link>
              ) : null}
              <Link href={`/token/${tokenAddress}/update/permissions`}>
                <button className="w-40 rounded-full bg-sky-500 px-4 py-2 hover:bg-sky-600">
                  Permissions
                </button>
              </Link>
            </div>
          </div>
        ) : null}
      </div>
      <div className="flex flex-col items-center">
        {isAuctionPeriod && isAuctionFinished ? (
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold">Auction Pitch</span>
            <span className="mt-1 text-2xl">
              {calculateTimeString(Number(auctionEndTime) * 1000 - Date.now())}
            </span>
            {bidInfoView}
            <div className="mt-1 mb-4">
              {(availableCollateral && availableCollateral > 0) ||
              (lockedCollateral && lockedCollateral > 0)
                ? userCollateralView
                : null}
            </div>
            <div className="flex w-full justify-end gap-3">
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
                  className="mt-2 w-80 rounded-full bg-green-500 p-2 font-medium hover:bg-green-600 lg:w-3/6"
                  onClick={handleCloseAuction}
                  style={{
                    pointerEvents: isAuctionCloseLoading ? "none" : "auto",
                    opacity: isAuctionCloseLoading ? 0.6 : 1,
                  }}
                >
                  {isAuctionCloseLoading ? (
                    <span className="lds-dual-ring" />
                  ) : artist === account.address &&
                    highestBid?.bidAmount === BigInt(0) ? (
                    "Repossess Token"
                  ) : (
                    "Complete Auction"
                  )}
                </button>
                <div className="float-right">
                  <WalletConnect />
                </div>
              </BranchIsWalletConnected>
            </div>
          </div>
        ) : isAuctionPeriod && isAuctionStarted ? (
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold">Auction Pitch</span>
            <div className="flex items-center gap-2">
              <span className="mt-1 text-2xl">{auctionCountdown}</span>
              {bidExtensionWindowLengthSeconds && bidExtensionSeconds ? (
                <Tooltip delayDuration={200}>
                  <TooltipTrigger>
                    <BiInfoCircle
                      style={{ fontSize: "1.5rem", marginTop: 4 }}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[200px] text-center">
                    <span className="">
                      Bids placed in the final{" "}
                      {Number(bidExtensionWindowLengthSeconds) / 60} minutes
                      will extend the auction {Number(bidExtensionSeconds) / 60}{" "}
                      minutes.
                    </span>
                  </TooltipContent>
                </Tooltip>
              ) : null}
            </div>
            {!isAllowed ? (
              <span className="mt-2 text-yellow-300">
                You're not allowed to bid
              </span>
            ) : bidOfUser &&
              highestBid &&
              bidOfUser.bidAmount > 0 &&
              bidOfUser.bidAmount < highestBid.bidAmount ? (
              <span className="mt-2 text-red-300">You've Been Outbid</span>
            ) : bidOfUser &&
              highestBid &&
              bidOfUser.bidder === account.address &&
              bidOfUser.bidAmount === highestBid.bidAmount ? (
              <span className="mt-2 text-green-300">You're The Top Bidder</span>
            ) : null}
            <div className="flex flex-col justify-around gap-5 lg:flex-row">
              <div className="flex flex-col items-center gap-3">
                {bidInfoView}
                {(availableCollateral && availableCollateral > 0) ||
                (lockedCollateral && lockedCollateral > 0)
                  ? userCollateralView
                  : null}
              </div>
              <div className="mt-5 flex flex-col gap-4">
                <div>
                  <fieldset className="flex items-center gap-5">
                    <label className="w-[90px] text-right text-[15px]">
                      Bid
                    </label>
                    <input
                      placeholder="0"
                      value={newBidAmount}
                      onChange={(e) => setNewBidAmount(e.target.value)}
                      className="inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-md px-[10px] text-[15px]"
                      style={{
                        pointerEvents: isAllowed ? "auto" : "none",
                        opacity: isAllowed ? 1 : 0.6,
                      }}
                    />
                  </fieldset>
                  {isNewBidLessThanMinIncrement && !isPlaceBidLoading ? (
                    <span className="mt-1 flex justify-end text-red-500">
                      Min increment {formatEther(minBidIncrement)}
                    </span>
                  ) : isNewBidLessThanMinBid && !isPlaceBidLoading ? (
                    <span className="mt-1 flex justify-end text-red-500">
                      Min bid {formatEther(startingBidAmount)}
                    </span>
                  ) : null}
                </div>
                <fieldset className="flex items-center gap-5">
                  <label className="w-[90px] text-right text-[15px]">
                    Honorarium
                  </label>
                  <input
                    style={{ pointerEvents: "none" }}
                    className="inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-md border-gray-500 px-[10px] text-[15px] opacity-50"
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
                        : 0
                    }
                    readOnly
                  />
                </fieldset>
                <fieldset className="flex items-center gap-5">
                  <label className="w-[90px] text-right text-[15px]">
                    Total
                  </label>
                  <input
                    style={{ pointerEvents: "none" }}
                    className="inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-md px-[10px] text-[15px] opacity-50"
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
                        : 0
                    }
                    readOnly
                  />
                </fieldset>
                <div className="flex justify-end gap-2">
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
                    className="m-auto mt-2 mr-0 w-80 rounded-full bg-green-500 px-8 py-2 font-medium hover:bg-green-600 lg:w-40"
                    onClick={handlePlaceBid}
                    style={{
                      pointerEvents:
                        !newBidAmount ||
                        isNewBidLessThanMinBid ||
                        isNewBidLessThanMinIncrement
                          ? "none"
                          : "auto",
                      opacity:
                        !newBidAmount ||
                        isNewBidLessThanMinBid ||
                        isNewBidLessThanMinIncrement
                          ? 0.6
                          : 1,
                    }}
                  >
                    {isPlaceBidLoading ? (
                      <span className="lds-dual-ring" />
                    ) : (
                      "Submit Bid"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <span className="mt-5 text-2xl font-bold">Next Auction Pitch</span>
            <span className="mt-5 text-lg">English Auction (Extending)</span>
            <div>
              <span className="text-lg">
                {formatDate(Number(auctionStartTime) * 1000)} -{" "}
              </span>
              <span className="text-lg">
                {formatDate(Number(auctionEndTime) * 1000)}
              </span>
            </div>
            <div className="mt-5 flex w-3/6 flex-col items-center gap-1">
              {(availableCollateral && availableCollateral > 0) ||
              (lockedCollateral && lockedCollateral > 0)
                ? userCollateralView
                : null}
              {lockedCollateral && lockedCollateral > 0
                ? cancelBidButton
                : availableCollateral && availableCollateral > 0
                ? withdrawCollateralButton
                : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
