// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Networks
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
import { gnosis, hardhat } from "@wagmi/chains";
import { configureChains } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";

import { env } from "@/env.mjs";

// @ts-ignore
gnosis.iconUrl = "/icons/NetworkGnosis.svg";

export const { chains, publicClient, webSocketPublicClient } = configureChains(
  [gnosis],
  [publicProvider()]
);
