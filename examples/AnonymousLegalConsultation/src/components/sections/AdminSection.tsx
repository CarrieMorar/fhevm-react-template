'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { parseEther } from 'ethers';

interface AdminSectionProps {
  showStatus: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export function AdminSection({ showStatus }: AdminSectionProps) {
  const { contract, account, isConnected } = useWallet();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (contract && account) {
      checkAdminStatus();
    }
  }, [contract, account]);

  const checkAdminStatus = async () => {
    if (!contract || !account) return;

    try {
      const admin = await contract.admin();
      setIsAdmin(admin.toLowerCase() === account.toLowerCase());
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const assignConsultation = async (consultationId: string, lawyerId: string) => {
    if (!contract) return;

    try {
      showStatus('Assigning consultation...', 'info');
      const tx = await contract.assignConsultation(consultationId, lawyerId);
      await tx.wait();
      showStatus('✅ Consultation assigned successfully!', 'success');
    } catch (error) {
      console.error('Assign consultation error:', error);
      showStatus('Failed to assign consultation', 'error');
    }
  };

  const verifyLawyer = async (lawyerId: string) => {
    if (!contract) return;

    try {
      showStatus('Verifying lawyer...', 'info');
      const tx = await contract.verifyLawyer(lawyerId);
      await tx.wait();
      showStatus('✅ Lawyer verified successfully!', 'success');
    } catch (error) {
      console.error('Verify lawyer error:', error);
      showStatus('Failed to verify lawyer', 'error');
    }
  };

  const deactivateLawyer = async (lawyerId: string) => {
    if (!contract) return;

    try {
      showStatus('Deactivating lawyer...', 'info');
      const tx = await contract.deactivateLawyer(lawyerId);
      await tx.wait();
      showStatus('✅ Lawyer deactivated successfully!', 'success');
    } catch (error) {
      console.error('Deactivate lawyer error:', error);
      showStatus('Failed to deactivate lawyer', 'error');
    }
  };

  const updateRating = async (lawyerId: string, rating: string) => {
    if (!contract) return;

    try {
      showStatus('Updating rating...', 'info');
      const tx = await contract.updateLawyerRating(lawyerId, rating);
      await tx.wait();
      showStatus('✅ Rating updated successfully!', 'success');
    } catch (error) {
      console.error('Update rating error:', error);
      showStatus('Failed to update rating', 'error');
    }
  };

  const withdrawFees = async (amount: string) => {
    if (!contract) return;

    try {
      showStatus('Withdrawing fees...', 'info');
      const tx = await contract.withdrawFees(parseEther(amount));
      await tx.wait();
      showStatus('✅ Fees withdrawn successfully!', 'success');
    } catch (error) {
      console.error('Withdraw fees error:', error);
      showStatus('Failed to withdraw fees', 'error');
    }
  };

  if (!isAdmin) {
    return (
      <section className="card">
        <div className="section-header">
          <h2>🔧 Admin Control Panel</h2>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            ⚠️ You are not an admin. Only the contract admin can access this panel.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="section-header">
        <h2>🔧 Admin Control Panel</h2>
        <p>Administrative functions for platform management</p>
      </div>

      <div className="info-card mb-6">
        <h3 className="font-semibold">👤 Admin Status</h3>
        <p className="mt-2">✅ You are the contract admin</p>
      </div>

      <div className="admin-grid">
        <AdminActionCard
          title="📌 Assign Consultation"
          onAction={assignConsultation}
          fields={[
            { id: 'consultationId', label: 'Consultation ID', type: 'number' },
            { id: 'lawyerId', label: 'Lawyer ID', type: 'number' },
          ]}
          buttonLabel="Assign"
          buttonClass="btn-primary"
        />

        <AdminActionCard
          title="✅ Verify Lawyer"
          onAction={(values) => verifyLawyer(values.lawyerId)}
          fields={[{ id: 'lawyerId', label: 'Lawyer ID', type: 'number' }]}
          buttonLabel="Verify"
          buttonClass="btn-success"
        />

        <AdminActionCard
          title="🚫 Deactivate Lawyer"
          onAction={(values) => deactivateLawyer(values.lawyerId)}
          fields={[{ id: 'lawyerId', label: 'Lawyer ID', type: 'number' }]}
          buttonLabel="Deactivate"
          buttonClass="btn-danger"
        />

        <AdminActionCard
          title="⭐ Update Lawyer Rating"
          onAction={updateRating}
          fields={[
            { id: 'lawyerId', label: 'Lawyer ID', type: 'number' },
            { id: 'rating', label: 'New Rating (0-100)', type: 'number', min: 0, max: 100 },
          ]}
          buttonLabel="Update"
          buttonClass="btn-primary"
        />
      </div>
    </section>
  );
}

// Helper component for admin actions
function AdminActionCard({
  title,
  onAction,
  fields,
  buttonLabel,
  buttonClass,
}: {
  title: string;
  onAction: (values: any) => void;
  fields: Array<{ id: string; label: string; type: string; min?: number; max?: number }>;
  buttonLabel: string;
  buttonClass: string;
}) {
  const [values, setValues] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    onAction(values);
    setValues({});
  };

  return (
    <div className="action-card">
      <h3>{title}</h3>
      {fields.map((field) => (
        <div key={field.id} className="form-group">
          <label htmlFor={field.id}>{field.label}:</label>
          <input
            type={field.type}
            id={field.id}
            min={field.min}
            max={field.max}
            value={values[field.id] || ''}
            onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
            placeholder={field.label}
          />
        </div>
      ))}
      <button onClick={handleSubmit} className={`btn ${buttonClass} w-full`}>
        {buttonLabel}
      </button>
    </div>
  );
}
