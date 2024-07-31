import { useEffect, useRef } from "react";
import Image from "next/image";

import { GlobalState, useStateMachine } from "little-state-machine";
import { useForm } from "react-hook-form";
import { Address, useAccount } from "wagmi";
import { useMediaQuery } from "react-responsive";

import useElementOffset from "@/lib/hooks/use-element-offset";
import { AccessControlInit } from "@/lib/hooks/use-facet-init";

function updateAction(
  state: GlobalState,
  payload: {
    permissions: {
      "token-admin": Address;
      "role-admin": Address;
    };
    beneficiary: {
      owner: Address;
    };
    "pco-settings": {
      owner: Address;
    };
    allowlist: {
      owner: Address;
    };
    auction: {
      owner: Address;
    };
    "steward-license": {
      minter: Address;
    };
  }
) {
  let newState = {
    ...state,
    permissionsInput: payload.permissions,
    permissionsInitData: {
      admin: payload.permissions["role-admin"],
    } as AccessControlInit,
  } as any;

  if (payload["steward-license"]) {
    newState.stewardLicenseInput = {
      ...newState.stewardLicenseInput,
      minter: payload["steward-license"].minter,
    };
    newState.stewardLicenseInitData = {
      ...newState.stewardLicenseInitData,
      minter: payload["steward-license"].minter,
    };
  }

  if (payload.beneficiary) {
    newState.beneficiaryInput = {
      ...newState.beneficiaryInput,
      owner: payload.beneficiary.owner,
    };
    newState.beneficiaryInitData = {
      ...newState.beneficiaryInitData,
      owner: payload.beneficiary.owner,
    };
  }

  if (payload["pco-settings"]) {
    newState.pcoSettingsInput = {
      ...newState.pcoSettingsInput,
      owner: payload["pco-settings"].owner,
    };
    newState.pcoSettingsInitData = {
      ...newState.pcoSettingsInitData,
      owner: payload["pco-settings"].owner,
    };
  }

  if (payload.allowlist) {
    newState.allowlist = {
      ...newState.allowlist,
      owner: payload.allowlist.owner,
    };
    newState.allowlistInitData = {
      ...newState.allowlistInitData,
      owner: payload.allowlist.owner,
    };
  }

  if (payload.auction) {
    newState.auction = {
      ...newState.auction,
      owner: payload.auction.owner,
    };
    newState.auctionInitData = {
      ...newState.auctionInitData,
      owner: payload.auction.owner,
    };
  }

  return newState;
}

