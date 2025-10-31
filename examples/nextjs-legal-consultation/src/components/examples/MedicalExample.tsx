'use client';

import { useState } from 'react';
import { useEncrypt } from '@fhevm/sdk/react';
import { BrowserProvider } from 'ethers';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function MedicalExample() {
  const { encrypt, isEncrypting } = useEncrypt();

  const [patientId, setPatientId] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [bloodSugar, setBloodSugar] = useState('');
  const [encryptedRecord, setEncryptedRecord] = useState<{
    patientId: string;
    bloodPressure: string;
    heartRate: string;
    bloodSugar: string;
  } | null>(null);

  const contractAddress = '0x0000000000000000000000000000000000000000'; // Demo address

  const handleSubmitRecord = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask');
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      const encrypted = await encrypt(contractAddress, userAddress, {
        patientId: parseInt(patientId) || 0,
        bloodPressure: parseInt(bloodPressure) || 0,
        heartRate: parseInt(heartRate) || 0,
        bloodSugar: parseInt(bloodSugar) || 0,
      });

      setEncryptedRecord({
        patientId: encrypted.handles[0],
        bloodPressure: encrypted.handles[1],
        heartRate: encrypted.handles[2],
        bloodSugar: encrypted.handles[3],
      });
    } catch (error) {
      console.error('Medical record encryption failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Private Medical Records">
        <div className="space-y-4">
          <Input
            type="number"
            label="Patient ID"
            placeholder="Enter patient ID"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="number"
              label="Blood Pressure (mmHg)"
              placeholder="e.g., 120"
              value={bloodPressure}
              onChange={(e) => setBloodPressure(e.target.value)}
            />
            <Input
              type="number"
              label="Heart Rate (bpm)"
              placeholder="e.g., 72"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
            />
            <Input
              type="number"
              label="Blood Sugar (mg/dL)"
              placeholder="e.g., 95"
              value={bloodSugar}
              onChange={(e) => setBloodSugar(e.target.value)}
            />
          </div>

          <Button
            onClick={handleSubmitRecord}
            disabled={isEncrypting || !patientId || !bloodPressure || !heartRate || !bloodSugar}
            className="w-full"
          >
            {isEncrypting ? 'Encrypting...' : 'Submit Encrypted Medical Record'}
          </Button>

          {encryptedRecord && (
            <div className="mt-4 p-4 bg-purple-50 rounded-lg space-y-2">
              <p className="text-sm font-medium text-purple-700">
                Medical Record Encrypted Successfully
              </p>
              <div className="space-y-1 text-xs">
                <p className="font-mono text-purple-600 break-all">
                  <strong>Patient ID:</strong> {encryptedRecord.patientId}
                </p>
                <p className="font-mono text-purple-600 break-all">
                  <strong>Blood Pressure:</strong> {encryptedRecord.bloodPressure}
                </p>
                <p className="font-mono text-purple-600 break-all">
                  <strong>Heart Rate:</strong> {encryptedRecord.heartRate}
                </p>
                <p className="font-mono text-purple-600 break-all">
                  <strong>Blood Sugar:</strong> {encryptedRecord.bloodSugar}
                </p>
              </div>
              <p className="text-xs text-purple-600 mt-2">
                All medical data is encrypted and can be stored on-chain while maintaining
                HIPAA compliance.
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card title="Use Case: Healthcare Privacy">
        <div className="prose max-w-none">
          <p className="text-sm text-gray-600 mb-4">
            This example demonstrates how FHEVM enables private healthcare applications:
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <strong>HIPAA Compliance:</strong> Keep patient data encrypted while still
              allowing authorized computations
            </li>
            <li>
              <strong>Data Sharing:</strong> Share encrypted records with healthcare providers
              without exposing sensitive information
            </li>
            <li>
              <strong>Analytics:</strong> Perform statistical analysis on encrypted medical
              data across populations
            </li>
            <li>
              <strong>Access Control:</strong> Only authorized parties can decrypt specific
              medical records
            </li>
            <li>
              <strong>Audit Trail:</strong> Maintain transparent, immutable records while
              preserving privacy
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
