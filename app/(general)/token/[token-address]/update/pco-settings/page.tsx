'use client'
import { useEffect, useState } from 'react'

import { useForm } from 'react-hook-form'
import { Address, useContractReads } from 'wagmi'
import { waitForTransaction, writeContract } from 'wagmi/actions'

import { WalletConnect } from '@/components/blockchain/wallet-connect'
import { BranchIsWalletConnected } from '@/components/shared/branch-is-wallet-connected'
import { nativeStewardLicenseFacetABI, periodicPcoParamsFacetABI } from '@/lib/blockchain'
import { fromSecondsToUnits, fromUnitsToSeconds, truncateStr } from '@/lib/utils'

export default function UpdatePCOSettingsPage({ params }: { params: { 'token-address': string } }) {
  const [isSaving, setIsSaving] = useState<boolean>(false)

  const tokenAddress = params['token-address'] as Address

  const { data } = useContractReads({
    contracts: [
      {
        address: tokenAddress,
        abi: nativeStewardLicenseFacetABI,
        functionName: 'name',
      },
      {
        address: tokenAddress,
        abi: periodicPcoParamsFacetABI,
        functionName: 'licensePeriod',
      },
      {
        address: tokenAddress,
        abi: periodicPcoParamsFacetABI,
        functionName: 'feeNumerator',
      },
      {
        address: tokenAddress,
        abi: periodicPcoParamsFacetABI,
        functionName: 'feeDenominator',
      },
    ],
  })

  const tokenName = data && data[0].status === 'success' ? data[0].result : null
  const currentLicensePeriod = data && data[1].status === 'success' ? data[1].result : null
  const feeNumerator = data && data[2].status === 'success' ? data[2].result : null
  const feeDenominator = data && data[3].status === 'success' ? data[3].result : null

  const { register, getValues, setValue, watch } = useForm()

  const watchPcoSettings = watch('pco-settings')
  const annualizedRate = watchPcoSettings
    ? (watchPcoSettings.rate * 365 * 24 * 60 * 60) / fromUnitsToSeconds(watchPcoSettings.cycle, watchPcoSettings['cycle-type'])
    : null
  const licensePeriodInSeconds = watchPcoSettings ? fromUnitsToSeconds(watchPcoSettings.cycle, watchPcoSettings['cycle-type']) : null

  useEffect(() => {
    if (feeNumerator === null || feeDenominator === null || currentLicensePeriod === null) {
      return
    }

    const rate = (Number(feeNumerator) / Number(feeDenominator)) * 100
    const timeUnit = currentLicensePeriod >= 86400 ? 'days' : currentLicensePeriod >= 3600 ? 'hours' : 'minutes'

    setValue('pco-settings.rate', rate.toString().slice(0, 5))
    setValue('pco-settings.cycle', fromSecondsToUnits(Number(currentLicensePeriod), timeUnit))
    setValue('pco-settings.cycle-type', timeUnit)
  }, [feeNumerator, feeDenominator, currentLicensePeriod])

  const handleSave = async () => {
    if (licensePeriodInSeconds === null) {
      return
    }

    setIsSaving(true)

    try {
      const pcoSettings = getValues()['pco-settings']
      const rateNumerator = pcoSettings.rate * 100
      const rateDenominator = pcoSettings.rate > 0 ? 10000 : 1

      const { hash } = await writeContract({
        address: tokenAddress,
        abi: periodicPcoParamsFacetABI,
        functionName: 'setPCOParameters',
        args: [BigInt(Math.round(licensePeriodInSeconds)), BigInt(rateNumerator), BigInt(rateDenominator)],
      })
      await waitForTransaction({ hash })
      setIsSaving(false)
    } catch (err) {
      console.error(err)
      setIsSaving(false)
    }
  }

  return (
    <div className="m-auto w-2/4">
      <h1 className="text-4xl font-bold text-blue-500">
        {tokenName} ({truncateStr(tokenAddress, 12)})
      </h1>
      <h2 className="text-medium mt-5 text-2xl font-bold">Edit PCO Settings</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="mb-6 mt-12">
          <label htmlFor="cycle" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Stewardship Cycle
          </label>
          <label htmlFor="cycle" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            The duration between auction pitches. Weeks, months, and years are converted to seconds based on 7, 30, & 365 days respectively.
          </label>
          <div className="flex flex-col gap-2 lg:flex-row">
            <input
              {...register('pco-settings.cycle')}
              type="number"
              id="cycle"
              required
              min={1}
              className="mr-5 grow rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            />
            <select {...register('pco-settings.cycle-type')} className="w-40 rounded-lg text-gray-900 dark:bg-gray-700 dark:text-white">
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="years">Years</option>
            </select>
          </div>
        </div>
        <div className="mb-6">
          <label htmlFor="rate" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Honorarium Rate
          </label>
          <label htmlFor="rate" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            The percent of a winning Auction Pitch bid that is contributed to the Creator Circle in each Stewardship Cycle.
          </label>
          <div className="flex flex-col gap-2 text-center lg:flex-row">
            <input
              {...register('pco-settings.rate')}
              type="number"
              id="rate"
              className="w-20 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              placeholder="%"
              required
              min={0}
              step={0.01}
            />
            <label htmlFor="rate" className="w-50 dark:text-white-500 mx-10 mb-2 font-medium text-gray-500">
              = an Annualized Rate of
            </label>
            <input
              type="text"
              className="w-30 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              value={annualizedRate ? `${parseFloat(annualizedRate.toFixed(2))}%` : 0}
              disabled
            />
          </div>
        </div>
        <BranchIsWalletConnected>
          <button className="float-right w-full rounded-full bg-blue-500 px-8 py-4 text-xl font-bold lg:w-40" onClick={handleSave}>
            {isSaving ? <span className="lds-dual-ring" /> : 'Save'}
          </button>
          <div className="float-right">
            <WalletConnect />
          </div>
        </BranchIsWalletConnected>
      </form>
    </div>
  )
}
