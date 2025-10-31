/**
 * API type definitions
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

export interface EncryptRequest {
  contractAddress: string;
  userAddress: string;
  values: Record<string, number | boolean>;
}

export interface EncryptResponse {
  handles: string[];
  inputProof: string;
}

export interface DecryptRequest {
  contractAddress: string;
  handle: string;
}

export interface DecryptResponse {
  value: string;
}

export interface ComputeRequest {
  operation: string;
  encryptedInputs: string[];
}
