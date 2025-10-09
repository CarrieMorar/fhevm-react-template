/**
 * Encryption utilities for FHEVM
 */

import type { IFhevmInstance, EncryptedInput, EncryptionType } from './types';
import { getFhevmInstance } from './fhevm-client';

/**
 * Create encrypted input for contract interaction
 *
 * @example
 * ```typescript
 * const encrypted = await encryptInput(
 *   contractAddress,
 *   userAddress,
 *   { amount: 1000, category: 1 }
 * );
 * ```
 */
export async function encryptInput(
  contractAddress: string,
  userAddress: string,
  inputs: Record<string, any>
): Promise<EncryptedInput> {
  const instance = getFhevmInstance();
  if (!instance) {
    throw new Error('FHEVM instance not initialized');
  }

  const encryptedInput = instance.createEncryptedInput(contractAddress, userAddress);

  // Add inputs based on their types
  for (const [key, value] of Object.entries(inputs)) {
    if (typeof value === 'boolean') {
      encryptedInput.addBool(value);
    } else if (typeof value === 'number' || typeof value === 'bigint') {
      // Auto-detect size based on value
      const numValue = Number(value);
      if (numValue <= 255) {
        encryptedInput.addUint8(numValue);
      } else if (numValue <= 65535) {
        encryptedInput.addUint16(numValue);
      } else if (numValue <= 4294967295) {
        encryptedInput.addUint32(numValue);
      } else {
        encryptedInput.addUint64(BigInt(value));
      }
    } else if (typeof value === 'string' && value.startsWith('0x')) {
      encryptedInput.addAddress(value);
    }
  }

  return encryptedInput.encrypt();
}

/**
 * Encrypt a boolean value
 */
export async function encryptBool(
  instance: IFhevmInstance,
  contractAddress: string,
  userAddress: string,
  value: boolean
): Promise<EncryptedInput> {
  const input = instance.createEncryptedInput(contractAddress, userAddress);
  input.addBool(value);
  return input.encrypt();
}

/**
 * Encrypt a uint8 value (0-255)
 */
export async function encryptUint8(
  instance: IFhevmInstance,
  contractAddress: string,
  userAddress: string,
  value: number
): Promise<EncryptedInput> {
  if (value < 0 || value > 255) {
    throw new Error('Value must be between 0 and 255 for uint8');
  }
  const input = instance.createEncryptedInput(contractAddress, userAddress);
  input.addUint8(value);
  return input.encrypt();
}

/**
 * Encrypt a uint16 value (0-65535)
 */
export async function encryptUint16(
  instance: IFhevmInstance,
  contractAddress: string,
  userAddress: string,
  value: number
): Promise<EncryptedInput> {
  if (value < 0 || value > 65535) {
    throw new Error('Value must be between 0 and 65535 for uint16');
  }
  const input = instance.createEncryptedInput(contractAddress, userAddress);
  input.addUint16(value);
  return input.encrypt();
}

/**
 * Encrypt a uint32 value (0-4294967295)
 */
export async function encryptUint32(
  instance: IFhevmInstance,
  contractAddress: string,
  userAddress: string,
  value: number
): Promise<EncryptedInput> {
  if (value < 0 || value > 4294967295) {
    throw new Error('Value must be between 0 and 4294967295 for uint32');
  }
  const input = instance.createEncryptedInput(contractAddress, userAddress);
  input.addUint32(value);
  return input.encrypt();
}

/**
 * Encrypt a uint64 value
 */
export async function encryptUint64(
  instance: IFhevmInstance,
  contractAddress: string,
  userAddress: string,
  value: bigint
): Promise<EncryptedInput> {
  const input = instance.createEncryptedInput(contractAddress, userAddress);
  input.addUint64(value);
  return input.encrypt();
}

/**
 * Encrypt an address
 */
export async function encryptAddress(
  instance: IFhevmInstance,
  contractAddress: string,
  userAddress: string,
  address: string
): Promise<EncryptedInput> {
  if (!address.startsWith('0x') || address.length !== 42) {
    throw new Error('Invalid Ethereum address format');
  }
  const input = instance.createEncryptedInput(contractAddress, userAddress);
  input.addAddress(address);
  return input.encrypt();
}

/**
 * Batch encrypt multiple values with type specification
 *
 * @example
 * ```typescript
 * const encrypted = await batchEncrypt(
 *   instance,
 *   contractAddress,
 *   userAddress,
 *   [
 *     { type: 'uint32', value: 1000 },
 *     { type: 'bool', value: true },
 *     { type: 'address', value: '0x...' }
 *   ]
 * );
 * ```
 */
export async function batchEncrypt(
  instance: IFhevmInstance,
  contractAddress: string,
  userAddress: string,
  values: Array<{ type: EncryptionType; value: any }>
): Promise<EncryptedInput> {
  const input = instance.createEncryptedInput(contractAddress, userAddress);

  for (const { type, value } of values) {
    switch (type) {
      case 'bool':
        input.addBool(value);
        break;
      case 'uint8':
        input.addUint8(value);
        break;
      case 'uint16':
        input.addUint16(value);
        break;
      case 'uint32':
        input.addUint32(value);
        break;
      case 'uint64':
        input.addUint64(BigInt(value));
        break;
      case 'address':
        input.addAddress(value);
        break;
      default:
        throw new Error(`Unsupported encryption type: ${type}`);
    }
  }

  return input.encrypt();
}
