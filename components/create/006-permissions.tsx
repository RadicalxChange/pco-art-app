import { useEffect } from 'react'

import { motion } from 'framer-motion'
import { GlobalState, useStateMachine } from 'little-state-machine'
import { useForm } from 'react-hook-form'
import { Address, useAccount } from 'wagmi'

import { FADE_DOWN_ANIMATION_VARIANTS } from '@/config/design'
import { AccessControlInit } from '@/lib/hooks/use-facet-init'

function updateAction(
  state: GlobalState,
  payload: {
    permissions: {
      'token-admin': Address
      'role-admin': Address
    }
    beneficiary: {
      owner: Address
    }
    'pco-settings': {
      owner: Address
    }
    allowlist: {
      owner: Address
    }
    auction: {
      owner: Address
    }
    'steward-license': {
      minter: Address
    }
  }
) {
  let newState = {
    ...state,
    permissionsInput: payload.permissions,
    permissionsInitData: {
      admin: payload.permissions['role-admin'],
    } as AccessControlInit,
  } as any

  if (payload['steward-license']) {
    newState.stewardLicenseInput = {
      ...newState.stewardLicenseInput,
      minter: payload['steward-license'].minter,
    }
    newState.stewardLicenseInitData = {
      ...newState.stewardLicenseInitData,
      minter: payload['steward-license'].minter,
    }
  }

  if (payload.beneficiary) {
    newState.beneficiaryInput = {
      ...newState.beneficiaryInput,
      owner: payload.beneficiary.owner,
    }
    newState.beneficiaryInitData = {
      ...newState.beneficiaryInitData,
      owner: payload.beneficiary.owner,
    }
  }

  if (payload['pco-settings']) {
    newState.pcoSettingsInput = {
      ...newState.pcoSettingsInput,
      owner: payload['pco-settings'].owner,
    }
    newState.pcoSettingsInitData = {
      ...newState.pcoSettingsInitData,
      owner: payload['pco-settings'].owner,
    }
  }

  if (payload.allowlist) {
    newState.allowlist = {
      ...newState.allowlist,
      owner: payload.allowlist.owner,
    }
    newState.allowlistInitData = {
      ...newState.allowlistInitData,
      owner: payload.allowlist.owner,
    }
  }

  if (payload.auction) {
    newState.auction = {
      ...newState.auction,
      owner: payload.auction.owner,
    }
    newState.auctionInitData = {
      ...newState.auctionInitData,
      owner: payload.auction.owner,
    }
  }

  return newState
}

export default function ConfigPermissions({ nextStep, prevStep }: { nextStep: () => void; prevStep: () => void }) {
  const account = useAccount()

  const { actions, state } = useStateMachine({ updateAction })

  const { register, handleSubmit, getValues, setValue } = useForm({
    defaultValues: {
      permissions: (state as any).permissionsInput,
      beneficiary: (state as any).beneficiaryInput,
      'pco-settings': (state as any).pcoSettingsInput,
      allowlist: (state as any).allowlistInput,
      auction: (state as any).auctionInput,
      'steward-license': (state as any).stewardLicenseInput,
    },
  })

  useEffect(() => {
    setValue('permissions.role-admin', account.address)
    setValue('permissions.token-admin', account.address)
  }, [account])

  const onSubmit = (data: any) => {
    actions.updateAction(data)
    nextStep()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="min-w-full rounded-md bg-neutral-100 p-4 dark:bg-neutral-800">
        <motion.h2
          className="text-gradient-primary text-center text-3xl font-bold tracking-[-0.02em] drop-shadow-sm md:text-4xl md:leading-[8rem]"
          variants={FADE_DOWN_ANIMATION_VARIANTS}>
          6. Permissions
        </motion.h2>
        <div className="mb-6">
          <label>
            Certain aspects of your Stewardship License can be configured to allow for updates. Carefully consider the expectations of your future
            Stewards & Creator Circle. There are social and security trade-offs with upgradability vs. immutability. You can forgo, maintain, or
            allocate these permissions. We&apos;ve set suggested defaults. Make sure secure access to the selected addresses can be maintained. We
            cannot change these values for you.
          </label>
          <label htmlFor="permissions.token-admin" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Token Admin
          </label>
          <label htmlFor="permissions.token-admin" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            This role mimics the permissions that you are exercising now at minting (with technical limitations around backward compatibility). This
            address can change a token&apos;s PCO settings, implementation/configuration of core components, and reassign the roles below. Set to 0x0
            if/when you don&apos;t want an admin.
          </label>
          <div className="flex">
            <input
              {...register(`permissions.token-admin`)}
              type="string"
              id={`permissions.token-admin`}
              className="mx-1 grow rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="0x"
              required
              pattern="^(0x)?[0-9a-fA-F]{40}$"
            />
          </div>
        </div>
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Component Configuration</label>
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Assign the ability to configure the details of each core component. Token Admins can reassign these roles at any time.
          </label>
          <div className="flex">
            <label htmlFor="permissions.role-admin" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Role Admin
            </label>
            <input
              {...register(`permissions.role-admin`)}
              type="string"
              id={`permissions.role-admin`}
              className="mx-1 grow rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="0x"
              required
              pattern="^(0x)?[0-9a-fA-F]{40}$"
            />
          </div>
          <div className="flex">
            <label htmlFor="pco-settings.owner" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              PCO Settings
            </label>
            <input
              {...register(`pco-settings.owner`)}
              type="string"
              id={`pco-settings.owner`}
              className="mx-1 grow rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="0x"
              required
              pattern="^(0x)?[0-9a-fA-F]{40}$"
            />
          </div>
          <div className="flex">
            <label htmlFor="auction.owner" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Auction Pitch
            </label>
            <input
              {...register(`auction.owner`)}
              type="string"
              id={`auction.owner`}
              className="mx-1 grow rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="0x"
              required
              pattern="^(0x)?[0-9a-fA-F]{40}$"
            />
          </div>
          <div className="flex">
            <label htmlFor="allowlist.owner" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Auction Pitch Eligibility
            </label>
            <input
              {...register(`allowlist.owner`)}
              type="string"
              id={`allowlist.owner`}
              className="mx-1 grow rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="0x"
              required
              pattern="^(0x)?[0-9a-fA-F]{40}$"
            />
          </div>
          <div className="flex">
            <label htmlFor="beneficiary.owner" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Creator Circle
            </label>
            <input
              {...register(`beneficiary.owner`)}
              type="string"
              id={`beneficiary.owner`}
              className="mx-1 grow rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="0x"
              required
              pattern="^(0x)?[0-9a-fA-F]{40}$"
            />
          </div>
          <div className="flex">
            <label htmlFor="pco-settings.owner" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Mint Additional Tokens
            </label>
            <input
              {...register(`steward-license.minter`)}
              type="string"
              id={`steward-license.minter`}
              className="mx-1 grow rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="0x"
              required
              pattern="^(0x)?[0-9a-fA-F]{40}$"
            />
          </div>
        </div>
        <div className="flex items-center justify-center">
          <button
            className="btn bg-gradient-button btn-xl w-30"
            onClick={() => {
              onSubmit(getValues())
              prevStep()
            }}>
            Back
          </button>
          <div className="grow" />
          <input type="submit" className="btn bg-gradient-button btn-xl w-30" value="Next" />
        </div>
      </div>
    </form>
  )
}
