import { useEffect } from "react";

import { motion } from "framer-motion";
import { GlobalState, useStateMachine } from "little-state-machine";
import { useForm } from "react-hook-form";
import { useAccount } from "wagmi";

import { FADE_DOWN_ANIMATION_VARIANTS } from "@/config/design";
import { NativeStewardLicenseInit } from "@/lib/hooks/use-facet-init";

enum MintType {
  New = "new",
  Wrapped = "wrapped",
}

function updateAction(
  state: GlobalState,
  payload: {
    "steward-license": {
      minter: string;
      "max-token-count": number;
      "should-mint": boolean;
      name: string;
      symbol: string;
      "media-uri": string;
      "mint-type": MintType;
    };
  }
) {
  const stewardLicenseInput = payload["steward-license"];

  return {
    ...state,
    stewardLicenseInput,
    stewardLicenseInitData: {
      minter: stewardLicenseInput.minter,
      maxTokenCount: stewardLicenseInput["max-token-count"],
      name: stewardLicenseInput.name,
      symbol: stewardLicenseInput.symbol,
      baseURI: stewardLicenseInput["media-uri"] + "/metadata/",
      shouldMint: stewardLicenseInput["should-mint"],
    } as NativeStewardLicenseInit,
  };
}

export default function ConfigStewardLicenseFacet({
  nextStep,
}: {
  nextStep: () => void;
}) {
  const { actions, state } = useStateMachine({ updateAction });
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      "steward-license": (state as any).stewardLicenseInput,
    },
  });

  const account = useAccount();

  useEffect(() => {
    setValue("steward-license.minter", account.address);
  }, [account]);

  const onSubmit = async (data: any) => {
    actions.updateAction(data);
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="min-w-full rounded-md bg-neutral-100 p-4 dark:bg-neutral-800">
        <motion.h2
          className="text-gradient-primary text-center text-3xl font-bold tracking-[-0.02em] drop-shadow-sm md:text-4xl md:leading-[8rem]"
          variants={FADE_DOWN_ANIMATION_VARIANTS}
        >
          1. The Art
        </motion.h2>
        <div className="mb-6">
          <label
            htmlFor="mint-type"
            className="mb-3 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Mint Type
          </label>
          <input
            {...register("steward-license.mint-type")}
            type="radio"
            id="mint-type-new"
            className="border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            value={MintType.New}
            checked
          />
          <label htmlFor="mint-type-new" className="mx-2">
            Create New Stewardship Token
          </label>
          <input
            {...register("steward-license.mint-type")}
            type="radio"
            id="mint-type-wrapped"
            className="border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            value={MintType.Wrapped}
            disabled
          />
          <label htmlFor="mint-type-wrapped" className="mx-2 text-gray-500">
            Wrap Existing Token
          </label>
        </div>
        <div className="mb-6">
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Name (Max 32 Characters)
          </label>
          <input
            {...register("steward-license.name")}
            type="text"
            id="name"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            placeholder="Name your token"
            required
            maxLength={32}
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="symbol"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Symbol (Max 10 Characters)
          </label>
          <input
            {...register("steward-license.symbol")}
            type="text"
            id="symbol"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            placeholder="An abbreviation for your token"
            required
            maxLength={10}
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="media"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            URI (Metadata)
          </label>
          <label
            htmlFor="cycle"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            <a
              className="text-cyan-400 underline"
              target="_blank"
              href="https://nftstorage.link/ipfs/bafybeidxfej5cokgom5ticchwgdwge3sibxdk73ua7s3tlmrxcydhhktjy?filename=metadata.zip"
            >
              Download this JSON template
            </a>
            , define your token metadata, upload it to NFT.Storage, & add the
            resulting CID here.
          </label>
          <input
            {...register("steward-license.media-uri")}
            type="text"
            id="media"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            placeholder="ipfs://"
            required
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="media"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Number of Tokens You're Creating
          </label>
          <input
            {...register("steward-license.max-token-count")}
            type="number"
            id="max-token-count"
            className="w-40 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            placeholder=""
            required
            min={1}
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="should-mint"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Mint Tokens at Creation
          </label>
          <input
            {...register("steward-license.should-mint")}
            type="checkbox"
            id="should-mint"
            className="rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center justify-center">
          <input
            type="submit"
            className="btn bg-gradient-button btn-xl"
            value="Next"
          ></input>
        </div>
      </div>
    </form>
  );
}
