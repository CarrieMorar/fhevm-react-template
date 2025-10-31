/**
 * FHEVM-specific type definitions
 */

export interface FhevmInstance {
  init: (provider: any) => Promise<void>;
  publicKey: string | null;
  isInitialized: boolean;
}

export interface EncryptedInput {
  handles: string[];
  inputProof: string;
}

export interface DecryptionResult {
  value: bigint;
  handle: string;
}

export interface FhevmState {
  isReady: boolean;
  isInitializing: boolean;
  error: Error | null;
  publicKey: string | null;
}
