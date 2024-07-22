import { useEffect, useState } from 'react'

import { BigNumberish, Contract } from 'ethers'
import { Address, useAccount, useNetwork } from 'wagmi'

import AccessControlFacetABI from '../../abi/AccessControlFacet.json'
import AllowlistFacetABI from '../../abi/AllowlistFacet.json'
import EnglishPeriodicAuctionFacetABI from '../../abi/EnglishPeriodicAuctionFacet.json'
import IDABeneficiaryFacetABI from '../../abi/IDABeneficiaryFacet.json'
import NativeStewardLicenseFacetABI from '../../abi/NativeStewardLicenseFacet.json'
import PeriodicPCOParamsFacetABI from '../../abi/PeriodicPCOParamsFacet.json'
import {
  accessControlFacetAddress,
  allowlistFacetAddress,
  englishPeriodicAuctionFacetAddress,
  idaBeneficiaryFacetAddress,
  nativeStewardLicenseFacetAddress,
  periodicPcoParamsFacetAddress,
} from '../blockchain'

export type FacetInit = {
  target: `0x${string}`
  initTarget: `0x${string}`
  initData: `0x${string}`
  selectors: `0x${string}`[]
}

export type NativeStewardLicenseInit = {
  minter: `0x${string}`
  maxTokenCount: BigNumberish
  name: string
  symbol: string
  baseURI: string
  shouldMint: boolean
}

export type PeriodicPCOParamsInit = {
  owner: Address
  licensePeriodInSeconds: BigNumberish
  rateNumerator: BigNumberish
  rateDenominator: BigNumberish
}

export type Beneficiary = {
  subscriber: Address
  units: BigNumberish
}
export type IDABeneficiaryInit = {
  owner: Address
  token: Address
  beneficiaries: Beneficiary[]
}

export type EnglishPeriodicAuctionInit = {
  owner: Address
  initialPeriodStartTime: BigNumberish
  initialPeriodStartTimeOffset: BigNumberish
  startingBid: BigNumberish
  auctionLengthSeconds: BigNumberish
  minBidIncrement: BigNumberish
  bidExtensionWindowLengthSeconds: BigNumberish
  bidExtensionSeconds: BigNumberish
}

export type AllowlistInit = {
  owner: Address
  allowAny: boolean
  addresses: Address[]
}

export type AccessControlInit = {
  admin: Address
}

function getSelectors(contract: Contract, erc165 = false) {
  const signatures = Object.keys(contract.interface.functions)
  const selectors = signatures.reduce((acc, val) => {
    if (val !== 'init(bytes)' && (erc165 || val !== 'supportsInterface(bytes4)')) {
      acc.push(contract.interface.getSighash(val) as `0x${string}`)
    }
    return acc
  }, [] as `0x${string}`[])
  return selectors
}

export function useNativeStewardLicenseInit(data: NativeStewardLicenseInit | undefined): FacetInit | null {
  const [facetInit, setFacetInit] = useState<FacetInit | null>(null)

  const network = useNetwork()
  const account = useAccount()

  useEffect(() => {
    if (!data || network.chain === undefined) {
      setFacetInit(null)
      return
    }

    const contract = new Contract(
      nativeStewardLicenseFacetAddress[network.chain.id as keyof typeof nativeStewardLicenseFacetAddress],
      NativeStewardLicenseFacetABI
    )

    setFacetInit({
      target: contract.address as `0x${string}`,
      initTarget: contract.address as `0x${string}`,
      initData: contract.interface.encodeFunctionData('initializeStewardLicense(address,address,address,uint256,bool,string,string,string)', [
        account.address,
        data.minter,
        account.address,
        data.maxTokenCount,
        data.shouldMint,
        data.name,
        data.symbol,
        data.baseURI,
      ]) as `0x${string}`,
      selectors: getSelectors(contract),
    })
  }, [data])

  return facetInit
}

