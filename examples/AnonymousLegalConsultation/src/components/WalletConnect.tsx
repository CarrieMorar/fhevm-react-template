'use client';

import { useWallet } from '@/hooks/useWallet';

export function WalletConnect() {
  const { account, isConnected, isConnecting, error, connectWallet } = useWallet();

  return (
    <div className="wallet-section">
      {!isConnected ? (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="btn btn-primary"
        >
          {isConnecting ? '🔄 Connecting...' : '🔗 Connect Wallet'}
        </button>
      ) : (
        <div className="flex items-center gap-4">
          <button className="btn btn-primary" disabled>
            ✅ Connected
          </button>
          <div className="wallet-info">
            <strong>Address:</strong>{' '}
            {account ? `${account.substring(0, 6)}...${account.substring(38)}` : ''}
          </div>
        </div>
      )}
      {error && (
        <div className="text-red-600 text-sm mt-2">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
