/**
 * EIP-712 signature utilities for FHEVM decryption
 */

import { JsonRpcSigner } from 'ethers';

/**
 * EIP-712 domain for FHEVM
 */
export const EIP712_DOMAIN = {
  name: 'FHEVM',
  version: '1',
  chainId: 0, // Will be set dynamically
  verifyingContract: '0x0000000000000000000000000000000000000000', // Will be set to contract address
};

/**
 * EIP-712 type for decryption permission
 */
export const DECRYPTION_PERMISSION_TYPE = {
  DecryptionPermission: [
    { name: 'handle', type: 'bytes32' },
    { name: 'contractAddress', type: 'address' },
    { name: 'userAddress', type: 'address' },
  ],
};

/**
 * Create EIP-712 signature for decryption permission
 *
 * @param contractAddress - Contract address containing encrypted data
 * @param handle - Encrypted value handle (ciphertext reference)
 * @param signer - User's signer for creating signature
 * @returns Signature and public key
 */
export async function createEIP712Signature(
  contractAddress: string,
  handle: string,
  signer: JsonRpcSigner
): Promise<{ signature: string; publicKey: string }> {
  const userAddress = await signer.getAddress();
  const provider = signer.provider;
  const network = await provider.getNetwork();

  // EIP-712 domain with actual chain ID
  const domain = {
    ...EIP712_DOMAIN,
    chainId: Number(network.chainId),
    verifyingContract: contractAddress,
  };

  // Message to sign
  const message = {
    handle: handle,
    contractAddress: contractAddress,
    userAddress: userAddress,
  };

  try {
    // Sign the typed data
    const signature = await signer.signTypedData(
      domain,
      DECRYPTION_PERMISSION_TYPE,
      message
    );

    // Get public key from signer if available
    // Note: This is a simplified version. In production, you'd extract the actual public key
    const publicKey = userAddress; // Placeholder

    return {
      signature,
      publicKey,
    };
  } catch (error) {
    throw new Error(
      `Failed to create EIP-712 signature: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Verify EIP-712 signature
 *
 * @param signature - The signature to verify
 * @param contractAddress - Contract address
 * @param handle - Encrypted value handle
 * @param userAddress - User's address
 * @returns True if signature is valid
 */
export function verifyEIP712Signature(
  signature: string,
  contractAddress: string,
  handle: string,
  userAddress: string
): boolean {
  // TODO: Implement signature verification
  // This would typically be done on-chain or via a separate verification service
  return true;
}

/**
 * Create batch EIP-712 signatures for multiple handles
 */
export async function createBatchEIP712Signatures(
  contractAddress: string,
  handles: string[],
  signer: JsonRpcSigner
): Promise<Array<{ signature: string; publicKey: string }>> {
  const signatures: Array<{ signature: string; publicKey: string }> = [];

  for (const handle of handles) {
    const sig = await createEIP712Signature(contractAddress, handle, signer);
    signatures.push(sig);
  }

  return signatures;
}
