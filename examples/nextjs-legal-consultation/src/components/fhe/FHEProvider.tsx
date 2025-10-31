/**
 * FHE Context Provider
 * Provides FHEVM instance and configuration to the component tree
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeFhevmClient, getFhevmInstance } from '../../lib/fhe/client';
import type { FhevmConfig } from '../../lib/fhe/types';
import type { FhevmInstance } from '@fhevm/sdk';

interface FHEContextValue {
  isReady: boolean;
  isInitializing: boolean;
  error: Error | null;
  instance: FhevmInstance | null;
  publicKey: string | null;
  config: FhevmConfig | null;
  init: () => Promise<void>;
}

const FHEContext = createContext<FHEContextValue | undefined>(undefined);

interface FHEProviderProps {
  children: React.ReactNode;
  config?: FhevmConfig;
  autoInit?: boolean;
}

/**
 * FHE Context Provider Component
 *
 * Wraps your application to provide FHEVM functionality throughout the component tree.
 * Similar to wagmi's WagmiConfig provider pattern.
 *
 * @example
 * ```tsx
 * // In your root layout or _app.tsx
 * import { FHEProvider } from '@/components/fhe/FHEProvider';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <FHEProvider
 *           config={{
 *             chainId: 9000,
 *             networkName: 'Zama Devnet'
 *           }}
 *           autoInit
 *         >
 *           {children}
 *         </FHEProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function FHEProvider({
  children,
  config = {
    chainId: 9000,
    networkName: 'Zama Devnet',
  },
  autoInit = false,
}: FHEProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [instance, setInstance] = useState<FhevmInstance | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  const init = async () => {
    if (isReady || isInitializing) {
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      const fhevmInstance = await initializeFhevmClient(config);
      setInstance(fhevmInstance);

      // Try to get public key if available
      try {
        const existingInstance = getFhevmInstance();
        if (existingInstance) {
          setInstance(existingInstance);
        }
      } catch (e) {
        // Instance not fully initialized yet
      }

      setIsReady(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize FHEVM');
      setError(error);
      console.error('FHE Provider initialization error:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (autoInit && !isReady && !isInitializing) {
      init();
    }
  }, [autoInit, isReady, isInitializing]);

  const value: FHEContextValue = {
    isReady,
    isInitializing,
    error,
    instance,
    publicKey,
    config,
    init,
  };

  return <FHEContext.Provider value={value}>{children}</FHEContext.Provider>;
}

/**
 * Hook to access FHE context
 *
 * @throws Error if used outside FHEProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isReady, init, instance } = useFHEContext();
 *
 *   if (!isReady) {
 *     return <button onClick={init}>Initialize FHE</button>;
 *   }
 *
 *   return <div>FHE is ready!</div>;
 * }
 * ```
 */
export function useFHEContext(): FHEContextValue {
  const context = useContext(FHEContext);

  if (context === undefined) {
    throw new Error('useFHEContext must be used within an FHEProvider');
  }

  return context;
}
