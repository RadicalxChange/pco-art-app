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
        11155420: "0xf7800284309faA8BF0D4b1fa10B0192c2a1336ff",
      },
    },
    {
      name: "EnglishPeriodicAuctionFacet",
      // @ts-ignore
      abi: EnglishPeriodicAuctionFacet,
      address: {
        11155420: "0xEB3Cf7984A793c2F7a3d50E1ebA3d9586F8f14eD",
      },
    },
    {
      name: "IDABeneficiaryFacet",
      // @ts-ignore
      abi: IDABeneficiaryFacet,
      address: {
        11155420: "0x01D300492Ed14BF0965ceD7Ad5de1F48Bc5DC17A",
      },
    },
    {
      name: "NativeStewardLicenseFacet",
      // @ts-ignore
      abi: NativeStewardLicenseFacet,
      address: {
        11155420: "0x103d07c490ea1B466FdcE499fb1318116989643B",
      },
    },
    {
      name: "PeriodicPCOParamsFacet",
      // @ts-ignore
      abi: PeriodicPCOParamsFacet,
      address: {
        11155420: "0xa8bC8735c7339a9C254C51C7D24763c8f52c8459",
      },
    },
    {
      name: "WrappedERC721StewardLicenseFacet",
      // @ts-ignore
      abi: WrappedERC721StewardLicenseFacet,
      address: {
        11155420: "0x5615659B54358AC394CC890a11b2a7f8a277CaaB",
      },
    },
    {
      name: "WrappedERC1155StewardLicenseFacet",
      // @ts-ignore
      abi: WrappedERC1155StewardLicenseFacet,
      address: {
        11155420: "0xeaf22CcBCA3b065F152C2CCeEFFC3C38b3CC106b",
      },
    },
    {
      name: "AccessControlFacet",
      // @ts-ignore
      abi: AccessControlFacet,
      address: {
        11155420: "0xd4EEeDa989CcbE378A1c2863BF6C8395428C2bf4",
      },
    },
    {
      name: "SingleCutDiamondFactory",
      // @ts-ignore
      abi: SingleCutDiamondFactoryABI,
      address: {
        11155420: "0x5B02B3249D2a135A9Caa6E5E9a911CD5F91057E8",
      },
    },
    {
      name: "OwnableDiamondFactoryABI",
      // @ts-ignore
      abi: OwnableDiamondFactoryABI,
      address: {
        11155420: "0x5e713Bf2B84303f004464CC624FCF713cB0c0131",
      },
    },
  ],
  plugins: [react()],
});
