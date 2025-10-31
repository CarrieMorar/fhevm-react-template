/**
 * Security utilities for FHEVM operations
 */

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate encrypted handle format
 */
export function isValidHandle(handle: string): boolean {
  return typeof handle === 'string' && handle.startsWith('0x');
}

/**
 * Sanitize input values before encryption
 */
export function sanitizeInput(value: any): number | boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return Math.floor(Math.abs(value));
  }

  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new Error('Invalid input: cannot convert to number');
    }
    return Math.floor(Math.abs(parsed));
  }

  throw new Error('Invalid input type');
}

/**
 * Validate encryption parameters
 */
export function validateEncryptionParams(
  contractAddress: string,
  userAddress: string,
  inputs: Record<string, any>
): void {
  if (!isValidAddress(contractAddress)) {
    throw new Error('Invalid contract address');
  }

  if (!isValidAddress(userAddress)) {
    throw new Error('Invalid user address');
  }

  if (!inputs || Object.keys(inputs).length === 0) {
    throw new Error('No inputs provided for encryption');
  }
}

/**
 * Validate decryption parameters
 */
export function validateDecryptionParams(
  contractAddress: string,
  handle: string
): void {
  if (!isValidAddress(contractAddress)) {
    throw new Error('Invalid contract address');
  }

  if (!isValidHandle(handle)) {
    throw new Error('Invalid encrypted handle');
  }
}
