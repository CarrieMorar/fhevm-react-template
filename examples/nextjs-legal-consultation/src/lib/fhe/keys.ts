/**
 * Key management utilities
 * Handles public/private key operations for FHE
 */

import { getFhevmInstance } from './client';

/**
 * Key pair interface
 */
export interface KeyPair {
  publicKey: string;
  privateKey?: string; // Optional, usually not exposed
}

/**
 * Key metadata
 */
export interface KeyMetadata {
  createdAt: number;
  expiresAt?: number;
  purpose: 'encryption' | 'decryption' | 'both';
  chainId: number;
}

/**
 * Get the current public key from FHEVM instance
 */
export async function getPublicKey(): Promise<string> {
  try {
    const instance = getFhevmInstance();

    // Get public key from instance
    // This would extract the key from the initialized instance
    console.log('Getting public key from FHEVM instance');

    // Placeholder - actual implementation would get from instance
    return '';
  } catch (error) {
    console.error('Failed to get public key:', error);
    throw new Error('Failed to retrieve public key from FHEVM instance');
  }
}

/**
 * Verify a public key format
 */
export function isValidPublicKey(key: string): boolean {
  // Public key should be a hex string of specific length
  // Adjust pattern based on actual FHEVM key format
  return /^0x[a-fA-F0-9]{128,}$/.test(key);
}

/**
 * Store public key in browser storage (for caching)
 */
export function cachePublicKey(key: string, metadata: KeyMetadata): void {
  if (typeof window === 'undefined') {
    return; // Server-side, skip
  }

  try {
    const cacheData = {
      key,
      metadata,
      cachedAt: Date.now(),
    };

    localStorage.setItem('fhevm_public_key', JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Failed to cache public key:', error);
  }
}

/**
 * Retrieve cached public key from browser storage
 */
export function getCachedPublicKey(): { key: string; metadata: KeyMetadata } | null {
  if (typeof window === 'undefined') {
    return null; // Server-side
  }

  try {
    const cached = localStorage.getItem('fhevm_public_key');
    if (!cached) {
      return null;
    }

    const data = JSON.parse(cached);
    const age = Date.now() - data.cachedAt;

    // Cache expires after 1 hour
    if (age > 60 * 60 * 1000) {
      localStorage.removeItem('fhevm_public_key');
      return null;
    }

    return {
      key: data.key,
      metadata: data.metadata,
    };
  } catch (error) {
    console.warn('Failed to retrieve cached public key:', error);
    return null;
  }
}

/**
 * Clear cached keys
 */
export function clearKeyCache(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem('fhevm_public_key');
  } catch (error) {
    console.warn('Failed to clear key cache:', error);
  }
}

/**
 * Generate key metadata
 */
export function createKeyMetadata(
  purpose: 'encryption' | 'decryption' | 'both',
  chainId: number,
  expiresInMs?: number
): KeyMetadata {
  const metadata: KeyMetadata = {
    createdAt: Date.now(),
    purpose,
    chainId,
  };

  if (expiresInMs) {
    metadata.expiresAt = Date.now() + expiresInMs;
  }

  return metadata;
}

/**
 * Check if key metadata is expired
 */
export function isKeyExpired(metadata: KeyMetadata): boolean {
  if (!metadata.expiresAt) {
    return false; // No expiration set
  }

  return Date.now() > metadata.expiresAt;
}

/**
 * Derive a contract-specific encryption context
 * Used for isolating encrypted data per contract
 */
export function deriveContractContext(
  contractAddress: string,
  publicKey: string
): string {
  // Create a unique context identifier for this contract + key pair
  // In production, this might use a proper KDF (Key Derivation Function)
  const combined = contractAddress.toLowerCase() + publicKey;

  // Simple hash (in production, use a proper crypto hash)
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return `0x${Math.abs(hash).toString(16).padStart(8, '0')}`;
}

/**
 * Validate key pair compatibility
 */
export function areKeysCompatible(
  publicKey: string,
  chainId: number,
  targetChainId: number
): boolean {
  // Keys must be for the same chain
  if (chainId !== targetChainId) {
    return false;
  }

  // Validate key format
  if (!isValidPublicKey(publicKey)) {
    return false;
  }

  return true;
}

/**
 * Format public key for display (truncate)
 */
export function formatPublicKeyForDisplay(
  key: string,
  prefixLength: number = 10,
  suffixLength: number = 8
): string {
  if (key.length <= prefixLength + suffixLength) {
    return key;
  }

  return `${key.slice(0, prefixLength)}...${key.slice(-suffixLength)}`;
}

/**
 * Export key configuration for sharing/backup
 */
export interface KeyConfig {
  publicKey: string;
  chainId: number;
  networkName: string;
  metadata: KeyMetadata;
}

export function exportKeyConfig(
  publicKey: string,
  chainId: number,
  networkName: string,
  metadata: KeyMetadata
): string {
  const config: KeyConfig = {
    publicKey,
    chainId,
    networkName,
    metadata,
  };

  return JSON.stringify(config, null, 2);
}

/**
 * Import key configuration
 */
export function importKeyConfig(configJson: string): KeyConfig {
  try {
    const config = JSON.parse(configJson);

    if (!config.publicKey || !config.chainId || !config.metadata) {
      throw new Error('Invalid key configuration format');
    }

    if (!isValidPublicKey(config.publicKey)) {
      throw new Error('Invalid public key in configuration');
    }

    return config;
  } catch (error) {
    throw new Error(`Failed to import key configuration: ${error}`);
  }
}
