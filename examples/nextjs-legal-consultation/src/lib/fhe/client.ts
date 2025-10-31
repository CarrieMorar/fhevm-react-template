/**
 * Client-side FHE operations
 * This module provides client-side encryption and decryption utilities
 */

import { createFhevmInstance, encryptInput, userDecrypt } from '@fhevm/sdk';
import type { FhevmInstance } from '@fhevm/sdk';

let fhevmInstance: FhevmInstance | null = null;

/**
 * Initialize FHEVM client instance
 */
export async function initializeFhevmClient(config?: {
  chainId?: number;
  networkName?: string;
  rpcUrl?: string;
}) {
  if (fhevmInstance) {
    return fhevmInstance;
  }

  fhevmInstance = createFhevmInstance({
    chainId: config?.chainId || 9000,
    networkName: config?.networkName || 'Zama Devnet',
    rpcUrl: config?.rpcUrl,
  });

  return fhevmInstance;
}

/**
 * Get the current FHEVM instance
 */
export function getFhevmInstance() {
  if (!fhevmInstance) {
    throw new Error('FHEVM instance not initialized. Call initializeFhevmClient first.');
  }
  return fhevmInstance;
}

/**
 * Encrypt data for a contract
 */
export async function encryptData(
  contractAddress: string,
  userAddress: string,
  data: Record<string, number | boolean>
) {
  return encryptInput(contractAddress, userAddress, data);
}

/**
 * Decrypt data with user signature
 */
export async function decryptData(params: {
  contractAddress: string;
  handle: string;
  signer: any;
}) {
  return userDecrypt(params);
}
