'use client';

import { useState } from 'react';
import { useFhevm } from '@fhevm/sdk/react';
import EncryptionDemo from '@/components/fhe/EncryptionDemo';
import ComputationDemo from '@/components/fhe/ComputationDemo';
import BankingExample from '@/components/examples/BankingExample';
import MedicalExample from '@/components/examples/MedicalExample';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function Home() {
  const { isReady, isInitializing, init, error } = useFhevm();
  const [activeTab, setActiveTab] = useState<'encryption' | 'computation' | 'banking' | 'medical'>('encryption');

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md p-6">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700">{error.message}</p>
        </Card>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">FHEVM SDK Example</h1>
          <p className="text-gray-600 mb-6">
            Initialize the FHEVM SDK to start using Fully Homomorphic Encryption
          </p>
          <Button
            onClick={init}
            disabled={isInitializing}
            className="w-full"
          >
            {isInitializing ? 'Initializing...' : 'Initialize FHEVM'}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">FHEVM SDK Examples</h1>
          <p className="text-gray-600 text-lg">
            Explore practical examples of Fully Homomorphic Encryption
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap justify-center">
          <Button
            onClick={() => setActiveTab('encryption')}
            variant={activeTab === 'encryption' ? 'primary' : 'secondary'}
          >
            Encryption Demo
          </Button>
          <Button
            onClick={() => setActiveTab('computation')}
            variant={activeTab === 'computation' ? 'primary' : 'secondary'}
          >
            Computation Demo
          </Button>
          <Button
            onClick={() => setActiveTab('banking')}
            variant={activeTab === 'banking' ? 'primary' : 'secondary'}
          >
            Banking Example
          </Button>
          <Button
            onClick={() => setActiveTab('medical')}
            variant={activeTab === 'medical' ? 'primary' : 'secondary'}
          >
            Medical Example
          </Button>
        </div>

        {/* Content */}
        <div className="mt-8">
          {activeTab === 'encryption' && <EncryptionDemo />}
          {activeTab === 'computation' && <ComputationDemo />}
          {activeTab === 'banking' && <BankingExample />}
          {activeTab === 'medical' && <MedicalExample />}
        </div>
      </div>
    </main>
  );
}
