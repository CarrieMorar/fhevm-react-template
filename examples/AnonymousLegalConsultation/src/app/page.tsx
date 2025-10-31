'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useFHEContext } from '@/components/FHEProvider';
import { WalletConnect } from '@/components/WalletConnect';
import { ClientSection } from '@/components/sections/ClientSection';
import { ViewSection } from '@/components/sections/ViewSection';
import { LawyerSection } from '@/components/sections/LawyerSection';
import { AdminSection } from '@/components/sections/AdminSection';
import { StatsSection } from '@/components/sections/StatsSection';
import { StatusMessage } from '@/components/StatusMessage';

type SectionType = 'client' | 'view' | 'lawyer' | 'admin' | 'stats';

export default function Home() {
  const [activeSection, setActiveSection] = useState<SectionType>('client');
  const [status, setStatus] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);

  const { isConnected, account } = useWallet();
  const { isReady, isInitializing } = useFHEContext();

  const showStatus = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    setStatus({ message, type });
    setTimeout(() => setStatus(null), 5000);
  };

  const sections = [
    { id: 'client' as const, icon: '📝', label: 'Submit Consultation' },
    { id: 'view' as const, icon: '👁️', label: 'View Consultation' },
    { id: 'lawyer' as const, icon: '⚖️', label: 'Lawyer Portal' },
    { id: 'admin' as const, icon: '🔧', label: 'Admin Panel' },
    { id: 'stats' as const, icon: '📊', label: 'Statistics' },
  ];

  return (
    <div className="container">
      <header className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="header-content">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ⚖️ Anonymous Legal Consultation
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Secure, Private & Encrypted Legal Consultations on Blockchain
          </p>
          <WalletConnect />
        </div>
      </header>

      {isConnected && !isReady && !isInitializing && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            ⚠️ FHE system is not initialized. Some features may be limited.
          </p>
        </div>
      )}

      <nav className="navigation">
        {sections.map((section) => (
          <button
            key={section.id}
            className={`nav-btn ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            {section.icon} {section.label}
          </button>
        ))}
      </nav>

      <main>
        {activeSection === 'client' && (
          <ClientSection showStatus={showStatus} />
        )}
        {activeSection === 'view' && (
          <ViewSection showStatus={showStatus} />
        )}
        {activeSection === 'lawyer' && (
          <LawyerSection showStatus={showStatus} />
        )}
        {activeSection === 'admin' && (
          <AdminSection showStatus={showStatus} />
        )}
        {activeSection === 'stats' && (
          <StatsSection showStatus={showStatus} />
        )}
      </main>

      <footer className="mt-8 text-center text-gray-600 py-6 border-t">
        <p className="mb-2">🔒 Powered by Zama FHE Technology | Fully Homomorphic Encryption</p>
        <p className="text-sm">
          Contract: <span className="font-mono text-xs">{account ? account : '0xBA9Daca2dEE126861963cd31752A9aCBc5488Df7'}</span>
        </p>
      </footer>

      {status && <StatusMessage message={status.message} type={status.type} />}
    </div>
  );
}
