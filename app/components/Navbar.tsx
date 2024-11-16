"use client";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ThemeSwitch } from "./ThemeSwitch";
import { WalletButtons } from "./WalletButtons";
import { PaycrestLogo } from "./ImageAssets";
import Image from "next/image";
import { Button, Modal, Avatar } from "antd";
import { useWallet } from "../utils/walletProvider";
import { ConnectButton } from "@rainbow-me/rainbowkit";


export const Navbar = () => {
  const account = useAccount();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const { connectWallet, disconnectWallet, walletData } = useWallet();

  useEffect(() => {
    if (account.isConnected || walletData.isConnected) {
      // Close modals when wallet is connected
      setIsConnectModalOpen(false);
      setIsWalletModalOpen(false);
    }
  }, [account.isConnected, walletData.isConnected]);
  
console.log(walletData.isConnected)
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;


  const walletOptions = [
    {
      name: "Tap Wallet",
      installed: typeof window !== "undefined" && !!window.tapwallet,
      installLink: "https://tapwallet.io",
      logo: "https://tapwallet.io/static/media/logo.e12ac5ee857670720904.png",
    },

    {
      name: "Unisats",
      installed: typeof window !== "undefined" && !!window.unisat,
      installLink: "https://unisat.io/",
      logo: "https://pbs.twimg.com/profile_images/1635946239555674112/fA12aBLU_400x400.jpg",
    },
    // {
    //   name: "MetaMask",
    //   installed: typeof window !== "undefined" && !!window.ethereum,
    //   installLink: "https://metamask.io/",
    //   logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/2048px-MetaMask_Fox.svg.png",
    // },
  ];

  const closeAllModals = () => {
    setIsConnectModalOpen(false);
    setIsWalletModalOpen(false);
  };

  const handleConnectWallet = (wallet) => {
    if (!wallet) {
      console.error("Wallet is undefined");
      return;
    }
    try {
      connectWallet(wallet);
      setIsConnectModalOpen(false);
    setIsWalletModalOpen(false);
    } catch (error) {
      console.error("Error connecting to wallet:", error);
    }
  };

  const openWalletModal = () => {
    setIsWalletModalOpen(true);
    setIsConnectModalOpen(false);
  };

  return (
    <header className="fixed left-0 top-0 z-20 w-full bg-white transition-all dark:bg-neutral-900">
      <nav
        className="container mx-auto flex items-center justify-between p-4 text-neutral-900 dark:text-white lg:px-8"
        aria-label="Navbar"
      >
        <div className="flex lg:flex-1">
          <Link href="/" className="flex items-center gap-1">
            <Image
              src="/ordilink.png"
              width={20}
              height={20}
              alt="Ordilink_logo"
            />
            <div className="text-lg font-semibold">Zap by Ordilink</div>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3 text-sm">
          <div className="flex">
            {/* Display connected wallet address or a placeholder */}
            

            {/* Wallet Buttons: Show Disconnect or Connect button based on connected state */}
            {account.isConnected ? (
             
             <WalletButtons />

            ) : walletData.isConnected ? (
              <Button
                style={{ backgroundColor: "#FF3B3B" }}
                onClick={disconnectWallet}
                className="text-white"
              >
                Disconnect Wallet
              </Button>
            ) : (
              <Button
                style={{ backgroundColor: "#05CFB2", color: "white" }}
                onClick={() => setIsConnectModalOpen(true)}
              >
                Connect Wallet
              </Button>
            )}
          </div>
          {/* <Button
                style={{ backgroundColor: "#05CFB2", color: "white" }}
                onClick={() => setIsConnectModalOpen(true)}
              >
                Connect Wallet
              </Button> */}
          <div className={`${account.isConnected ? "" : "block"}`}>
            <ThemeSwitch />
          </div>
        </div>
      </nav>

      {/* Initial Modal: Choose Wallet */}
      <Modal
  title="Select a Wallet"
  open={isConnectModalOpen}
  onCancel={closeAllModals}
  centered
  footer={null}
  className="custom-dark-modal"  // Add custom class for styling
>
  <div className="flex flex-col gap-8 px-20 py-10">
    {/* Show RainbowKit WalletButtons only if connected */}
    <Button style={{ backgroundColor: "transparent", color: "white" }} className="p-4 border-t-0 border-b-1 border-x-0">
      <WalletButtons/>
    </Button>

    {/* Show other wallet options if not connected */}
    <Button
      style={{ backgroundColor: "#05CFB2", color: "white" }}
      onClick={openWalletModal}
      className="p-3"
    >
      Tap Wallets
    </Button>
    

  </div>
</Modal>

<Modal
  title="Connect Tap Wallet"
  open={isWalletModalOpen}
  onCancel={closeAllModals}
  centered
  footer={null}
  className="custom-dark-modal"  // Add custom class for styling
>
  <ul className="flex w-full text-white flex-col gap-4 py-10 px-10 lg:px-20">
    {walletOptions.map((wallet, index) => (
      <li key={index} className="w-full ">
        <button
          disabled={!wallet.installed}
          onClick={() => wallet.installed && handleConnectWallet(wallet)}
          className="w-full"
        >
          <span
            className="flex w-full gap-4 rounded-xl p-3"
            style={{ backgroundColor: "#3C3C3A", border: "none" }}
          >
            <Avatar src={wallet.logo} />
            <span className="my-auto">
              {wallet.name} {wallet.installed ? "" : " (Not Installed)"}
            </span>
          </span>
        </button>
      </li>
    ))}
  </ul>
</Modal>

    </header>
  );
};
