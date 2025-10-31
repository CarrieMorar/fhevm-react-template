/**
 * Encryption Hook
 * Provides encryption utilities for FHE operations
 */

'use client';

import { useState, useCallback } from 'react';
import { encryptData } from '../lib/fhe/client';
import type { EncryptionResult, TypedValue } from '../lib/fhe/types';

interface UseEncryptionReturn {
  encrypt: (
    contractAddress: string,
    userAddress: string,
    data: Record<string, number | boolean>
  ) => Promise<EncryptionResult>;
  encryptBatch: (
    contractAddress: string,
    userAddress: string,
    values: TypedValue[]
  ) => Promise<EncryptionResult>;
  encryptedData: EncryptionResult | null;
  isEncrypting: boolean;
  error: Error | null;
  clearError: () => void;
  clear: () => void;
}

/**
 * Hook for encrypting data with FHE
 *
 * @example
 * ```tsx
 * const { encrypt, isEncrypting, encryptedData } = useEncryption();
 *
 * const handleEncrypt = async () => {
 *   const result = await encrypt(contractAddress, userAddress, {
 *     amount: 1000,
 *     category: 1,
 *     isActive: true
 *   });
 *
 *   console.log('Encrypted handles:', result.handles);
 *   console.log('Input proof:', result.inputProof);
 * };
 * ```
 */
export function useEncryption(): UseEncryptionReturn {
  const [encryptedData, setEncryptedData] = useState<EncryptionResult | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const encrypt = useCallback(async (
    contractAddress: string,
    userAddress: string,
    data: Record<string, number | boolean>
  ): Promise<EncryptionResult> => {
    setIsEncrypting(true);
    setError(null);

    try {
      const result = await encryptData(contractAddress, userAddress, data);
      setEncryptedData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Encryption failed');
      setError(error);
      throw error;
    } finally {
      setIsEncrypting(false);
    }
  }, []);

  const encryptBatch = useCallback(async (
    contractAddress: string,
    userAddress: string,
    values: TypedValue[]
  ): Promise<EncryptionResult> => {
    setIsEncrypting(true);
    setError(null);

    try {
      // Convert TypedValue array to object format expected by encryptData
      const dataObject: Record<string, number | boolean> = {};
      values.forEach((item, index) => {
        dataObject[`value${index}`] = typeof item.value === 'string'
          ? parseInt(item.value, 16)
          : item.value;
      });

      const result = await encryptData(contractAddress, userAddress, dataObject);
      setEncryptedData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Batch encryption failed');
      setError(error);
      throw error;
    } finally {
      setIsEncrypting(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clear = useCallback(() => {
    setEncryptedData(null);
    setError(null);
  }, []);

  return {
    encrypt,
    encryptBatch,
    encryptedData,
    isEncrypting,
    error,
    clearError,
    clear,
  };
}
