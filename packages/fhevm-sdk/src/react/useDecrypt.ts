/**
 * React hooks for decryption operations
 */

import { useState, useCallback } from 'react';
import { JsonRpcSigner } from 'ethers';
import { userDecrypt, publicDecrypt, batchUserDecrypt, decryptToType } from '../core/decryption';
import type { DecryptionRequest, PublicDecryptionRequest } from '../core/types';

/**
 * Hook for user decryption (requires EIP-712 signature)
 *
 * @example
 * ```tsx
 * const { decrypt, isDecrypting, decryptedValue, error } = useDecrypt();
 *
 * const handleDecrypt = async () => {
 *   await decrypt({
 *     contractAddress: '0x...',
 *     handle: '0x...',
 *     signer: signer
 *   });
 * };
 * ```
 */
export function useDecrypt() {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedValue, setDecryptedValue] = useState<bigint | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const decrypt = useCallback(async (params: DecryptionRequest) => {
    setIsDecrypting(true);
    setError(null);
    setDecryptedValue(null);

    try {
      const value = await userDecrypt(params);
      setDecryptedValue(value);
      return value;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Decryption failed');
      setError(error);
      return null;
    } finally {
      setIsDecrypting(false);
    }
  }, []);

  return {
    /** Decrypt encrypted value */
    decrypt,

    /** Is currently decrypting */
    isDecrypting,

    /** Decrypted value */
    decryptedValue,

    /** Decryption error */
    error,

    /** Clear state */
    clear: () => {
      setDecryptedValue(null);
      setError(null);
    },
  };
}

/**
 * Hook for public decryption (no signature required)
 *
 * @example
 * ```tsx
 * const { decrypt, decryptedValue } = usePublicDecrypt();
 *
 * await decrypt({
 *   contractAddress: '0x...',
 *   handle: '0x...'
 * });
 * ```
 */
export function usePublicDecrypt() {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedValue, setDecryptedValue] = useState<bigint | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const decrypt = useCallback(async (params: PublicDecryptionRequest) => {
    setIsDecrypting(true);
    setError(null);
    setDecryptedValue(null);

    try {
      const value = await publicDecrypt(params);
      setDecryptedValue(value);
      return value;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Public decryption failed');
      setError(error);
      return null;
    } finally {
      setIsDecrypting(false);
    }
  }, []);

  return {
    /** Decrypt public value */
    decrypt,

    /** Is currently decrypting */
    isDecrypting,

    /** Decrypted value */
    decryptedValue,

    /** Decryption error */
    error,

    /** Clear state */
    clear: () => {
      setDecryptedValue(null);
      setError(null);
    },
  };
}

/**
 * Hook for batch decryption
 *
 * @example
 * ```tsx
 * const { decryptBatch, decryptedValues } = useBatchDecrypt();
 *
 * await decryptBatch([
 *   { contractAddress: '0x...', handle: '0x...', signer },
 *   { contractAddress: '0x...', handle: '0x...', signer }
 * ]);
 * ```
 */
export function useBatchDecrypt() {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedValues, setDecryptedValues] = useState<bigint[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const decryptBatch = useCallback(async (requests: DecryptionRequest[]) => {
    setIsDecrypting(true);
    setError(null);
    setDecryptedValues([]);

    try {
      const values = await batchUserDecrypt(requests);
      setDecryptedValues(values);
      return values;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Batch decryption failed');
      setError(error);
      return null;
    } finally {
      setIsDecrypting(false);
    }
  }, []);

  return {
    /** Decrypt multiple values */
    decryptBatch,

    /** Is currently decrypting */
    isDecrypting,

    /** Decrypted values */
    decryptedValues,

    /** Decryption error */
    error,

    /** Clear state */
    clear: () => {
      setDecryptedValues([]);
      setError(null);
    },
  };
}

/**
 * Hook for decrypting to a specific type
 *
 * @example
 * ```tsx
 * const { decryptAs, value } = useDecryptAs<'number'>();
 *
 * const numValue = await decryptAs(
 *   { contractAddress: '0x...', handle: '0x...', signer },
 *   'number'
 * );
 * ```
 */
export function useDecryptAs<T extends 'bool' | 'number' | 'bigint'>() {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [value, setValue] = useState<T extends 'bool' ? boolean : T extends 'number' ? number : bigint | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const decryptAs = useCallback(async (params: DecryptionRequest, type: T) => {
    setIsDecrypting(true);
    setError(null);
    setValue(null as any);

    try {
      const result = await decryptToType(params, type);
      setValue(result as any);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Decryption failed');
      setError(error);
      return null;
    } finally {
      setIsDecrypting(false);
    }
  }, []);

  return {
    /** Decrypt as specific type */
    decryptAs,

    /** Is currently decrypting */
    isDecrypting,

    /** Decrypted value */
    value,

    /** Decryption error */
    error,

    /** Clear state */
    clear: () => {
      setValue(null as any);
      setError(null);
    },
  };
}
