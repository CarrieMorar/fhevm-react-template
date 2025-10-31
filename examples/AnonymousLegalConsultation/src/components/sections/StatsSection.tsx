'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';

interface StatsSection Props {
  showStatus: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export function StatsSection({ showStatus }: StatsSectionProps) {
  const { contract, account, isConnected } = useWallet();
  const [stats, setStats] = useState({
    totalConsultations: '-',
    totalLawyers: '-',
    verifiedLawyers: '-',
  });

  useEffect(() => {
    if (contract && isConnected) {
      loadStatistics();
    }
  }, [contract, isConnected]);

  const loadStatistics = async () => {
    if (!contract) {
      showStatus('Contract not initialized', 'error');
      return;
    }

    showStatus('Loading statistics...', 'info');

    try {
      const result = await contract.getSystemStats();
      setStats({
        totalConsultations: result[0].toString(),
        totalLawyers: result[1].toString(),
        verifiedLawyers: result[2].toString(),
      });
      showStatus('Statistics loaded successfully', 'success');
    } catch (error) {
      console.error('Load statistics error:', error);
      showStatus('Failed to load statistics', 'error');
    }
  };

  return (
    <section className="card">
      <div className="section-header">
        <h2>📊 Platform Statistics</h2>
        <p>Real-time analytics and platform metrics</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-label">Total Consultations</div>
          <div className="stat-value">{stats.totalConsultations}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚖️</div>
          <div className="stat-label">Total Lawyers</div>
          <div className="stat-value">{stats.totalLawyers}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-label">Verified Lawyers</div>
          <div className="stat-value">{stats.verifiedLawyers}</div>
        </div>
      </div>

      {account && <ClientStatsCard account={account} contract={contract} showStatus={showStatus} />}

      <button onClick={loadStatistics} disabled={!isConnected} className="btn btn-primary btn-large w-full mt-6">
        🔄 Refresh Statistics
      </button>
    </section>
  );
}

function ClientStatsCard({ account, contract, showStatus }: any) {
  const [clientStats, setClientStats] = useState<any>(null);

  const loadClientStats = async () => {
    if (!contract || !account) return;

    try {
      const result = await contract.getClientStats(account);
      setClientStats({
        totalConsultations: result[0].toString(),
        totalSpent: result[1].toString(),
      });
    } catch (error) {
      console.error('Load client stats error:', error);
    }
  };

  useEffect(() => {
    if (contract && account) {
      loadClientStats();
    }
  }, [contract, account]);

  if (!clientStats) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-4">👤 Your Client Statistics</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-blue-600">Total Consultations</p>
          <p className="text-2xl font-bold text-blue-900">{clientStats.totalConsultations}</p>
        </div>
        <div>
          <p className="text-blue-600">Total Spent (wei)</p>
          <p className="text-2xl font-bold text-blue-900">{clientStats.totalSpent}</p>
        </div>
      </div>
    </div>
  );
}
