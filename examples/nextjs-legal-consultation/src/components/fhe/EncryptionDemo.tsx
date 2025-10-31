'use client';

import { useState } from 'react';
import { useEncrypt, useDecrypt } from '@fhevm/sdk/react';
import { BrowserProvider } from 'ethers';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function EncryptionDemo() {
  const { encrypt, isEncrypting, error: encryptError } = useEncrypt();
  const { decrypt, isDecrypting, decryptedValue } = useDecrypt();

  const [value, setValue] = useState('');
  const [encryptedHandle, setEncryptedHandle] = useState('');
  const [contractAddress] = useState('0x0000000000000000000000000000000000000000'); // Demo address

  const handleEncrypt = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask');
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      const encrypted = await encrypt(contractAddress, userAddress, {
        value: parseInt(value) || 0,
      });

      setEncryptedHandle(encrypted.handles[0]);
    } catch (error) {
      console.error('Encryption failed:', error);
    }
  };

  const handleDecrypt = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask');
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      await decrypt({
        contractAddress,
        handle: encryptedHandle,
        signer,
      });
    } catch (error) {
      console.error('Decryption failed:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Encryption Card */}
      <Card title="Encrypt Data">
        <div className="space-y-4">
          <Input
            type="number"
            label="Value to Encrypt"
            placeholder="Enter a number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Button
            onClick={handleEncrypt}
            disabled={isEncrypting || !value}
            className="w-full"
          >
            {isEncrypting ? 'Encrypting...' : 'Encrypt Value'}
          </Button>
          {encryptError && (
            <p className="text-sm text-red-600">{encryptError.message}</p>
          )}
          {encryptedHandle && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Encrypted Handle:</p>
              <p className="text-xs font-mono text-gray-600 break-all">
                {encryptedHandle}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Decryption Card */}
      <Card title="Decrypt Data">
        <div className="space-y-4">
          <Input
            label="Encrypted Handle"
            placeholder="Paste encrypted handle"
            value={encryptedHandle}
            onChange={(e) => setEncryptedHandle(e.target.value)}
          />
          <Button
            onClick={handleDecrypt}
            disabled={isDecrypting || !encryptedHandle}
            className="w-full"
          >
            {isDecrypting ? 'Decrypting...' : 'Decrypt Value'}
          </Button>
          {decryptedValue !== null && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-700 mb-2">Decrypted Value:</p>
              <p className="text-2xl font-bold text-green-600">
                {decryptedValue.toString()}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Info Card */}
      <Card title="How It Works" className="md:col-span-2">
        <div className="prose max-w-none">
          <ol className="space-y-2 text-sm text-gray-600">
            <li>
              <strong>Encryption:</strong> Enter a value and click encrypt. The SDK encrypts
              it using FHEVM and returns an encrypted handle.
            </li>
            <li>
              <strong>Decryption:</strong> Paste the encrypted handle and click decrypt.
              The SDK uses EIP-712 signatures to securely decrypt your data.
            </li>
            <li>
              <strong>Privacy:</strong> Only you can decrypt your encrypted data using your
              private key signature.
            </li>
          </ol>
        </div>
      </Card>
    </div>
  );
}
