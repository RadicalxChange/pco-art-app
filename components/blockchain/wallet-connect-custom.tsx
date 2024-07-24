"use client";
import * as React from "react";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import CrossIcon from "@/components/shared/cross-icon";

interface WalletConnectCustomProps {
  className?: string;
  classNameConnect?: string;
  classNameConnected?: string;
  classNameWrongNetwork?: string;
  labelConnect?: string;
  labelWrongNetwork?: string;
}

export const WalletConnectCustom = ({
  className,
  classNameConnect = "btn btn-primary w-full",
  classNameConnected = "btn btn-primary w-full",
  classNameWrongNetwork = "btn btn-red w-full",
  labelConnect = "Connect Wallet",
  labelWrongNetwork = "Wrong Network",
}: WalletConnectCustomProps) => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
      }) => {
        const connected =
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div className={className}>
            {(() => {
              if (!connected) {
                return (
                  <>
                    <CrossIcon />
                    <button
                      className={classNameConnect}
                      onClick={openConnectModal}
                      type="button"
                    >
                      {labelConnect}
                    </button>
                  </>
                );
              }

              if (chain.unsupported) {
                return (
                  <button className="flex gap-1.5" onClick={openChainModal}>
                    <CrossIcon />
                    {labelWrongNetwork}
                  </button>
                );
              }

              return (
                <button onClick={openAccountModal} className="flex gap-7">
                  <div className="flex gap-1.5">
                    <CrossIcon />
                    {account.displayBalance ? ` ${account.displayBalance}` : ""}
                  </div>
                  <div className="flex gap-1.5">
                    <CrossIcon />
                    {account.displayName}
                  </div>
                </button>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default WalletConnectCustom;
