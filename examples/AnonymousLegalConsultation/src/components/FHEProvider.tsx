'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createFhevmInstance } from '@fhevm/sdk';
import type { FhevmInstance } from '@fhevm/sdk';

interface FHEConfig {
  chainId: number;
  networkName?: string;
  rpcUrl?: string;
}

interface FHEContextValue {
  isReady: boolean;
  isInitializing: boolean;
  error: Error | null;
  instance: FhevmInstance | null;
  config: FHEConfig | null;
  init: () => Promise<void>;
}

const FHEContext = createContext<FHEContextValue | undefined>(undefined);

interface FHEProviderProps {
  children: React.ReactNode;
  config: FHEConfig;
  autoInit?: boolean;
}

export function FHEProvider({ children, config, autoInit = false }: FHEProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [instance, setInstance] = useState<FhevmInstance | null>(null);

  const init = async () => {
    if (isReady || isInitializing) {
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      const fhevmInstance = createFhevmInstance({
        chainId: config.chainId,
        networkName: config.networkName || 'Zama Devnet',
        rpcUrl: config.rpcUrl,
      });

      setInstance(fhevmInstance);
      setIsReady(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize FHEVM');
      setError(error);
      console.error('FHE Provider initialization error:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (autoInit && !isReady && !isInitializing) {
      init();
    }
  }, [autoInit, isReady, isInitializing]);

  const value: FHEContextValue = {
    isReady,
    isInitializing,
    error,
    instance,
    config,
    init,
  };

  return <FHEContext.Provider value={value}>{children}</FHEContext.Provider>;
}

export function useFHEContext(): FHEContextValue {
  const context = useContext(FHEContext);

  if (context === undefined) {
    throw new Error('useFHEContext must be used within an FHEProvider');
  }

  return context;
}
