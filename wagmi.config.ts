import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import { erc20ABI } from "wagmi";
import SingleCutDiamondABI from "./abi/SingleCutDiamond.json";
import AllowlistFacetABI from "./abi/AllowlistFacet.json";
import BeaconDiamond from "./abi/BeaconDiamond.json";
import EnglishPeriodicAuctionFacet from "./abi/EnglishPeriodicAuctionFacet.json";
import IDABeneficiaryFacet from "./abi/IDABeneficiaryFacet.json";
import NativeStewardLicenseFacet from "./abi/NativeStewardLicenseFacet.json";
import PeriodicPCOParamsFacet from "./abi/PeriodicPCOParamsFacet.json";
import WrappedERC721StewardLicenseFacet from "./abi/WrappedERC721StewardLicenseFacet.json";
import WrappedERC1155StewardLicenseFacet from "./abi/WrappedERC1155StewardLicenseFacet.json";
import AccessControlFacet from "./abi/AccessControlFacet.json";
import SingleCutDiamondFactoryABI from "./abi/SingleCutDiamondFactory.json";
import OwnableDiamondFactoryABI from "./abi/OwnableDiamondFactory.json";

export default defineConfig({
  out: "lib/blockchain.ts",
  contracts: [
    {
      name: "erc20",
      abi: erc20ABI,
    },
    {
      name: "ethX",
      abi: erc20ABI,
      address: {
        100: "0x59988e47A3503AaFaA0368b9deF095c818Fdca01",
        11155420: "0x0043d7c85C8b96a49A72A92C0B48CdC4720437d7",
      },
    },
    {
      name: "SingleCutDiamond",
      // @ts-ignore
      abi: SingleCutDiamondABI,
    },
    {
      name: "BeaconDiamond",
      // @ts-ignore
      abi: BeaconDiamond,
    },
    {
      name: "AllowlistFacet",
      // @ts-ignore
      abi: AllowlistFacetABI,
      address: {
        100: "0xe8393C4ea1Bd9D5fB81E17dA4D035D3Db714Ef96",
        11155420: "0xf7800284309faA8BF0D4b1fa10B0192c2a1336ff",
      },
    },
    {
      name: "EnglishPeriodicAuctionFacet",
      // @ts-ignore
      abi: EnglishPeriodicAuctionFacet,
      address: {
        100: "0xeA45b8aE461c840c1B2965ffeDA5C2a11594E1c1",
        11155420: "0xD0c22495c5C39faf0061d92Aa1D467303E715147",
      },
    },
    {
      name: "IDABeneficiaryFacet",
      // @ts-ignore
      abi: IDABeneficiaryFacet,
      address: {
        100: "0x59aEeFC8421D59f260a5E5b959BFcc86B59C8415",
        11155420: "0x01D300492Ed14BF0965ceD7Ad5de1F48Bc5DC17A",
      },
    },
    {
      name: "NativeStewardLicenseFacet",
      // @ts-ignore
      abi: NativeStewardLicenseFacet,
      address: {
        100: "0x3A62C85a8629f81124E2dBA3FaBE63880533D5D7",
        11155420: "0x679C23c0E16DCDf2111256689078Ec50121f2A0F",
      },
    },
    {
      name: "PeriodicPCOParamsFacet",
      // @ts-ignore
      abi: PeriodicPCOParamsFacet,
      address: {
        100: "0xFfbd1FF3cEc7B5Ae502f1E62c7E1291C3110Da8C",
        11155420: "0x53e0115b48E25FCd18a756Fe4FAf3d083e91eF33",
      },
    },
    {
      name: "WrappedERC721StewardLicenseFacet",
      // @ts-ignore
      abi: WrappedERC721StewardLicenseFacet,
      address: {
        100: "0x3e5D445B6C0F095121EBc91D55C386f195Ff1Af4",
        11155420: "0x8f0fF28Ce206C12248bBa64D7f72Fc6959a2717e",
      },
    },
    {
      name: "WrappedERC1155StewardLicenseFacet",
      // @ts-ignore
      abi: WrappedERC1155StewardLicenseFacet,
      address: {
        100: "0xc749Ac2EA598D55D43A2FfEcB1D0753D7a9Ec560",
        11155420: "0x2B24b289dD3A8FD13a2E88d09E92a8a027f96E20",
      },
    },
    {
      name: "AccessControlFacet",
      // @ts-ignore
      abi: AccessControlFacet,
      address: {
        100: "0xc90eDF9848f8dcf557e83Bc2020B6F7d286321B5",
        11155420: "0xd4EEeDa989CcbE378A1c2863BF6C8395428C2bf4",
      },
    },
    {
      name: "SingleCutDiamondFactory",
      // @ts-ignore
      abi: SingleCutDiamondFactoryABI,
      address: {
        100: "0x44FC178BA2361b25f3C6D6FDcAc20F80d0961FB0",
        11155420: "0x5B02B3249D2a135A9Caa6E5E9a911CD5F91057E8",
      },
    },
    {
      name: "OwnableDiamondFactoryABI",
      // @ts-ignore
      abi: OwnableDiamondFactoryABI,
      address: {
        100: "0xd75292Ce17Ed419C6231FBc73E54356F30803e5F",
        11155420: "0x5e713Bf2B84303f004464CC624FCF713cB0c0131",
      },
    },
  ],
  plugins: [react()],
});
