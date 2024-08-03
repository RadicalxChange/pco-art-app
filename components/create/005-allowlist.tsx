import { useEffect, useRef } from "react";
import Image from "next/image";

import { GlobalState, useStateMachine } from "little-state-machine";
import {
  FormProvider,
  UseFormRegister,
  useForm,
  useFormContext,
} from "react-hook-form";
import { Address, useAccount } from "wagmi";
import { useMediaQuery } from "react-responsive";

import { AllowlistInit } from "@/lib/hooks/use-facet-init";
import useElementOffset from "@/lib/hooks/use-element-offset";

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
  const formContainerRef = useRef<HTMLDivElement>(null);

  const isMobileOrIsTablet = useMediaQuery({ query: "(max-width: 1240px)" });
  const formContainerOffset = useElementOffset(formContainerRef);
  const account = useAccount();
  const { actions, state } = useStateMachine({ updateAction });
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
    <>
      <h1 className="font-mono text-5xl sm:text-[75px] xl:text-[130px] 2xl:text-[145px] text-center mt-12 sm:mt-16 xl:mt-20 2xl:mt-24 min-[2000px]:mt-32">
        5.
        <br />
        Inauguration Eligibility
      </h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col items-center max-w-[320px] sm:max-w-[750px] xl:max-w-[1100px] 2xl:max-w-[1500px] m-auto">
          <div
            ref={formContainerRef}
            className="w-[320px] sm:w-[600px] xl:w-[750px] 2xl:w-[1100px] my-10 sm:mt-16 xl:mt-20 2xl:mt-24 text-sm sm:text-lg"
          >
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
                  className="bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD] mt-2"
                >
                  <option value="true">Open Participation</option>
                  <option value="false">Allowlist</option>
                </select>
              </div>
            </div>
            {watchAllowAny === "false" && (
              <div className="flex mt-10">
                <label htmlFor="allowlist.allow-any" className="w-1/3">
                  Allowlist
                </label>
                <div className="flex flex-col w-2/3">
                  <label htmlFor="allowlist.allow-any" className="mb-2">
                    Provide the eligibile Ethereum addresses.
                  </label>
                  <FormProvider {...methods}>
                    {watchAddresses?.map((_, index) => (
                      <AllowlistEntry
                        key={index}
                        index={index}
                        register={register}
                      />
                    )) ?? <AllowlistEntry index={0} register={register} />}
                  </FormProvider>
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
          <div className="flex items-center mt-10 mb-24 xl:mb-32">
            <button
              className="absolute left-0 flex items-center gap-2 sm:gap-3 bg-neon-green px-2 sm:px-4 py-1 font-serif text-2xl"
              onClick={() => prevStep()}
            >
              <Image src="/back-arrow.svg" alt="Back" width={18} height={18} />
              Back
            </button>
            {formContainerOffset && (
              <button
                type="submit"
                className="absolute flex gap-2 items-center sm:gap-3 bg-neon-green px-2 py-1 font-serif text-2xl w-[250px] sm:w-3/4"
                style={{
                  right: isMobileOrIsTablet ? 0 : "",
                  left: isMobileOrIsTablet ? "" : formContainerOffset.left,
                  width: isMobileOrIsTablet
                    ? ""
                    : document.documentElement.clientWidth -
                      formContainerOffset.left,
                }}
              >
                <Image
                  src="/forward-arrow.svg"
                  alt="Forward"
                  width={18}
                  height={18}
                />
                6. Permissions
              </button>
            )}
          </div>
        </div>
      </form>
    </>
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
    <div className="flex">
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
          <Image src="/cancel.svg" alt="Cancel" width={24} height={24} />
        </button>
      )}
      <input
        {...register(`allowlist.addresses.${index}`)}
        type="string"
        id={`allowlist.addresses.${index}`}
        className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD] mb-2"
        placeholder="0x"
        required
        pattern="^(0x)?[0-9a-fA-F]{40}$"
      />
    </div>
  );
}
