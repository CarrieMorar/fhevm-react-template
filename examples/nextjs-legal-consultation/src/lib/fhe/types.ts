/**
 * Type definitions for FHE operations
 */

export interface EncryptedValue {
  handle: string;
  data: string;
}

export interface EncryptionResult {
  handles: string[];
  inputProof: string;
}

export interface DecryptionParams {
  contractAddress: string;
  handle: string;
  signer: any;
}

export interface FhevmConfig {
  chainId: number;
  networkName?: string;
  rpcUrl?: string;
  gatewayUrl?: string;
  aclAddress?: string;
}

export type EncryptableType = 'bool' | 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'address';

export interface TypedValue {
  type: EncryptableType;
  value: number | boolean | string;
}
