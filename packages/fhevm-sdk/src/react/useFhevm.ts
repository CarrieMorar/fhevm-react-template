/**
 * Core FHEVM hooks for React
 */

import { useState, useCallback, useEffect } from 'react';
import { useFhevmContext } from './FhevmProvider';
import { getFhevmInstance } from '../core/fhevm-client';

/**
 * Hook to access FHEVM instance and state
 *
 * @example
 * ```tsx
 * const { isReady, init, publicKey } = useFhevm();
 *
 * useEffect(() => {
 *   if (!isReady) {
 *     init();
 *   }
 * }, [isReady, init]);
 * ```
 */
export function useFhevm() {
  const context = useFhevmContext();

  return {
    /** Is SDK ready for use */
    isReady: context.isInitialized,

    /** Is SDK currently initializing */
    isInitializing: context.isInitializing,

    /** Initialization error if any */
    error: context.error,

    /** Initialize the SDK */
    init: context.init,

    /** Get public key for encryption */
    publicKey: context.getPublicKey(),

    /** SDK configuration */
    config: context.config,
  };
}

/**
 * Hook to get FHEVM instance directly
 *
 * @example
 * ```tsx
 * const instance = useFhevmInstance();
 * if (instance) {
 *   const encrypted = instance.createEncryptedInput(...);
 * }
 * ```
 */
export function useFhevmInstance() {
  const { isReady } = useFhevm();
  const [instance, setInstance] = useState(getFhevmInstance());

  useEffect(() => {
    if (isReady) {
      setInstance(getFhevmInstance());
    }
  }, [isReady]);

  return instance;
}

/**
 * Hook for public key access
 *
 * @example
 * ```tsx
 * const publicKey = usePublicKey();
 * ```
 */
export function usePublicKey(): string | null {
  const { publicKey } = useFhevm();
  return publicKey;
}

/**
 * Hook to check if FHEVM is ready
 *
 * @example
 * ```tsx
 * const isReady = useIsReady();
 *
 * if (!isReady) {
 *   return <div>Loading FHEVM...</div>;
 * }
 * ```
 */
export function useIsReady(): boolean {
  const { isReady } = useFhevm();
  return isReady;
}
