/**
 * Computation Hook
 * Provides utilities for decryption and homomorphic computation operations
 */

'use client';

import { useState, useCallback } from 'react';
import { decryptData } from '../lib/fhe/client';
import type { DecryptionParams } from '../lib/fhe/types';

interface UseComputationReturn {
  decrypt: (params: DecryptionParams) => Promise<bigint>;
  decryptedValue: bigint | null;
  isDecrypting: boolean;
  error: Error | null;
  clear: () => void;
  clearError: () => void;
}

/**
 * Hook for decryption and computation operations
 *
 * @example
 * ```tsx
 * const { decrypt, decryptedValue, isDecrypting } = useComputation();
 *
 * const handleDecrypt = async () => {
 *   const value = await decrypt({
 *     contractAddress,
 *     handle: encryptedHandle,
 *     signer
 *   });
 *
 *   console.log('Decrypted value:', value.toString());
 * };
 * ```
 */
export function useComputation(): UseComputationReturn {
  const [decryptedValue, setDecryptedValue] = useState<bigint | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const decrypt = useCallback(async (params: DecryptionParams): Promise<bigint> => {
    setIsDecrypting(true);
    setError(null);

    try {
      const value = await decryptData(params);
      setDecryptedValue(value);
      return value;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Decryption failed');
      setError(error);
      throw error;
    } finally {
      setIsDecrypting(false);
    }
  }, []);

  const clear = useCallback(() => {
    setDecryptedValue(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    decrypt,
    decryptedValue,
    isDecrypting,
    error,
    clear,
    clearError,
  };
}

/**
 * Hook for batch decryption operations
 */
export function useBatchDecryption() {
  const [decryptedValues, setDecryptedValues] = useState<bigint[]>([]);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const decryptBatch = useCallback(async (
    params: DecryptionParams[]
  ): Promise<bigint[]> => {
    setIsDecrypting(true);
    setError(null);

    try {
      const results = await Promise.all(
        params.map(param => decryptData(param))
      );
      setDecryptedValues(results);
      return results;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Batch decryption failed');
      setError(error);
      throw error;
    } finally {
      setIsDecrypting(false);
    }
  }, []);

  const clear = useCallback(() => {
    setDecryptedValues([]);
    setError(null);
  }, []);

  return {
    decryptBatch,
    decryptedValues,
    isDecrypting,
    error,
    clear,
  };
}
