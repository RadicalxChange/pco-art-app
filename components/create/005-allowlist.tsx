import { useEffect } from "react";

import { motion } from "framer-motion";
import { GlobalState, useStateMachine } from "little-state-machine";
import {
  FormProvider,
  UseFormRegister,
  useForm,
  useFormContext,
} from "react-hook-form";
import { Address, useAccount } from "wagmi";

import { FADE_DOWN_ANIMATION_VARIANTS } from "@/config/design";
import { AllowlistInit } from "@/lib/hooks/use-facet-init";

type FormPayload = {
  allowlist: {
    owner: Address;
    "allow-any": string;
    addresses: Address[];
  };
};

function updateAction(state: GlobalState, payload: FormPayload) {
  const allowlistInput = payload["allowlist"];

  return {
    ...state,
    allowlistInput,
    allowlistInitData: {
      owner: allowlistInput.owner,
      allowAny: allowlistInput["allow-any"] === "true",
      addresses:
        allowlistInput["allow-any"] === "false"
          ? allowlistInput.addresses.map((v) => v as Address)
          : [],
    } as AllowlistInit,
  };
}

export default function ConfigAllowlistFacet({
  nextStep,
  prevStep,
}: {
  nextStep: () => void;
  prevStep: () => void;
}) {
  const account = useAccount();

  const { actions, state } = useStateMachine({ updateAction });
  console.log(state);

  const methods = useForm({
    defaultValues: {
      allowlist: (state as any).allowlistInput,
    },
  });

  const { register, handleSubmit, getValues, setValue, watch } = methods;

  useEffect(() => {
    setValue("allowlist.owner", account.address);
  }, [account]);

  const watchAllowAny = watch("allowlist.allow-any") as string | undefined;
  const watchAddresses = watch(`allowlist.addresses`) as string[] | undefined;

  const onSubmit = (data: any) => {
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
          5. Auction Eligibility
        </motion.h2>
        <div className="mb-6">
          <label
            htmlFor="allowlist.allow-any"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Criteria
          </label>
          <label
            htmlFor="allowlist.allow-any"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Set who can participate in this token&apos;s Stewardship
            Inaugurations.
          </label>
          <select
            {...register("allowlist.allow-any")}
            className="grow rounded-lg border-gray-600 dark:bg-gray-700"
          >
            <option value="true">Open Participation</option>
            <option value="false">Allowlist</option>
          </select>
        </div>
        {watchAllowAny === "false" && (
          <div className="mb-6">
            <label
              htmlFor="allowlist.allow-any"
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
            >
              Allowlist
            </label>
            <label
              htmlFor="allowlist.allow-any"
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
            >
              Provide the eligibile Ethereum addresses.
            </label>
            <FormProvider {...methods}>
              {watchAddresses?.map((_, index) => (
                <AllowlistEntry key={index} index={index} register={register} />
              )) ?? <AllowlistEntry index={0} register={register} />}
            </FormProvider>
            <div className="mb-6 flex">
              <button
                className="btn btn-sm mx-1 grow bg-gradient-to-r from-emerald-500 to-emerald-400 text-white"
                onClick={() => {
                  setValue(
                    `allowlist.addresses.${watchAddresses?.length ?? 0 + 1}`,
                    ""
                  );
                }}
              >
                + Add another address
              </button>
            </div>
          </div>
        )}
        <div className="flex items-center justify-center">
          <button
            className="btn bg-gradient-button btn-xl w-30"
            onClick={() => {
              onSubmit(getValues());
              prevStep();
            }}
          >
            Back
          </button>
          <div className="grow" />
          <input
            type="submit"
            className="btn bg-gradient-button btn-xl w-30"
            value="Next"
          />
        </div>
      </div>
    </form>
  );
}

function AllowlistEntry({
  index,
  register,
}: {
  index: number;
  register: UseFormRegister<FormPayload>;
}) {
  const { watch, setValue } = useFormContext();
  const watchAddresses = watch(`allowlist.addresses`);

  return (
    <div className="mb-6 flex">
      {index > 0 && (
        <button
          className="btn btn-sm mx-5 bg-gradient-to-r from-red-500 to-red-400 text-white"
          onClick={() => {
            // Remove item from watchAddresses
            setValue(
              `allowlist.addresses`,
              watchAddresses?.toSpliced(index, 1)
            );
          }}
        >
          -
        </button>
      )}
      <input
        {...register(`allowlist.addresses.${index}`)}
        type="string"
        id={`allowlist.addresses.${index}`}
        className="mx-1 grow rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        placeholder="0x"
        required
        pattern="^(0x)?[0-9a-fA-F]{40}$"
      />
    </div>
  );
}
