import { useState, useEffect, useRef } from "react";
import Image from "next/image";

import { useMediaQuery } from "react-responsive";
import { useStateMachine } from "little-state-machine";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useWaitForTransaction } from "wagmi";

import PlusSignIcon from "@/components/shared/plus-sign-icon";
import ForwardArrowAnimated from "@/components/shared/forward-arrow-animated";
import fetchJson from "@/lib/utils/fetch-json";
import { truncateStr } from "@/lib/utils";
import useElementOffset from "@/lib/hooks/use-element-offset";
import { useOwnableDiamondFactoryAbiCreateDiamond } from "@/lib/blockchain";
import {
  FacetInit,
  useAccessControlInit,
  useAllowlistInit,
  useEnglishPeriodicAuctionInit,
  useIDABeneficiaryInit,
  useNativeStewardLicenseInit,
  usePeriodicPCOParamsInit,
} from "@/lib/hooks/use-facet-init";

function updateAction() {
  return {};
}

type Metadata = {
  name: string;
  description: string;
  image: string;
  external_link?: string;
  properties?: { legal_license?: string };
};

export default function ConfigReview({
  prevStep,
  setStep,
}: {
  prevStep: () => void;
  setStep: (step: number) => void;
}) {
  const [metadata, setMetadata] = useState<Metadata>();

  const formContainerRef = useRef<HTMLDivElement>(null);

  const isMobileOrIsTablet = useMediaQuery({ query: "(max-width: 1240px)" });
  const formContainerOffset = useElementOffset(formContainerRef);
  const { state, actions } = useStateMachine({ updateAction });
  const { handleSubmit } = useForm();
  const stewardLicenseInitData = useNativeStewardLicenseInit(
    (state as any).stewardLicenseInitData
  );
  const allowlistInitData = useAllowlistInit((state as any).allowlistInitData);
  const auctionInitData = useEnglishPeriodicAuctionInit(
    (state as any).auctionInitData
  );
  const beneficiaryInitData = useIDABeneficiaryInit(
    (state as any).beneficiaryInitData
  );
  const pcoSettingsInitData = usePeriodicPCOParamsInit(
    (state as any).pcoSettingsInitData
  );
  const accessControlInitData = useAccessControlInit(
    (state as any).permissionsInitData
  );

  const {
    write,
    data,
    isLoading: isTxnLoading,
  } = useOwnableDiamondFactoryAbiCreateDiamond({
    args: [
      [
        stewardLicenseInitData,
        allowlistInitData,
        auctionInitData,
        beneficiaryInitData,
        pcoSettingsInitData,
        accessControlInitData,
      ].filter((v) => v !== null) as FacetInit[],
    ],
  });

  const {
    data: txnReceipt,
    isLoading,
    isSuccess,
    isError,
    isFetched,
    isFetching,
  } = useWaitForTransaction({
    hash: data?.hash,
  });

  const onSubmit = () => {
    write?.();
  };

  useEffect(() => {
    (async () => {
      try {
        const metadata = await fetchJson(
          `https://w3s.link/ipfs/${(state as any).stewardLicenseInput[
            "media-uri"
          ].replace("ipfs://", "")}/metadata/0`
        );

        setMetadata(metadata as Metadata);
      } catch (err) {
        console.error(err);

        setMetadata({} as Metadata);
      }
    })();
  }, [state]);

  useEffect(() => {
    if (isSuccess) {
      actions.updateAction();
    }
  }, [isSuccess]);

  if (!isLoading && isFetched && isSuccess) {
    const newTokenAddress =
      txnReceipt?.logs[txnReceipt?.logs.length - 1].topics[1];
    const tokenAddress = newTokenAddress
      ? "0x" + newTokenAddress.slice(26)
      : "";

    return (
      <div className="flex flex-col flex-center mt-32">
        <h3 className="mb-2 text-9xl font-bold">Contracts Deployed!</h3>
        <p className="mb-2 text-xl">
          <Link href={`/token/${tokenAddress}/0`} className="mt-2 underline">
            View Token Page
          </Link>
        </p>
      </div>
    );
  } else if (!isLoading && isFetched && isError) {
    return (
      <div className="flex flex-col flex-center mt-32">
        <h3 className="mb-2 text-9xl font-bold">Error minting asset!</h3>
      </div>
    );
  }

  if (
    !stewardLicenseInitData ||
    !allowlistInitData ||
    !auctionInitData ||
    !beneficiaryInitData ||
    !pcoSettingsInitData
  ) {
    return (
      <div className="flex flex-col flex-center mt-32">
        <h3 className="mb-2 text-9xl font-bold">Something went wrong</h3>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between w-full mt-12 sm:mt-16 xl:mt-20 2xl:mt-24 min-[2000px]:mt-32 px-4">
        <div className="flex flex-col justify-between">
          <PlusSignIcon />
          <PlusSignIcon />
        </div>
        <h1 className="font-mono text-5xl sm:text-[75px] xl:text-[130px] 2xl:text-[145px] text-center">
          7.
          <br />
          Review
        </h1>
        <div className="flex flex-col justify-between">
          <PlusSignIcon />
          <PlusSignIcon />
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col items-center text-sm sm:text-lg">
          <div className="flex justify-between items-start w-full mt-12 sm:mt-16 xl:mt-20 2xl:mt-24 px-4">
            <PlusSignIcon />
            <div
              ref={formContainerRef}
              className="w-[320px] sm:w-[600px] xl:w-[750px] 2xl:w-[1100px]"
            >
              <div className="flex flex-col sm:flex-row">
                <div className="flex items-start gap-2 w-full sm:w-[45%]">
                  <PlusSignIcon />
                  <div className="flex items-center self-start">
                    The Art [
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setStep(1);
                      }}
                    >
                      <Image
                        src="/edit.svg"
                        alt="Edit"
                        width={16}
                        height={16}
                      />
                    </button>
                    ]
                  </div>
                </div>
                <div className="flex items-start gap-2 w-full sm:w-[55%]">
                  <div className="flex flex-col w-full">
                    <div className="flex items-center gap-1">
                      <span className="mt-1">Mint Type: </span>
                      <p className="font-serif text-xl text-ellipsis overflow-hidden whitespace-nowrap ">
                        {(state as any).stewardLicenseInput["mint-type"] ===
                        "new"
                          ? "New Token"
                          : "Wrapped Token"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="mt-1">Legal License: </span>
                      <p className="font-serif text-xl text-ellipsis overflow-hidden whitespace-nowrap ">
                        {metadata?.properties?.legal_license ?? ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="mt-1">Name: </span>
                      <p className="font-serif text-xl text-ellipsis overflow-hidden whitespace-nowrap ">
                        {(state as any).stewardLicenseInput.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="mt-1">Symbol: </span>
                      <p className="font-serif text-xl text-ellipsis overflow-hidden whitespace-nowrap ">
                        {(state as any).stewardLicenseInput.symbol}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="mt-1">External Link: </span>
                      <p className="font-serif text-xl text-ellipsis overflow-hidden whitespace-nowrap ">
                        {metadata?.external_link ?? ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="mt-1">Description: </span>
                      <p className="font-serif text-xl text-ellipsis overflow-hidden whitespace-nowrap ">
                        {metadata?.description ?? ""}
                      </p>
                    </div>
                    <img
                      src={
                        metadata?.image
                          ? `https://w3s.link/ipfs/${metadata.image.replace(
                              "ipfs://",
                              ""
                            )}`
                          : ""
                      }
                      alt="Image"
                      className="mt-5 self-center sm:self-start"
                      style={{
                        width: 320,
                        height: 320,
                      }}
                    />
                  </div>
                  <PlusSignIcon />
                </div>
              </div>
            </div>
            <PlusSignIcon />
          </div>
          <div className="w-[320px] sm:w-[600px] xl:w-[750px] 2xl:w-[1100px]">
            <div className="flex flex-col sm:flex-row mt-12">
              <div className="flex items-start gap-2 w-full sm:w-[45%]">
                <PlusSignIcon />
                <div className="flex items-center self-start">
                  PCO Settings [
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setStep(2);
                    }}
                  >
                    <Image src="/edit.svg" alt="Edit" width={16} height={16} />
                  </button>
                  ]
                </div>
              </div>
              <div className="flex items-start gap-2 w-full sm:w-[55%]">
                <div className="flex flex-col w-full">
                  <div className="flex items-center gap-1">
                    <span className="mt-1">Stewardship Cycle: </span>
                    <p className="font-serif text-xl text-ellipsis overflow-hidden whitespace-nowrap">
                      {`${(state as any).pcoSettingsInput?.cycle} ${
                        (state as any).pcoSettingsInput?.["cycle-type"]
                      }`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="mt-1">Honorarium Rate: </span>
                    <p className="font-serif text-xl text-ellipsis overflow-hidden whitespace-nowrap">
                      {`${(state as any).pcoSettingsInput?.rate}`}%
                    </p>
                  </div>
                </div>
                <PlusSignIcon />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row mt-12">
              <div className="flex items-start gap-2 w-full sm:w-[45%]">
                <PlusSignIcon />
                <div className="flex items-center]">
                  Creator Circle [
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setStep(3);
                    }}
                  >
                    <Image src="/edit.svg" alt="Edit" width={16} height={16} />
                  </button>
                  ]
                </div>
              </div>
              <div className="flex items-start gap-2 w-full sm:w-[55%]">
                <div className="flex flex-col w-full">
                  <div className="flex items-center gap-1">
                    <span className="mt-1">Type: </span>
                    <p
                      className="font-serif text-xl text-ellipsis overflow-hidden whitespace-nowrap underline decoration-2 cursor-pointer"
                      onClick={() => setStep(3)}
                    >
                      Allocation Table
                    </p>
                  </div>
                </div>
                <PlusSignIcon />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row mt-12">
              <div className="flex items-start gap-2 w-full sm:w-[45%]">
                <PlusSignIcon />
                <div className="flex items-center self-start">
                  English Auction [
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setStep(4);
                    }}
                  >
                    <Image src="/edit.svg" alt="Edit" width={16} height={16} />
                  </button>
                  ]
                </div>
              </div>
              <div className="flex items-start gap-2 w-full sm:w-[55%]">
                <div className="flex flex-col w-full">
                  <div className="flex items-center gap-1">
                    <span className="mt-1">Initial Auction: </span>
                    <p className="font-serif text-xl text-ellipsis overflow-hidden whitespace-nowrap">
                      {new Date(
                        (state as any).auctionInitData?.initialPeriodStartTime *
                          1000
                      ).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="mt-1">Offset: </span>
                    <p className="font-serif text-xl text-ellipsis overflow-hidden whitespace-nowrap">
                      {Number(
                        (state as any).auctionInput?.[
                          "initial-start-time-offset"
                        ]
                      ) > 0
                        ? `${
                            (state as any).auctionInput?.[
                              "initial-start-time-offset"
                            ]
                          } ${
                            (state as any).auctionInput?.[
                              "initial-start-time-offset-type"
                            ]
                          }`
                        : 0}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="mt-1">Duration: </span>
                    <p className="font-serif text-xl text-ellipsis overflow-hidden whitespace-nowrap">
                      {`${(state as any).auctionInput?.["duration"]} ${
                        (state as any).auctionInput?.["duration-type"]
                      }`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="mt-1">Starting Bid: </span>
                    <p className="font-serif text-xl text-ellipsis overflow-hidden whitespace-nowrap">
                      {(state as any).auctionInput?.["starting-bid"]} ETH
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="mt-1">Minimum Bid Increase: </span>
                    <p className="font-serif text-xl text-ellipsis overflow-hidden whitespace-nowrap">
                      {(state as any).auctionInput?.["min-bid-increase"]} ETH
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="mt-1">Extension Window: </span>
                    <p className="font-serif text-xl text-ellipsis overflow-hidden whitespace-nowrap">
                      {(state as any).auctionInput?.["extension-window"]}{" "}
                      minutes
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="mt-1">Extension Length: </span>
                    <p className="font-serif text-xl text-ellipsis overflow-hidden whitespace-nowrap">
                      {(state as any).auctionInput?.["extension-length"]}{" "}
                      minutes
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="mt-1">Eligibility: </span>
                    <p className="font-serif text-xl text-ellipsis overflow-hidden whitespace-nowrap">
                      {(state as any).allowlistInput?.["allow-any"] === "true"
                        ? "Open"
                        : "Allowlist"}
                    </p>
                  </div>
                </div>
                <PlusSignIcon />
              </div>
            </div>
          </div>
          <div className="flex justify-between items-start w-full mt-12 px-4">
            <PlusSignIcon />
            <div className="flex items-start w-[320px] sm:w-[600px] xl:w-[750px] 2xl:w-[1100px]">
              <div className="flex flex-col sm:flex-row w-full">
                <div className="flex items-start gap-2 w-full sm:w-[45%]">
                  <PlusSignIcon />
                  <div className="flex items-center self-start">
                    Permissions [
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setStep(6);
                      }}
                    >
                      <Image
                        src="/edit.svg"
                        alt="Edit"
                        width={16}
                        height={16}
                      />
                    </button>
                    ]
                  </div>
                </div>
                <div className="flex items-start gap-2 w-full sm:w-[55%]">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="mt-1">Token Admin: </span>
                      <p className="font-serif text-xl text-ellipsis overflow-hidden whitespace-nowrap">
                        {truncateStr(
                          (state as any).permissionsInput?.["token-admin"] ??
                            "",
                          12
                        ) ?? "N/A"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="mt-1">PCO Configuration: </span>
                      <p className="font-serif text-xl text-ellipsis overflow-hidden whitespace-nowrap">
                        {truncateStr(
                          (state as any).pcoSettingsInput?.["owner"] ?? "",
                          12
                        ) ?? "N/A"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="mt-1">Auction Configuration: </span>
                      <p className="font-serif text-xl text-ellipsis overflow-hidden whitespace-nowrap">
                        {truncateStr(
                          (state as any).auctionInput?.["owner"] ?? "",
                          12
                        ) ?? "N/A"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="mt-1">Eligibility Configuration: </span>
                      <p className="font-serif text-xl text-ellipsis overflow-hidden whitespace-nowrap">
                        {truncateStr(
                          (state as any).allowlistInput?.["owner"] ?? "",
                          12
                        ) ?? "N/A"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="mt-1">
                        Creator Circle Configuration:{" "}
                      </span>
                      <p className="font-serif text-xl text-ellipsis overflow-hidden whitespace-nowrap">
                        {truncateStr(
                          (state as any).beneficiaryInput?.["owner"] ?? "",
                          12
                        ) ?? "N/A"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="mt-1">Additional Token Minter: </span>
                      <p className="font-serif text-xl text-ellipsis overflow-hidden whitespace-nowrap">
                        {truncateStr(
                          (state as any).stewardLicenseInput?.["minter"] ?? "",
                          12
                        ) ?? "N/A"}
                      </p>
                    </div>
                  </div>
                  <PlusSignIcon />
                </div>
              </div>
            </div>
            <PlusSignIcon />
          </div>
          <div className="flex items-center mt-16 sm:mt-24 mb-24 xl:mb-32">
            <button
              className="absolute left-0 flex items-center gap-2 sm:gap-3 bg-neon-green font-serif text-2xl px-2 py-1"
              onClick={() => prevStep()}
            >
              <Image src="/back-arrow.svg" alt="Back" width={18} height={18} />
              Back
            </button>
            {formContainerOffset && (
              <button
                type="submit"
                disabled={isLoading || isFetching || isTxnLoading}
                className="absolute flex items-center sm:gap-3 font-serif text-2xl w-[250px] sm:w-3/4 gradient-action-btn px-2"
                style={{
                  right: isMobileOrIsTablet ? 0 : "",
                  left: isMobileOrIsTablet ? "" : formContainerOffset.left,
                  width: isMobileOrIsTablet
                    ? ""
                    : document.documentElement.clientWidth -
                      formContainerOffset.left,
                }}
              >
                <ForwardArrowAnimated>
                  <span>
                    {isLoading || isFetching || isTxnLoading
                      ? "MINTING..."
                      : "MINT PCO TOKEN"}
                  </span>
                </ForwardArrowAnimated>
              </button>
            )}
          </div>
        </div>
      </form>
    </>
  );
}
