'use client'

import React, { createContext, useState, useContext } from 'react';
import { toast } from 'react-toastify';

// Create a context for wallet data
const WalletContext = createContext();

// Create a provider component
export const WalletProvider = ({ children }) => {

  const [walletData, setWalletData] = useState({
    account: null,
    balance: null,
    walletInstalled: false,
    isConnected: false
  });

  // Function to connect wallet
  const [isDisconnected, setIsDisconnected] = useState(false); // Track disconnection status

  const connectWallet = async (wallet, onClose) => {
    try {
      let accounts;
      let fetchedBalance;
  
      // For MetaMask
      if (wallet.name === 'MetaMask' && window.ethereum) {
        accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('MetaMask account:', accounts[0]);
  
        // Force the signing process (a simple signature to confirm connection)
        await window.ethereum.request({
          method: 'personal_sign',
          params: [accounts[0], "Please sign to confirm your wallet connection"],
        });
        
        fetchedBalance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [accounts[0], 'latest'],
        });
      }
  
      // For Tap Wallet - Adjusting for potential API differences
      else if (wallet.name === 'Tap Wallet' && window.tapwallet) {
        if (typeof window.tapwallet.requestAccounts !== 'function') {
          throw new Error('Tap Wallet does not support requestAccounts method');
        }
        
        // Using Tap Wallet's specific method to request accounts
        accounts = await window.tapwallet.requestAccounts();
        console.log('Tap Wallet accounts:', accounts);
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts returned from Tap Wallet');
        }
  
        // If Tap Wallet has no direct method for signing, you might want to request a signature like this (if supported):
        if (window.tapwallet.signMessage) {
          await window.tapwallet.signMessage("Please sign to confirm your wallet connection");
        } else {
          // Fallback if no signing method is available
          console.log("Tap Wallet does not support message signing.");
        }
  
        fetchedBalance = await window.tapwallet.getBalance();
      }
  
      // For Unisats Wallet - Fixing issue with request method
      else if (wallet.name === 'Unisats' && window.unisat) {
        if (typeof window.unisat.getAccounts !== 'function') {
          throw new Error('Unisats does not support getAccounts method');
        }
  
        // Request accounts with Unisats method
        accounts = await window.unisat.getAccounts();
        console.log('Unisats account:', accounts[0]);
  
        // You might need to use another method like signMessage if available
        if (window.unisat.signMessage) {
          await window.unisat.signMessage("Please sign to confirm your wallet connection");
        } else {
          console.log("Unisats does not support message signing.");
        }
  
        // Fetch balance using Unisats method
        fetchedBalance = await window.unisat.getBalance();
      }
  
      // Store wallet data after connection
      setWalletData({
        account: accounts[0],
        balance: fetchedBalance,
        walletInstalled: true,
        isConnected: true
      });
  
      toast.success("Wallet connected");
  
      if (onClose) {
        onClose(); // Close modal if it's passed
      }
    } catch (error) {
      console.error('Error connecting to wallet:', error);
  
      setWalletData({
        account: null,
        balance: null,
        walletInstalled: false,
      });
    }
  };
  
  // Function to disconnect wallet
  const disconnectWallet = () => {
    setWalletData({
      account: null,
      balance: null,
      walletInstalled: false,
      isConnected: false
    });
    toast.info("Wallet disconnected");

  };
  
  
  

  return (
    <WalletContext.Provider value={{ walletData, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to use wallet context
export const useWallet = () => useContext(WalletContext);
