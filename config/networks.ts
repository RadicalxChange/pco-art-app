// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Networks
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
import { gnosis, base, hardhat } from "@wagmi/chains";
import { Chain, configureChains } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";

import { env } from "@/env.mjs";

// @ts-ignore
gnosis.iconUrl = "/icons/NetworkGnosis.svg";

export const optimismSepolia = {
  id: 11155420,
  name: "OP Sepolia",
  network: "optimism-sepolia",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
  },
  rpcUrls: {
    public: { http: ["https://optimism-sepolia-rpc.publicnode.com"] },
    default: { http: ["https://optimism-sepolia-rpc.publicnode.com"] },
  },
  blockExplorers: {
    etherscan: {
      name: "Etherscan",
      url: "https://sepolia-optimism.etherscan.io",
    },
    default: {
      name: "Etherscan",
      url: "https://sepolia-optimism.etherscan.io",
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 11620204,
    },
  },
} as const satisfies Chain;

const CHAINS_SUPPORTED_BY_ALCHEMY = [gnosis, optimismSepolia];
const CHAINS_SUPPORTED_BY_INFURA = [gnosis, optimismSepolia];
const CHAINS_SUPPORTED_BY_PUBLIC_PROVIDER = [gnosis, optimismSepolia];
const CHAINS_SUPPORTED_BY_HARDHAT = [hardhat];

const PROVIDERS = [];
const CHAINS = [];

if (env.NEXT_PUBLIC_ALCHEMY_API_KEY) {
  CHAINS.push(...CHAINS_SUPPORTED_BY_ALCHEMY);
  PROVIDERS.push(
    alchemyProvider({
      apiKey: env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    })
  );
}

if (env.NEXT_PUBLIC_INFURA_API_KEY) {
  CHAINS.push(...CHAINS_SUPPORTED_BY_INFURA);
  PROVIDERS.push(
    infuraProvider({
      apiKey: env.NEXT_PUBLIC_INFURA_API_KEY,
    })
  );
}

if (env.NEXT_PUBLIC_USE_HARDHAT_PROVIDER === "true") {
  CHAINS.push(...CHAINS_SUPPORTED_BY_HARDHAT);
  PROVIDERS.push(publicProvider());
}

// Include public provider if no other providers are available.
if (env.NEXT_PUBLIC_USE_PUBLIC_PROVIDER === "true" || PROVIDERS.length === 0) {
  CHAINS.push(...CHAINS_SUPPORTED_BY_PUBLIC_PROVIDER);
  PROVIDERS.push(publicProvider());
}

// deduplicate chains
const UNIQUE_CHAINS = [...new Set(CHAINS)];

export const { chains, publicClient, webSocketPublicClient } = configureChains(
  UNIQUE_CHAINS,
  // @ts-ignore
  [...PROVIDERS]
);
