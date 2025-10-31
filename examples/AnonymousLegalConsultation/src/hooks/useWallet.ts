'use client';

import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, EXPECTED_CHAIN_ID } from '@/lib/contract';

export function useWallet() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        await connectWallet();
      }
    } catch (err) {
      console.log('Wallet not connected');
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('Please install MetaMask wallet');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const userAccount = accounts[0];
      const web3Provider = new BrowserProvider(window.ethereum);
      const signer = await web3Provider.getSigner();
      const contractInstance = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Check network
      const network = await web3Provider.getNetwork();
      if (Number(network.chainId) !== EXPECTED_CHAIN_ID) {
        setError(`Please switch to Zama Devnet (Chain ID: ${EXPECTED_CHAIN_ID})`);
      }

      setProvider(web3Provider);
      setContract(contractInstance);
      setAccount(userAccount);
      setIsConnected(true);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMsg);
      console.error('Wallet connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setContract(null);
    setAccount(null);
    setIsConnected(false);
    setError(null);
  }, []);

  useEffect(() => {
    checkConnection();

    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [checkConnection, disconnectWallet]);

  return {
    provider,
    contract,
    account,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
  };
}
