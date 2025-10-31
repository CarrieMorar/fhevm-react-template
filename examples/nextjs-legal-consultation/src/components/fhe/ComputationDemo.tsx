'use client';

import { useState } from 'react';
import { useEncrypt } from '@fhevm/sdk/react';
import { BrowserProvider } from 'ethers';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function ComputationDemo() {
  const { encrypt, isEncrypting } = useEncrypt();

  const [num1, setNum1] = useState('');
  const [num2, setNum2] = useState('');
  const [operation, setOperation] = useState<'add' | 'multiply'>('add');
  const [result, setResult] = useState<{ handle1: string; handle2: string } | null>(null);
  const [contractAddress] = useState('0x0000000000000000000000000000000000000000');

  const handleCompute = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask');
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      const encrypted = await encrypt(contractAddress, userAddress, {
        value1: parseInt(num1) || 0,
        value2: parseInt(num2) || 0,
      });

      setResult({
        handle1: encrypted.handles[0],
        handle2: encrypted.handles[1],
      });
    } catch (error) {
      console.error('Computation failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Homomorphic Computation">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="First Number"
              placeholder="Enter first number"
              value={num1}
              onChange={(e) => setNum1(e.target.value)}
            />
            <Input
              type="number"
              label="Second Number"
              placeholder="Enter second number"
              value={num2}
              onChange={(e) => setNum2(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Operation
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="add"
                  checked={operation === 'add'}
                  onChange={(e) => setOperation(e.target.value as 'add')}
                  className="mr-2"
                />
                Add
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="multiply"
                  checked={operation === 'multiply'}
                  onChange={(e) => setOperation(e.target.value as 'multiply')}
                  className="mr-2"
                />
                Multiply
              </label>
            </div>
          </div>

          <Button
            onClick={handleCompute}
            disabled={isEncrypting || !num1 || !num2}
            className="w-full"
          >
            {isEncrypting ? 'Processing...' : `Encrypt and ${operation === 'add' ? 'Add' : 'Multiply'}`}
          </Button>

          {result && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-2">
              <p className="text-sm font-medium text-blue-700">Encrypted Values:</p>
              <div className="space-y-1">
                <p className="text-xs font-mono text-blue-600 break-all">
                  Value 1: {result.handle1}
                </p>
                <p className="text-xs font-mono text-blue-600 break-all">
                  Value 2: {result.handle2}
                </p>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                These encrypted values can be sent to a smart contract for homomorphic computation.
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card title="About Homomorphic Computation">
        <div className="prose max-w-none">
          <p className="text-sm text-gray-600 mb-4">
            Fully Homomorphic Encryption allows computations on encrypted data without decryption:
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <strong>Privacy-Preserving:</strong> Compute on sensitive data while keeping it encrypted
            </li>
            <li>
              <strong>Smart Contract Integration:</strong> Send encrypted values to contracts that
              perform operations directly on encrypted data
            </li>
            <li>
              <strong>Supported Operations:</strong> Addition, subtraction, multiplication,
              comparison, and more
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
