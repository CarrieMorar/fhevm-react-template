'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { LEGAL_CATEGORIES } from '@/lib/contract';

interface LawyerSectionProps {
  showStatus: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export function LawyerSection({ showStatus }: LawyerSectionProps) {
  const { contract, account, isConnected } = useWallet();
  const [isRegistered, setIsRegistered] = useState(false);
  const [lawyerId, setLawyerId] = useState<number | null>(null);
  const [specialty, setSpecialty] = useState('');
  const [responseData, setResponseData] = useState({
    consultationId: '',
    response: '',
  });

  useEffect(() => {
    if (contract && account) {
      checkLawyerStatus();
    }
  }, [contract, account]);

  const checkLawyerStatus = async () => {
    if (!contract || !account) return;

    try {
      const registered = await contract.isRegisteredLawyer(account);
      setIsRegistered(registered);

      if (registered) {
        const id = await contract.getLawyerIdByAddress(account);
        setLawyerId(Number(id));
      }
    } catch (error) {
      console.error('Error checking lawyer status:', error);
    }
  };

  const registerLawyer = async () => {
    if (!contract || !isConnected) {
      showStatus('Please connect your wallet first', 'error');
      return;
    }

    const specialtyId = parseInt(specialty);
    if (!specialtyId || specialtyId < 1 || specialtyId > 8) {
      showStatus('Please select a valid specialty', 'error');
      return;
    }

    showStatus('Registering as lawyer...', 'info');

    try {
      const tx = await contract.registerLawyer(specialtyId);
      await tx.wait();
      showStatus('✅ Successfully registered as lawyer!', 'success');
      await checkLawyerStatus();
    } catch (error) {
      console.error('Register lawyer error:', error);
      showStatus('Failed to register as lawyer', 'error');
    }
  };

  const submitResponse = async () => {
    if (!contract || !isConnected) {
      showStatus('Please connect your wallet first', 'error');
      return;
    }

    const consultationId = parseInt(responseData.consultationId);
    if (!consultationId || !responseData.response) {
      showStatus('Please fill all fields', 'error');
      return;
    }

    showStatus('Submitting response...', 'info');

    try {
      const tx = await contract.provideResponse(consultationId, responseData.response);
      await tx.wait();
      showStatus('✅ Response submitted successfully!', 'success');
      setResponseData({ consultationId: '', response: '' });
    } catch (error) {
      console.error('Submit response error:', error);
      showStatus('Failed to submit response', 'error');
    }
  };

  return (
    <section className="card">
      <div className="section-header">
        <h2>⚖️ Lawyer Portal</h2>
        <p>Register as a lawyer and provide legal responses</p>
      </div>

      <div className="info-card mb-6">
        <h3 className="font-semibold">👤 Your Lawyer Status</h3>
        <p className="mt-2">
          {isRegistered ? (
            <>✅ Registered (Lawyer ID: {lawyerId})</>
          ) : (
            <>❌ Not registered</>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {!isRegistered && (
          <div className="action-card">
            <h3>📋 Register as Lawyer</h3>
            <div className="form-group">
              <label htmlFor="specialty">Your Specialty:</label>
              <select
                id="specialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              >
                <option value="">-- Select Specialty --</option>
                {LEGAL_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={registerLawyer}
              disabled={!isConnected}
              className="btn btn-primary w-full"
            >
              Register
            </button>
          </div>
        )}

        {isRegistered && (
          <div className="action-card">
            <h3>💬 Provide Response</h3>
            <div className="form-group">
              <label htmlFor="responseConsultationId">Consultation ID:</label>
              <input
                type="number"
                id="responseConsultationId"
                min="1"
                value={responseData.consultationId}
                onChange={(e) =>
                  setResponseData({ ...responseData, consultationId: e.target.value })
                }
                placeholder="Enter consultation ID"
              />
            </div>
            <div className="form-group">
              <label htmlFor="lawyerResponse">Your Legal Response (Encrypted):</label>
              <textarea
                id="lawyerResponse"
                rows={6}
                value={responseData.response}
                onChange={(e) =>
                  setResponseData({ ...responseData, response: e.target.value })
                }
                placeholder="Enter your professional legal response..."
              />
            </div>
            <button
              onClick={submitResponse}
              disabled={!isConnected}
              className="btn btn-primary w-full"
            >
              Submit Response
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
