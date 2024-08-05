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
                    <PlusSignAnimated>
                      <button
                        className={classNameConnect}
                        onClick={openConnectModal}
                      >
                        {labelConnect}
                      </button>
                    </PlusSignAnimated>
                  </>
                );
              }

              if (chain.unsupported) {
                return (
                  <PlusSignAnimated>
                    <button className="flex gap-1.5" onClick={openChainModal}>
                      {labelWrongNetwork}
                    </button>
                  </PlusSignAnimated>
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
                    <div className="flex gap-1.5">{account.displayName}</div>
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
