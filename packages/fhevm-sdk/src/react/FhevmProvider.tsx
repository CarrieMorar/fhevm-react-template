/**
 * FHEVM Provider for React applications
 * Provides FHEVM context to all child components
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BrowserProvider } from 'ethers';
import { createFhevmInstance, FhevmClient } from '../core/fhevm-client';
import type { FhevmProviderProps, FhevmContextValue } from './types';

const FhevmContext = createContext<FhevmContextValue | null>(null);

/**
 * FHEVM Provider Component
 *
 * @example
 * ```tsx
 * <FhevmProvider config={{ chainId: 9000 }} autoInit>
 *   <App />
 * </FhevmProvider>
 * ```
 */
export function FhevmProvider({ config, children, autoInit = false }: FhevmProviderProps) {
  const [client] = useState(() => createFhevmInstance(config));
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const init = useCallback(async () => {
    if (isInitialized || isInitializing) {
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      // Try to get provider from window.ethereum
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const provider = new BrowserProvider((window as any).ethereum);
        await client.init(provider);
      } else {
        await client.init();
      }

      setIsInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to initialize FHEVM'));
    } finally {
      setIsInitializing(false);
    }
  }, [client, isInitialized, isInitializing]);

  const getPublicKey = useCallback(() => {
    if (!isInitialized) {
      return null;
    }
    try {
      return client.getPublicKey();
    } catch {
      return null;
    }
  }, [client, isInitialized]);

  useEffect(() => {
    if (autoInit) {
      init();
    }
  }, [autoInit, init]);

  const value: FhevmContextValue = {
    isInitialized,
    isInitializing,
    error,
    init,
    getPublicKey,
    config,
  };

  return <FhevmContext.Provider value={value}>{children}</FhevmContext.Provider>;
}

/**
 * Hook to access FHEVM context
 *
 * @example
 * ```tsx
 * const { isInitialized, init } = useFhevmContext();
 * ```
 */
export function useFhevmContext(): FhevmContextValue {
  const context = useContext(FhevmContext);

  if (!context) {
    throw new Error('useFhevmContext must be used within FhevmProvider');
  }

  return context;
}
