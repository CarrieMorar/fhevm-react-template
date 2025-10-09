/**
 * Core type definitions for FHEVM SDK
 */

import { BrowserProvider, JsonRpcSigner } from 'ethers';

/**
 * FHEVM client configuration
 */
export interface FhevmConfig {
  /** Network chain ID (e.g., 9000 for Zama devnet, 11155111 for Sepolia) */
  chainId: number;

  /** Gateway URL for FHE operations */
  gatewayUrl?: string;

  /** ACL (Access Control List) contract address */
  aclAddress?: string;

  /** Network RPC URL */
  rpcUrl?: string;

  /** Network name */
  networkName?: string;
}

/**
 * Encrypted input for contract interaction
 */
export interface EncryptedInput {
  /** Encrypted data handles */
  handles: string[];

  /** Input proof for verification */
  inputProof: string;
}

/**
 * Decryption request parameters
 */
export interface DecryptionRequest {
  /** Contract address */
  contractAddress: string;

  /** Encrypted value handle (ciphertext) */
  handle: string;

  /** Signer for EIP-712 signature */
  signer: JsonRpcSigner;
}

/**
 * Public decryption parameters (no signature required)
 */
export interface PublicDecryptionRequest {
  /** Contract address */
  contractAddress: string;

  /** Encrypted value handle (ciphertext) */
  handle: string;
}

/**
 * Encryption input types
 */
export type EncryptionType = 'bool' | 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'uint128' | 'uint256' | 'address';

/**
 * Contract interaction parameters
 */
export interface ContractCallParams {
  /** Contract address */
  address: string;

  /** Contract ABI */
  abi: any[];

  /** Function name to call */
  functionName: string;

  /** Function arguments */
  args?: any[];

  /** Signer for transaction */
  signer: JsonRpcSigner;

  /** Transaction value in wei */
  value?: bigint;
}

/**
 * FHEVM instance interface
 */
export interface IFhevmInstance {
  /** Create encrypted input */
  createEncryptedInput(contractAddress: string, userAddress: string): any;

  /** Get public key */
  getPublicKey(): string;

  /** Instance ready flag */
  hasKeypair(): boolean;
}

/**
 * Provider types
 */
export type FhevmProvider = BrowserProvider;

/**
 * Network configuration presets
 */
export const NETWORK_CONFIGS: Record<string, FhevmConfig> = {
  zama: {
    chainId: 9000,
    networkName: 'Zama Devnet',
    rpcUrl: 'https://devnet.zama.ai',
  },
  sepolia: {
    chainId: 11155111,
    networkName: 'Sepolia Testnet',
    rpcUrl: 'https://rpc.sepolia.org',
  },
  localhost: {
    chainId: 31337,
    networkName: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
  },
};
