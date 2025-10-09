/**
 * Decryption utilities for FHEVM
 */

import type { DecryptionRequest, PublicDecryptionRequest, IFhevmInstance } from './types';
import { getFhevmInstance } from './fhevm-client';
import { createEIP712Signature } from '../utils/eip712';

/**
 * User decrypt - Requires EIP-712 signature
 * Used when the user needs to decrypt their own encrypted data
 *
 * @example
 * ```typescript
 * const decryptedValue = await userDecrypt({
 *   contractAddress: '0x...',
 *   handle: '0x...',
 *   signer: signer
 * });
 * ```
 */
export async function userDecrypt(params: DecryptionRequest): Promise<bigint> {
  const instance = getFhevmInstance();
  if (!instance) {
    throw new Error('FHEVM instance not initialized');
  }

  const { contractAddress, handle, signer } = params;

  // Create EIP-712 signature for decryption permission
  const { signature, publicKey } = await createEIP712Signature(
    contractAddress,
    handle,
    signer
  );

  // Request decryption from gateway
  try {
    const decryptedValue = await requestGatewayDecryption(
      contractAddress,
      handle,
      signature,
      publicKey
    );

    return BigInt(decryptedValue);
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Public decrypt - No signature required
 * Used for publicly decryptable data
 *
 * @example
 * ```typescript
 * const publicValue = await publicDecrypt({
 *   contractAddress: '0x...',
 *   handle: '0x...'
 * });
 * ```
 */
export async function publicDecrypt(params: PublicDecryptionRequest): Promise<bigint> {
  const instance = getFhevmInstance();
  if (!instance) {
    throw new Error('FHEVM instance not initialized');
  }

  const { contractAddress, handle } = params;

  try {
    // Public decryption doesn't require signature
    const decryptedValue = await requestPublicDecryption(contractAddress, handle);
    return BigInt(decryptedValue);
  } catch (error) {
    throw new Error(`Public decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Request decryption from gateway with EIP-712 signature
 */
async function requestGatewayDecryption(
  contractAddress: string,
  handle: string,
  signature: string,
  publicKey: string
): Promise<string> {
  // This would make an actual request to the gateway
  // For now, returning a placeholder
  // TODO: Implement actual gateway communication
  throw new Error('Gateway decryption not yet implemented - requires gateway URL configuration');
}

/**
 * Request public decryption from gateway
 */
async function requestPublicDecryption(
  contractAddress: string,
  handle: string
): Promise<string> {
  // This would make an actual request to the gateway for public data
  // TODO: Implement actual gateway communication
  throw new Error('Public decryption not yet implemented - requires gateway URL configuration');
}

/**
 * Batch decrypt multiple handles
 *
 * @example
 * ```typescript
 * const values = await batchUserDecrypt([
 *   { contractAddress: '0x...', handle: '0x...', signer },
 *   { contractAddress: '0x...', handle: '0x...', signer }
 * ]);
 * ```
 */
export async function batchUserDecrypt(
  requests: DecryptionRequest[]
): Promise<bigint[]> {
  const results: bigint[] = [];

  for (const request of requests) {
    const value = await userDecrypt(request);
    results.push(value);
  }

  return results;
}

/**
 * Batch public decrypt multiple handles
 */
export async function batchPublicDecrypt(
  requests: PublicDecryptionRequest[]
): Promise<bigint[]> {
  const results: bigint[] = [];

  for (const request of requests) {
    const value = await publicDecrypt(request);
    results.push(value);
  }

  return results;
}

/**
 * Decrypt to specific type
 */
export async function decryptToType<T extends 'bool' | 'number' | 'bigint'>(
  params: DecryptionRequest,
  type: T
): Promise<T extends 'bool' ? boolean : T extends 'number' ? number : bigint> {
  const value = await userDecrypt(params);

  switch (type) {
    case 'bool':
      return (value !== 0n) as any;
    case 'number':
      return Number(value) as any;
    case 'bigint':
      return value as any;
    default:
      throw new Error(`Unsupported type: ${type}`);
  }
}
