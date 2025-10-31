'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';

interface ViewSectionProps {
  showStatus: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export function ViewSection({ showStatus }: ViewSectionProps) {
  const { contract, isConnected } = useWallet();
  const [consultationId, setConsultationId] = useState('');
  const [details, setDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadConsultation = async () => {
    if (!contract || !isConnected) {
      showStatus('Please connect your wallet first', 'error');
      return;
    }

    const id = parseInt(consultationId);
    if (!id || id < 1) {
      showStatus('Please enter a valid consultation ID', 'error');
      return;
    }

    setIsLoading(true);
    showStatus('Loading consultation...', 'info');

    try {
      const result = await contract.getConsultationDetails(id);
      setDetails({
        encryptedQuestion: result[0],
        encryptedResponse: result[1],
        timestamp: result[2].toString(),
        fee: result[3].toString(),
        isResolved: result[4],
        isPaid: result[5],
      });
      showStatus('Consultation loaded successfully', 'success');
    } catch (error) {
      console.error('Load consultation error:', error);
      showStatus('Failed to load consultation', 'error');
      setDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="card">
      <div className="section-header">
        <h2>👁️ View Consultation Details</h2>
        <p>Load and view your consultation status and responses</p>
      </div>

      <div className="form-group">
        <label htmlFor="consultationId">Consultation ID:</label>
        <div className="flex gap-2">
          <input
            type="number"
            id="consultationId"
            min="1"
            value={consultationId}
            onChange={(e) => setConsultationId(e.target.value)}
            placeholder="Enter consultation ID"
            className="flex-1"
          />
          <button
            onClick={loadConsultation}
            disabled={isLoading || !isConnected}
            className="btn btn-secondary"
          >
            {isLoading ? 'Loading...' : 'Load'}
          </button>
        </div>
      </div>

      {details && (
        <div className="details-card mt-4">
          <h3 className="font-semibold text-lg mb-3">Consultation Details</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Question (Encrypted):</strong> {details.encryptedQuestion}</p>
            <p><strong>Response (Encrypted):</strong> {details.encryptedResponse || 'No response yet'}</p>
            <p><strong>Timestamp:</strong> {new Date(Number(details.timestamp) * 1000).toLocaleString()}</p>
            <p><strong>Fee:</strong> {details.fee} wei</p>
            <p><strong>Status:</strong> {details.isResolved ? '✅ Resolved' : '⏳ Pending'}</p>
            <p><strong>Payment:</strong> {details.isPaid ? '💰 Paid' : '❌ Unpaid'}</p>
          </div>
        </div>
      )}
    </section>
  );
}
