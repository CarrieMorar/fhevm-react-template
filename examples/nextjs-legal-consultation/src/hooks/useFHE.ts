/**
 * Core FHE Hook
 * Provides access to FHEVM instance and initialization state
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { initializeFhevmClient, getFhevmInstance } from '../lib/fhe/client';
import type { FhevmConfig } from '../lib/fhe/types';
import type { FhevmInstance } from '@fhevm/sdk';

interface UseFHEReturn {
  isReady: boolean;
  isInitializing: boolean;
  error: Error | null;
  init: () => Promise<void>;
  instance: FhevmInstance | null;
  publicKey: string | null;
  config: FhevmConfig | null;
}

/**
 * Core hook for FHEVM instance management
 *
 * @param config - Optional FHEVM configuration
 * @param autoInit - Automatically initialize on mount
 *
 * @example
 * ```tsx
 * const { isReady, init, instance } = useFHE({ chainId: 9000 }, true);
 *
 * if (!isReady) {
 *   return <div>Initializing FHE...</div>;
 * }
 *
 * return <div>FHE Ready!</div>;
 * ```
 */
export function useFHE(
  config?: FhevmConfig,
  autoInit: boolean = false
): UseFHEReturn {
  const [isReady, setIsReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [instance, setInstance] = useState<FhevmInstance | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [currentConfig, setCurrentConfig] = useState<FhevmConfig | null>(config || null);

  const init = useCallback(async () => {
    if (isReady || isInitializing) {
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      const fhevmInstance = await initializeFhevmClient(config);

      // Get instance details
      setInstance(fhevmInstance);
      setCurrentConfig(config || {
        chainId: 9000,
        networkName: 'Zama Devnet',
      });

      // Try to get public key if available
      try {
        const existingInstance = getFhevmInstance();
        if (existingInstance) {
          // Store instance reference
          setInstance(existingInstance);
        }
      } catch (e) {
        // Instance not fully initialized yet, that's okay
      }

      setIsReady(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize FHEVM');
      setError(error);
      console.error('FHEVM initialization error:', error);
    } finally {
      setIsInitializing(false);
    }
  }, [config, isReady, isInitializing]);

  useEffect(() => {
    if (autoInit && !isReady && !isInitializing) {
      init();
    }
  }, [autoInit, isReady, isInitializing, init]);

  return {
    isReady,
    isInitializing,
    error,
    init,
    instance,
    publicKey,
    config: currentConfig,
  };
}
