import { useCallback } from "react";
import { useAccount, useConnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
// import { useWallet } from '@/utils/walletProvider';

import { secondaryBtnClasses } from "./Styles";

export const WalletButtons = () => {
  const { connectors, connect } = useConnect();
  const account = useAccount();

  const createWallet = useCallback(() => {
    const coinbaseWalletConnector = connectors.find(
      (connector) => connector.id === "coinbaseWalletSDK",
    );
    if (coinbaseWalletConnector) {
      connect({ connector: coinbaseWalletConnector });
    }
  }, [connectors, connect]);
console.log(account.isConnected )
  return (
    <>
      <ConnectButton
        accountStatus={{
          smallScreen: "avatar",
          largeScreen: "full",
        }}
        chainStatus={"none"}
        label={"Connect EVM walllet"}
        showBalance={false}
      />

          </>
  );
};
