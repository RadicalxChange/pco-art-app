import { defineConfig } from '@wagmi/cli'
import { react } from '@wagmi/cli/plugins'
import { erc20ABI } from 'wagmi'
import SingleCutDiamondABI from './abi/SingleCutDiamond.json'
import AllowlistFacetABI from './abi/AllowlistFacet.json'
import BeaconDiamond from './abi/BeaconDiamond.json'
import EnglishPeriodicAuctionFacet from './abi/EnglishPeriodicAuctionFacet.json'
import IDABeneficiaryFacet from './abi/IDABeneficiaryFacet.json'
import NativeStewardLicenseFacet from './abi/NativeStewardLicenseFacet.json'
import PeriodicPCOParamsFacet from './abi/PeriodicPCOParamsFacet.json'
import WrappedERC721StewardLicenseFacet from './abi/WrappedERC721StewardLicenseFacet.json'
import WrappedERC1155StewardLicenseFacet from './abi/WrappedERC1155StewardLicenseFacet.json'
import AccessControlFacet from './abi/AccessControlFacet.json'
import SingleCutDiamondFactoryABI from './abi/SingleCutDiamondFactory.json'
import OwnableDiamondFactoryABI from './abi/OwnableDiamondFactory.json'

export default defineConfig({
  out: 'lib/blockchain.ts',
  contracts: [
    {
      name: 'erc20',
      abi: erc20ABI,
    },
    {
      name: 'ethX',
      abi: erc20ABI,
      address: {
        100: '0x59988e47A3503AaFaA0368b9deF095c818Fdca01',
        420: '0xe01f8743677da897f4e7de9073b57bf034fc2433',
      },
    },
    {
      name: 'SingleCutDiamond',
      // @ts-ignore
      abi: SingleCutDiamondABI,
    },
    {
      name: 'BeaconDiamond',
      // @ts-ignore
      abi: BeaconDiamond,
    },
    {
      name: 'AllowlistFacet',
      // @ts-ignore
      abi: AllowlistFacetABI,
      address: {
        100: '0xe8393C4ea1Bd9D5fB81E17dA4D035D3Db714Ef96',
        420: '0x7de98C2da754c0efC402A81eC6D8197221b3f480',
      },
    },
    {
      name: 'EnglishPeriodicAuctionFacet',
      // @ts-ignore
      abi: EnglishPeriodicAuctionFacet,
      address: {
        100: '0xeA45b8aE461c840c1B2965ffeDA5C2a11594E1c1',
        420: '0x59aEeFC8421D59f260a5E5b959BFcc86B59C8415',
      },
    },
    {
      name: 'IDABeneficiaryFacet',
      // @ts-ignore
      abi: IDABeneficiaryFacet,
      address: {
        100: '0x59aEeFC8421D59f260a5E5b959BFcc86B59C8415',
        420: '0xebe5138a89B27A95199B54130bC18234bcD0A1c1',
      },
    },
    {
      name: 'NativeStewardLicenseFacet',
      // @ts-ignore
      abi: NativeStewardLicenseFacet,
      address: {
        100: '0x3A62C85a8629f81124E2dBA3FaBE63880533D5D7',
        420: '0x083B29783A15c1207428D9A382Eaa7557D0E6A82',
      },
    },
    {
      name: 'PeriodicPCOParamsFacet',
      // @ts-ignore
      abi: PeriodicPCOParamsFacet,
      address: {
        100: '0xFfbd1FF3cEc7B5Ae502f1E62c7E1291C3110Da8C',
        420: '0x235d1DeaFd6097066c75Da0147E026daA1bD6166',
      },
    },
    {
      name: 'WrappedERC721StewardLicenseFacet',
      // @ts-ignore
      abi: WrappedERC721StewardLicenseFacet,
      address: {
        100: '0x3e5D445B6C0F095121EBc91D55C386f195Ff1Af4',
        420: '0xAa23A59F83de01dD06D7E125cd2acB911147A06F',
      },
    },
    {
      name: 'WrappedERC1155StewardLicenseFacet',
      // @ts-ignore
      abi: WrappedERC1155StewardLicenseFacet,
      address: {
        100: '0xc749Ac2EA598D55D43A2FfEcB1D0753D7a9Ec560',
        420: '0xD865a309A3B3f646C21426DF127EBa272410D8b9',
      },
    },
    {
      name: 'AccessControlFacet',
      // @ts-ignore
      abi: AccessControlFacet,
      address: { 100: '0xc90eDF9848f8dcf557e83Bc2020B6F7d286321B5', 420: '0x204EFCebEc7F95f89019F64521ee1413B22E5Efe' },
    },
    {
      name: 'SingleCutDiamondFactory',
      // @ts-ignore
      abi: SingleCutDiamondFactoryABI,
      address: {
        100: '0x44FC178BA2361b25f3C6D6FDcAc20F80d0961FB0',
        420: '0xaDD2eFb7f87Db4003c50d4aE60Bcc82b255F9222',
      },
    },
    {
      name: 'OwnableDiamondFactoryABI',
      // @ts-ignore
      abi: OwnableDiamondFactoryABI,
      address: {
        100: '0xd75292Ce17Ed419C6231FBc73E54356F30803e5F',
        420: '0xCaEDD50B68eFF37A068D90113F5AC6110E3162e1',
      },
    },
  ],
  plugins: [react()],
})
