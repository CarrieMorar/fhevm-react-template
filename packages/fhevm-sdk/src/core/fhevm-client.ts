/**
 * FHEVM Client - Core instance management
 */

import { BrowserProvider } from 'ethers';
import { initFhevm, createInstance as createFhevmjsInstance } from 'fhevmjs';
import type { FhevmConfig, IFhevmInstance } from './types';

let fhevmInstance: IFhevmInstance | null = null;
let isInitialized = false;

/**
 * FhevmClient - Main class for FHEVM operations
 */
export class FhevmClient {
  private instance: IFhevmInstance | null = null;
  private config: FhevmConfig;

  constructor(config: FhevmConfig) {
    this.config = config;
  }

  /**
   * Initialize the FHEVM instance
   */
  async init(provider?: BrowserProvider): Promise<IFhevmInstance> {
    if (this.instance && this.instance.hasKeypair()) {
      return this.instance;
    }

    // Initialize fhevmjs if not already done
    if (!isInitialized) {
      await initFhevm();
      isInitialized = true;
    }

    // Create instance with provider or config
    if (provider) {
      const network = await provider.getNetwork();
      this.instance = await createFhevmjsInstance({
        chainId: Number(network.chainId),
        networkUrl: this.config.rpcUrl || '',
        gatewayUrl: this.config.gatewayUrl,
        aclAddress: this.config.aclAddress,
      });
    } else {
      this.instance = await createFhevmjsInstance({
        chainId: this.config.chainId,
        networkUrl: this.config.rpcUrl || '',
        gatewayUrl: this.config.gatewayUrl,
        aclAddress: this.config.aclAddress,
      });
    }

    fhevmInstance = this.instance;
    return this.instance;
  }

  /**
   * Get the current FHEVM instance
   */
  getInstance(): IFhevmInstance | null {
    return this.instance;
  }

  /**
   * Check if instance is ready
   */
  isReady(): boolean {
    return this.instance !== null && this.instance.hasKeypair();
  }

  /**
   * Get public key for encryption
   */
  getPublicKey(): string {
    if (!this.instance) {
      throw new Error('FHEVM instance not initialized. Call init() first.');
    }
    return this.instance.getPublicKey();
  }

  /**
   * Get configuration
   */
  getConfig(): FhevmConfig {
    return this.config;
  }
}

/**
 * Create a new FHEVM client instance
 *
 * @example
 * ```typescript
 * const client = createFhevmInstance({
 *   chainId: 9000,
 *   networkName: 'Zama Devnet'
 * });
 *
 * await client.init(provider);
 * ```
 */
export function createFhevmInstance(config: FhevmConfig): FhevmClient {
  return new FhevmClient(config);
}

/**
 * Get the global FHEVM instance (singleton pattern)
 */
export function getFhevmInstance(): IFhevmInstance | null {
  return fhevmInstance;
}

/**
 * Clear the global instance (useful for testing)
 */
export function clearFhevmInstance(): void {
  fhevmInstance = null;
  isInitialized = false;
}