export default function ConfigPermissions({
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
  const { register, handleSubmit, getValues, setValue } = useForm({
    defaultValues: {
      permissions: (state as any).permissionsInput,
      beneficiary: (state as any).beneficiaryInput,
      "pco-settings": (state as any).pcoSettingsInput,
      allowlist: (state as any).allowlistInput,
      auction: (state as any).auctionInput,
      "steward-license": (state as any).stewardLicenseInput,
    },
  });

  useEffect(() => {
    setValue("permissions.role-admin", account.address);
    setValue("permissions.token-admin", account.address);
  }, [account]);

  const onSubmit = (data: any) => {
    actions.updateAction(data);
    nextStep();
  };

  return (
    <>
      <h1 className="font-mono text-5xl sm:text-[75px] xl:text-[100px] 2xl:text-[160px] text-center leading-none mt-12 sm:mt-16 xl:mt-20 2xl:mt-24 min-[2000px]:mt-32">
        6.
        <br />
        Permissions
      </h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col items-center max-w-[320px] sm:max-w-[750px] xl:max-w-[1100px] 2xl:max-w-[1500px] m-auto">
          <div
            ref={formContainerRef}
            className="w-[320px] sm:w-[600px] xl:w-[800px] 2xl:w-[1100px] my-10 sm:mt-16 xl:mt-20 2xl:mt-24 text-lg sm:text-xl"
          >
            <div className="flex">
              <span className="w-1/3">Intro</span>
              <span className="w-2/3">
                Certain aspects of your Stewardship License can be configured to
                allow for updates. Carefully consider the expectations of your
                future Stewards & Creator Circle. There are social and security
                trade-offs with upgradability vs. immutability. You can forgo,
                maintain, or allocate these permissions. We&apos;ve set
                suggested defaults. Make sure secure access to the selected
                addresses can be maintained. We cannot change these values for
                you.
              </span>
            </div>
            <div className="flex mt-10">
              <label htmlFor="permissions.token-admin" className="w-1/3">
                Token Admin
              </label>
              <div className="flex flex-col w-2/3">
                <label htmlFor="permissions.token-admin">
                  This role mimics the permissions that you are exercising now
                  at minting (with technical limitations around backward
                  compatibility). This address can change a token&apos;s PCO
                  settings, implementation/configuration of core components, and
                  reassign the roles below. Set to 0x0 if/when you don&apos;t
                  want an admin.
                </label>
                <input
                  {...register(`permissions.token-admin`)}
                  type="string"
                  id={`permissions.token-admin`}
                  className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-2xl placeholder-[#ADADAD] mt-2"
                  placeholder="0x"
                  required
                  pattern="^(0x)?[0-9a-fA-F]{40}$"
                />
              </div>
            </div>
            <div className="flex mt-10">
              <label className="w-1/3">Component Configuration</label>
              <div className="flex flex-col w-2/3">
                <label>
                  Assign the ability to configure the details of each core
                  component. Token Admins can reassign these roles at any time.
                </label>
                <label htmlFor="permissions.role-admin" className="mt-6">
                  Role Admin
                </label>
                <input
                  {...register(`permissions.role-admin`)}
                  type="string"
                  id={`permissions.role-admin`}
                  className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-2xl placeholder-[#ADADAD] mt-2"
                  placeholder="0x"
                  required
                  pattern="^(0x)?[0-9a-fA-F]{40}$"
                />
                <label htmlFor="pco-settings.owner" className="mt-6">
                  PCO Settings
                </label>
                <input
                  {...register(`pco-settings.owner`)}
                  type="string"
                  id={`pco-settings.owner`}
                  className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-2xl placeholder-[#ADADAD] mt-2"
                  placeholder="0x"
                  required
                  pattern="^(0x)?[0-9a-fA-F]{40}$"
                />
                <label htmlFor="auction.owner" className="mt-6">
                  Stewardship Inauguration
                </label>
                <input
                  {...register(`auction.owner`)}
                  type="string"
                  id={`auction.owner`}
                  className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-2xl placeholder-[#ADADAD] mt-2"
                  placeholder="0x"
                  required
                  pattern="^(0x)?[0-9a-fA-F]{40}$"
                />
                <label htmlFor="allowlist.owner" className="mt-6">
                  Inauguration Eligibility
                </label>
                <input
                  {...register(`allowlist.owner`)}
                  type="string"
                  id={`allowlist.owner`}
                  className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-2xl placeholder-[#ADADAD] mt-2"
                  placeholder="0x"
                  required
                  pattern="^(0x)?[0-9a-fA-F]{40}$"
                />
                <label htmlFor="beneficiary.owner" className="mt-6">
                  Creator Circle
                </label>
                <input
                  {...register(`beneficiary.owner`)}
                  type="string"
                  id={`beneficiary.owner`}
                  className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-2xl placeholder-[#ADADAD] mt-2"
                  placeholder="0x"
                  required
                  pattern="^(0x)?[0-9a-fA-F]{40}$"
                />
                <label htmlFor="pco-settings.owner" className="mt-6">
                  Mint Additional Tokens
                </label>
                <input
                  {...register(`steward-license.minter`)}
                  type="string"
                  id={`steward-license.minter`}
                  className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-2xl placeholder-[#ADADAD] mt-2"
                  placeholder="0x"
                  required
                  pattern="^(0x)?[0-9a-fA-F]{40}$"
                />
              </div>
            </div>
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
                7. Review
              </button>
            )}
          </div>
        </div>
      </form>
    </>
  );
}
