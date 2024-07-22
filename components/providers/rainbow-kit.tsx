"use client";
import "@rainbow-me/rainbowkit/styles.css";
import { ReactNode } from "react";

import {
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { WagmiConfig, createConfig } from "wagmi";

import { chains, publicClient, webSocketPublicClient } from "@/config/networks";
import { siteConfig } from "@/config/site";
import { env } from "@/env.mjs";
import { useColorMode } from "@/lib/state/color-mode";

interface Props {
  children: ReactNode;
  autoConnect?: boolean;
}

const projectId = env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      injectedWallet({ chains }),
      metaMaskWallet({ chains, projectId }),
      rainbowWallet({ chains, projectId }),
      coinbaseWallet({ chains, appName: siteConfig.name }),
      walletConnectWallet({ chains, projectId }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export function RainbowKit(props: Props) {
  const [colorMode] = useColorMode();
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        theme={colorMode == "dark" ? darkTheme() : lightTheme()}
      >
        {props.children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