export function usePeriodicPCOParamsInit(data: PeriodicPCOParamsInit | undefined): FacetInit | null {
  const [facetInit, setFacetInit] = useState<FacetInit | null>(null)

  const network = useNetwork()

  useEffect(() => {
    if (!data || network.chain === undefined) {
      setFacetInit(null)
      return
    }

    const contract = new Contract(
      periodicPcoParamsFacetAddress[network.chain.id as keyof typeof periodicPcoParamsFacetAddress],
      PeriodicPCOParamsFacetABI
    )

    setFacetInit({
      target: contract.address as `0x${string}`,
      initTarget: contract.address as `0x${string}`,
      initData: contract.interface.encodeFunctionData('initializePCOParams(address,uint256,uint256,uint256)', [
        data.owner,
        data.licensePeriodInSeconds,
        data.rateNumerator,
        data.rateDenominator,
      ]) as `0x${string}`,
      selectors: getSelectors(contract),
    })
  }, [data])

  return facetInit
}

export function useIDABeneficiaryInit(data: IDABeneficiaryInit | undefined): FacetInit | null {
  const [facetInit, setFacetInit] = useState<FacetInit | null>(null)

  const network = useNetwork()

  useEffect(() => {
    if (!data || network.chain === undefined) {
      setFacetInit(null)
      return
    }

    const contract = new Contract(idaBeneficiaryFacetAddress[network.chain.id as keyof typeof idaBeneficiaryFacetAddress], IDABeneficiaryFacetABI)

    setFacetInit({
      target: contract.address as `0x${string}`,
      initTarget: contract.address as `0x${string}`,
      initData: contract.interface.encodeFunctionData('initializeIDABeneficiary(address,address,(address,uint128)[])', [
        data.owner,
        data.token,
        data.beneficiaries.map((b) => [b.subscriber, b.units]),
      ]) as `0x${string}`,
      selectors: getSelectors(contract),
    })
  }, [data])

  return facetInit
}

export function useEnglishPeriodicAuctionInit(data: EnglishPeriodicAuctionInit | undefined): FacetInit | null {
  const [facetInit, setFacetInit] = useState<FacetInit | null>(null)

  const network = useNetwork()
  const account = useAccount()

  useEffect(() => {
    if (!data || network.chain === undefined) {
      setFacetInit(null)
      return
    }

    const contract = new Contract(
      englishPeriodicAuctionFacetAddress[network.chain.id as keyof typeof englishPeriodicAuctionFacetAddress],
      EnglishPeriodicAuctionFacetABI
    )

    setFacetInit({
      target: contract.address as `0x${string}`,
      initTarget: contract.address as `0x${string}`,
      initData: contract.interface.encodeFunctionData(
        'initializeAuction(address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256)',
        [
          data.owner,
          account.address,
          account.address,
          data.initialPeriodStartTime,
          data.initialPeriodStartTimeOffset,
          data.startingBid,
          data.auctionLengthSeconds,
          data.minBidIncrement,
          data.bidExtensionWindowLengthSeconds,
          data.bidExtensionSeconds,
        ]
      ) as `0x${string}`,
      selectors: getSelectors(contract),
    })
  }, [data])

  return facetInit
}

export function useAllowlistInit(data: AllowlistInit | undefined): FacetInit | null {
  const [facetInit, setFacetInit] = useState<FacetInit | null>(null)

  const network = useNetwork()

  useEffect(() => {
    if (!data || network.chain === undefined) {
      setFacetInit(null)
      return
    }

    const contract = new Contract(allowlistFacetAddress[network.chain.id as keyof typeof allowlistFacetAddress], AllowlistFacetABI)

    setFacetInit({
      target: contract.address as `0x${string}`,
      initTarget: contract.address as `0x${string}`,
      initData: contract.interface.encodeFunctionData('initializeAllowlist(address,bool,address[])', [
        data.owner,
        data.allowAny,
        data.addresses,
      ]) as `0x${string}`,
      selectors: getSelectors(contract),
    })
  }, [data])

  return facetInit
}

export function useAccessControlInit(data: AccessControlInit | undefined): FacetInit | null {
  const [facetInit, setFacetInit] = useState<FacetInit | null>(null)

  const network = useNetwork()

  useEffect(() => {
    if (!data || network.chain === undefined) {
      setFacetInit(null)
      return
    }

    const contract = new Contract(accessControlFacetAddress[network.chain.id as keyof typeof accessControlFacetAddress], AccessControlFacetABI)

    setFacetInit({
      target: contract.address as `0x${string}`,
      initTarget: contract.address as `0x${string}`,
      initData: contract.interface.encodeFunctionData('initializeAccessControl(address)', [data.admin]) as `0x${string}`,
      selectors: getSelectors(contract),
    })
  }, [])

  return facetInit
}
