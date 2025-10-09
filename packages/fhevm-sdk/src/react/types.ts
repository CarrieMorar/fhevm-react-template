/**
 * React-specific types for FHEVM SDK
 */

import { ReactNode } from 'react';
import type { FhevmConfig } from '../core/types';

/**
 * FHEVM Provider props
 */
export interface FhevmProviderProps {
  /** SDK configuration */
  config: FhevmConfig;

  /** Children components */
  children: ReactNode;

  /** Auto-initialize on mount */
  autoInit?: boolean;
}

/**
 * FHEVM Context value
 */
export interface FhevmContextValue {
  /** Is SDK initialized */
  isInitialized: boolean;

  /** Is SDK initializing */
  isInitializing: boolean;

  /** Initialization error */
  error: Error | null;

  /** Initialize the SDK */
  init: () => Promise<void>;

  /** Get public key */
  getPublicKey: () => string | null;

  /** Configuration */
  config: FhevmConfig;
}
