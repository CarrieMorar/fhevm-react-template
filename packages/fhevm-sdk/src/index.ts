/**
 * @fhevm/sdk - Universal FHEVM SDK
 * Framework-agnostic toolkit for building confidential dApps with FHE
 */

export * from './core/fhevm-client';
export * from './core/encryption';
export * from './core/decryption';
export * from './core/types';
export * from './utils/abi';
export * from './utils/eip712';

// Re-export for convenience
export { createFhevmInstance, FhevmClient } from './core/fhevm-client';
export { encryptInput, encryptBool, encryptUint8, encryptUint16, encryptUint32, encryptUint64 } from './core/encryption';
export { userDecrypt, publicDecrypt } from './core/decryption';
