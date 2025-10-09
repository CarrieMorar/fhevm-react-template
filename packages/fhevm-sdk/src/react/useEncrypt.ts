/**
 * React hooks for encryption operations
 */

import { useState, useCallback } from 'react';
import { useFhevmInstance } from './useFhevm';
import { encryptInput, batchEncrypt } from '../core/encryption';
import type { EncryptedInput, EncryptionType } from '../core/types';

/**
 * Hook for encrypting inputs
 *
 * @example
 * ```tsx
 * const { encrypt, isEncrypting, error } = useEncrypt();
 *
 * const handleSubmit = async () => {
 *   const encrypted = await encrypt(
 *     contractAddress,
 *     userAddress,
 *     { amount: 1000, category: 1 }
 *   );
 * };
 * ```
 */
export function useEncrypt() {
  const instance = useFhevmInstance();
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const encrypt = useCallback(
    async (
      contractAddress: string,
      userAddress: string,
      inputs: Record<string, any>
    ): Promise<EncryptedInput | null> => {
      if (!instance) {
        setError(new Error('FHEVM instance not ready'));
        return null;
      }

      setIsEncrypting(true);
      setError(null);

      try {
        const result = await encryptInput(contractAddress, userAddress, inputs);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Encryption failed');
        setError(error);
        return null;
      } finally {
        setIsEncrypting(false);
      }
    },
    [instance]
  );

  return {
    /** Encrypt inputs */
    encrypt,

    /** Is currently encrypting */
    isEncrypting,

    /** Encryption error */
    error,

    /** Clear error */
    clearError: () => setError(null),
  };
}

/**
 * Hook for batch encryption
 *
 * @example
 * ```tsx
 * const { encryptBatch, isEncrypting } = useBatchEncrypt();
 *
 * const encrypted = await encryptBatch(
 *   contractAddress,
 *   userAddress,
 *   [
 *     { type: 'uint32', value: 1000 },
 *     { type: 'bool', value: true }
 *   ]
 * );
 * ```
 */
export function useBatchEncrypt() {
  const instance = useFhevmInstance();
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const encryptBatch = useCallback(
    async (
      contractAddress: string,
      userAddress: string,
      values: Array<{ type: EncryptionType; value: any }>
    ): Promise<EncryptedInput | null> => {
      if (!instance) {
        setError(new Error('FHEVM instance not ready'));
        return null;
      }

      setIsEncrypting(true);
      setError(null);

      try {
        const result = await batchEncrypt(instance, contractAddress, userAddress, values);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Batch encryption failed');
        setError(error);
        return null;
      } finally {
        setIsEncrypting(false);
      }
    },
    [instance]
  );

  return {
    /** Batch encrypt values */
    encryptBatch,

    /** Is currently encrypting */
    isEncrypting,

    /** Encryption error */
    error,

    /** Clear error */
    clearError: () => setError(null),
  };
}

/**
 * Hook for encrypting a single value with type specification
 *
 * @example
 * ```tsx
 * const { encryptValue, isEncrypting } = useEncryptValue();
 *
 * const encrypted = await encryptValue(
 *   contractAddress,
 *   userAddress,
 *   'uint32',
 *   1000
 * );
 * ```
 */
export function useEncryptValue() {
  const { encryptBatch, isEncrypting, error, clearError } = useBatchEncrypt();

  const encryptValue = useCallback(
    async (
      contractAddress: string,
      userAddress: string,
      type: EncryptionType,
      value: any
    ): Promise<EncryptedInput | null> => {
      return encryptBatch(contractAddress, userAddress, [{ type, value }]);
    },
    [encryptBatch]
  );

  return {
    /** Encrypt a single value */
    encryptValue,

    /** Is currently encrypting */
    isEncrypting,

    /** Encryption error */
    error,

    /** Clear error */
    clearError,
  };
}
