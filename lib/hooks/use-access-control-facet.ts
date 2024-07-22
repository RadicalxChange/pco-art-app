import { keccak256, toHex } from 'viem'
import { Address, useAccount, useContractReads } from 'wagmi'

import { accessControlFacetABI } from '@/lib/blockchain'

export const ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000'

export function useHasRole({ tokenAddress, accountAddress, watch }: { tokenAddress: Address; accountAddress?: Address; watch?: boolean }): {
  [key: string]: boolean | null
} {
  const tokenContract = {
    address: tokenAddress,
    abi: accessControlFacetABI,
  }
  const account = useAccount()
  const { data } = useContractReads({
    contracts: [
      {
        ...tokenContract,
        functionName: 'hasRole',
        args: [keccak256(toHex('AllowlistFacet.COMPONENT_ROLE')), accountAddress ?? account.address ?? '0x'],
      },
      {
        ...tokenContract,
        functionName: 'hasRole',
        args: [keccak256(toHex('EnglishPeriodicAuctionFacet.COMPONENT_ROLE')), accountAddress ?? account.address ?? '0x'],
      },
      {
        ...tokenContract,
        functionName: 'hasRole',
        args: [keccak256(toHex('IDABeneficiaryFacet.COMPONENT_ROLE')), accountAddress ?? account.address ?? '0x'],
      },
      {
        ...tokenContract,
        functionName: 'hasRole',
        args: [keccak256(toHex('StewardLicenseBase.ADD_TOKEN_TO_COLLECTION_ROLE')), accountAddress ?? account.address ?? '0x'],
      },
      {
        ...tokenContract,
        functionName: 'hasRole',
        args: [keccak256(toHex('PeriodicPCOParamsFacet.COMPONENT_ROLE')), accountAddress ?? account.address ?? '0x'],
      },
      {
        ...tokenContract,
        functionName: 'hasRole',
        args: [ADMIN_ROLE, accountAddress ?? account.address ?? '0x'],
      },
    ],
    watch: watch ?? false,
  })

  const hasAllowlistRole = data && data[0].status === 'success' ? data[0].result : null
  const hasAuctionRole = data && data[1].status === 'success' ? data[1].result : null
  const hasBeneficiaryRole = data && data[2].status === 'success' ? data[2].result : null
  const hasAddTokenToCollectionRole = data && data[3].status === 'success' ? data[3].result : null
  const hasPcoParamsRole = data && data[4].status === 'success' ? data[4].result : null
  const hasAdminRole = data && data[5].status === 'success' ? data[5].result : null

  return { hasAllowlistRole, hasAuctionRole, hasBeneficiaryRole, hasAddTokenToCollectionRole, hasPcoParamsRole, hasAdminRole }
}

export function useGetRoleMemberCount({ tokenAddress, watch }: { tokenAddress: Address; watch?: boolean }): { [key: string]: bigint | null } {
  const tokenContract = {
    address: tokenAddress,
    abi: accessControlFacetABI,
  }
  const { data } = useContractReads({
    contracts: [
      {
        ...tokenContract,
        functionName: 'getRoleMemberCount',
        args: [keccak256(toHex('AllowlistFacet.COMPONENT_ROLE'))],
      },
      {
        ...tokenContract,
        functionName: 'getRoleMemberCount',
        args: [keccak256(toHex('EnglishPeriodicAuctionFacet.COMPONENT_ROLE'))],
      },
      {
        ...tokenContract,
        functionName: 'getRoleMemberCount',
        args: [keccak256(toHex('IDABeneficiaryFacet.COMPONENT_ROLE'))],
      },
      {
        ...tokenContract,
        functionName: 'getRoleMemberCount',
        args: [keccak256(toHex('StewardLicenseBase.ADD_TOKEN_TO_COLLECTION_ROLE'))],
      },
      {
        ...tokenContract,
        functionName: 'getRoleMemberCount',
        args: [keccak256(toHex('PeriodicPCOParamsFacet.COMPONENT_ROLE'))],
      },
      {
        ...tokenContract,
        functionName: 'getRoleMemberCount',
        args: [ADMIN_ROLE],
      },
    ],
    watch: watch ?? false,
  })

  const allowlist = data && data[0].status === 'success' ? data[0].result : null
  const auction = data && data[1].status === 'success' ? data[1].result : null
  const beneficiary = data && data[2].status === 'success' ? data[2].result : null
  const addTokenToCollection = data && data[3].status === 'success' ? data[3].result : null
  const pcoParams = data && data[4].status === 'success' ? data[4].result : null
  const adminRole = data && data[5].status === 'success' ? data[5].result : null

  return { allowlist, auction, beneficiary, addTokenToCollection, pcoParams, adminRole }
}

export function useGetRoleMember({ tokenAddress, index, watch }: { tokenAddress: Address; index: bigint; watch?: boolean }): {
  [key: string]: Address | null
} {
  const tokenContract = {
    address: tokenAddress,
    abi: accessControlFacetABI,
  }
  const { data } = useContractReads({
    contracts: [
      {
        ...tokenContract,
        functionName: 'getRoleMember',
        args: [keccak256(toHex('AllowlistFacet.COMPONENT_ROLE')), index],
      },
      {
        ...tokenContract,
        functionName: 'getRoleMember',
        args: [keccak256(toHex('EnglishPeriodicAuctionFacet.COMPONENT_ROLE')), index],
      },
      {
        ...tokenContract,
        functionName: 'getRoleMember',
        args: [keccak256(toHex('IDABeneficiaryFacet.COMPONENT_ROLE')), index],
      },
      {
        ...tokenContract,
        functionName: 'getRoleMember',
        args: [keccak256(toHex('StewardLicenseBase.ADD_TOKEN_TO_COLLECTION_ROLE')), index],
      },
      {
        ...tokenContract,
        functionName: 'getRoleMember',
        args: [keccak256(toHex('PeriodicPCOParamsFacet.COMPONENT_ROLE')), index],
      },
      {
        ...tokenContract,
        functionName: 'getRoleMember',
        args: [ADMIN_ROLE, index],
      },
    ],
    watch: watch ?? false,
  })

  const allowlist = data && data[0].status === 'success' ? data[0].result : null
  const auction = data && data[1].status === 'success' ? data[1].result : null
  const beneficiary = data && data[2].status === 'success' ? data[2].result : null
  const addTokenToCollection = data && data[3].status === 'success' ? data[3].result : null
  const pcoParams = data && data[4].status === 'success' ? data[4].result : null
  const adminRole = data && data[5].status === 'success' ? data[5].result : null

  return { allowlist, auction, beneficiary, addTokenToCollection, pcoParams, adminRole }
}
