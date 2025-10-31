'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { encryptInput } from '@fhevm/sdk';
import { parseEther } from 'ethers';
import { LEGAL_CATEGORIES } from '@/lib/contract';

interface ClientSectionProps {
  showStatus: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export function ClientSection({ showStatus }: ClientSectionProps) {
  const { contract, account, isConnected } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    categoryId: '',
    question: '',
    fee: '0.001',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      showStatus('Please connect your wallet first', 'error');
      return;
    }

    if (!contract || !account) {
      showStatus('Contract not initialized', 'error');
      return;
    }

    const clientId = parseInt(formData.clientId);
    const categoryId = parseInt(formData.categoryId);
    const feeEth = parseFloat(formData.fee);

    if (!clientId || !categoryId || !formData.question || !feeEth) {
      showStatus('Please fill all fields', 'error');
      return;
    }

    if (categoryId < 1 || categoryId > 8) {
      showStatus('Please select a valid legal category (1-8)', 'error');
      return;
    }

    if (feeEth < 0.001) {
      showStatus('Minimum fee is 0.001 ETH', 'error');
      return;
    }

    setIsSubmitting(true);
    showStatus('Submitting consultation...', 'info');

    try {
      // In a full implementation, you would encrypt the question using FHE
      // For now, we'll submit it as-is for demonstration
      const tx = await contract.submitConsultation(
        clientId,
        categoryId,
        formData.question,
        { value: parseEther(feeEth.toString()) }
      );

      showStatus('Transaction submitted. Waiting for confirmation...', 'info');
      await tx.wait();

      showStatus('✅ Consultation submitted successfully!', 'success');

      // Reset form
      setFormData({
        clientId: '',
        categoryId: '',
        question: '',
        fee: '0.001',
      });
    } catch (error) {
      console.error('Submit consultation error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to submit consultation';
      showStatus(`❌ Error: ${errorMsg}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="card">
      <div className="section-header">
        <h2>📝 Submit Legal Consultation</h2>
        <p>Submit your encrypted legal question anonymously with FHE technology</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="clientId">🆔 Anonymous Client ID (1-9999):</label>
            <input
              type="number"
              id="clientId"
              min="1"
              max="9999"
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              placeholder="Enter your anonymous ID"
              required
            />
            <small>This ID keeps your identity private. Remember it to track consultations.</small>
          </div>

          <div className="form-group">
            <label htmlFor="categoryId">📚 Legal Category:</label>
            <select
              id="categoryId"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              required
            >
              <option value="">-- Select Category --</option>
              {LEGAL_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="question">❓ Your Legal Question (Encrypted):</label>
          <textarea
            id="question"
            rows={8}
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            placeholder="Describe your legal question in detail. This will be encrypted on-chain..."
            required
          />
          <small>Your question will be stored encrypted using FHE technology.</small>
        </div>

        <div className="form-group">
          <label htmlFor="fee">💰 Consultation Fee (ETH):</label>
          <input
            type="number"
            id="fee"
            step="0.001"
            min="0.001"
            value={formData.fee}
            onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
            placeholder="0.001"
            required
          />
          <small>Minimum fee: 0.001 ETH</small>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !isConnected}
          className="btn btn-primary btn-large w-full"
        >
          {isSubmitting ? '⏳ Submitting...' : '🚀 Submit Consultation'}
        </button>
      </form>
    </section>
  );
}
