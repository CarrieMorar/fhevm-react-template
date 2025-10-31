/**
 * Key Manager Component
 * Manages and displays FHEVM public keys and encryption parameters
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useFHEContext } from './FHEProvider';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface KeyInfo {
  publicKey: string | null;
  chainId: number;
  networkName: string;
  isReady: boolean;
}

/**
 * KeyManager Component
 *
 * Displays and manages FHEVM encryption keys and configuration.
 * Useful for debugging and verifying FHE setup.
 *
 * @example
 * ```tsx
 * import { KeyManager } from '@/components/fhe/KeyManager';
 *
 * function SettingsPage() {
 *   return (
 *     <div>
 *       <h1>FHE Configuration</h1>
 *       <KeyManager />
 *     </div>
 *   );
 * }
 * ```
 */
export function KeyManager() {
  const { isReady, isInitializing, error, instance, publicKey, config, init } = useFHEContext();
  const [keyInfo, setKeyInfo] = useState<KeyInfo>({
    publicKey: null,
    chainId: config?.chainId || 9000,
    networkName: config?.networkName || 'Zama Devnet',
    isReady: false,
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isReady && config) {
      setKeyInfo({
        publicKey: publicKey,
        chainId: config.chainId,
        networkName: config.networkName || 'Zama Devnet',
        isReady: true,
      });
    }
  }, [isReady, publicKey, config]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const truncateKey = (key: string, start = 20, end = 20) => {
    if (key.length <= start + end) return key;
    return `${key.slice(0, start)}...${key.slice(-end)}`;
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Key Manager</h2>
        {!isReady && (
          <Button
            onClick={init}
            disabled={isInitializing}
            variant="primary"
            size="sm"
          >
            {isInitializing ? 'Initializing...' : 'Initialize FHE'}
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-red-400 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Initialization Error</h3>
              <p className="text-sm text-red-700 mt-1">{error.message}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Status Indicator */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                keyInfo.isReady
                  ? 'bg-green-500 animate-pulse'
                  : 'bg-gray-300'
              }`}
            />
            <span className="text-sm font-medium text-gray-700">
              Status:
            </span>
          </div>
          <span
            className={`text-sm font-semibold ${
              keyInfo.isReady ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            {isInitializing
              ? 'Initializing...'
              : keyInfo.isReady
              ? 'Ready'
              : 'Not Initialized'}
          </span>
        </div>

        {/* Network Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Chain ID
            </p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {keyInfo.chainId}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Network
            </p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {keyInfo.networkName}
            </p>
          </div>
        </div>

        {/* Public Key Display */}
        {keyInfo.publicKey && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Public Key
              </p>
              <Button
                onClick={() => copyToClipboard(keyInfo.publicKey || '')}
                variant="secondary"
                size="sm"
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <p className="text-sm font-mono text-gray-700 break-all">
              {truncateKey(keyInfo.publicKey)}
            </p>
          </div>
        )}

        {/* Instance Information */}
        {instance && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-400 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Instance Active
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  FHEVM instance is initialized and ready for encryption operations.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Configuration Details */}
        {config && (
          <details className="bg-gray-50 rounded-lg p-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
              Advanced Configuration
            </summary>
            <div className="mt-4 space-y-2 text-sm">
              {config.rpcUrl && (
                <div>
                  <span className="font-medium text-gray-600">RPC URL:</span>
                  <span className="ml-2 text-gray-900 font-mono text-xs">
                    {config.rpcUrl}
                  </span>
                </div>
              )}
              {config.gatewayUrl && (
                <div>
                  <span className="font-medium text-gray-600">Gateway URL:</span>
                  <span className="ml-2 text-gray-900 font-mono text-xs">
                    {config.gatewayUrl}
                  </span>
                </div>
              )}
              {config.aclAddress && (
                <div>
                  <span className="font-medium text-gray-600">ACL Address:</span>
                  <span className="ml-2 text-gray-900 font-mono text-xs">
                    {config.aclAddress}
                  </span>
                </div>
              )}
            </div>
          </details>
        )}
      </div>

      {/* Help Text */}
      {!keyInfo.isReady && !isInitializing && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Initialize the FHE system to enable encryption and
            decryption operations. This will generate the necessary keys and establish
            a connection to the FHEVM network.
          </p>
        </div>
      )}
    </Card>
  );
}
