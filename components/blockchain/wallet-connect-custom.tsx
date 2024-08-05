"use client";
import * as React from "react";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import PlusSignAnimated from "@/components/shared/plus-sign-animated";

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
  classNameConnect = "",
  classNameConnected = "",
  classNameWrongNetwork = "",
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
                    <button
                      className={classNameConnect}
                      onClick={openConnectModal}
                    >
                      <PlusSignAnimated>
                        <span>{labelConnect}</span>
                      </PlusSignAnimated>
                    </button>
                  </>
                );
              }

              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal}>
                    <PlusSignAnimated>
                      <span>{labelWrongNetwork}</span>
                    </PlusSignAnimated>
                  </button>
                );
              }

              return (
                <button onClick={openAccountModal} className="flex gap-7">
                  <PlusSignAnimated>
                    <div className="flex gap-1.5">
                      {account.displayBalance
                        ? ` ${account.displayBalance}`
                        : ""}
                    </div>
                  </PlusSignAnimated>
                  <PlusSignAnimated>
                    <span>{account.displayName}</span>
                  </PlusSignAnimated>
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
