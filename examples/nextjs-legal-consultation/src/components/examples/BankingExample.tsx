'use client';

import { useState } from 'react';
import { useEncrypt } from '@fhevm/sdk/react';
import { BrowserProvider } from 'ethers';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function BankingExample() {
  const { encrypt, isEncrypting } = useEncrypt();

  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [encryptedTransaction, setEncryptedTransaction] = useState<{
    amount: string;
    accountNumber: string;
    inputProof: string;
  } | null>(null);

  const contractAddress = '0x0000000000000000000000000000000000000000'; // Demo address

  const handleSubmitTransaction = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask');
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      const encrypted = await encrypt(contractAddress, userAddress, {
        amount: parseInt(amount) || 0,
        accountNumber: parseInt(accountNumber) || 0,
        transactionType: transactionType === 'deposit' ? 1 : 2,
      });

      setEncryptedTransaction({
        amount: encrypted.handles[0],
        accountNumber: encrypted.handles[1],
        inputProof: encrypted.inputProof,
      });
    } catch (error) {
      console.error('Transaction encryption failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Private Banking Transaction">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="number"
              label="Amount"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Input
              type="text"
              label="Account Number"
              placeholder="Enter account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="deposit"
                  checked={transactionType === 'deposit'}
                  onChange={(e) => setTransactionType(e.target.value as 'deposit')}
                  className="mr-2"
                />
                Deposit
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="withdrawal"
                  checked={transactionType === 'withdrawal'}
                  onChange={(e) => setTransactionType(e.target.value as 'withdrawal')}
                  className="mr-2"
                />
                Withdrawal
              </label>
            </div>
          </div>

          <Button
            onClick={handleSubmitTransaction}
            disabled={isEncrypting || !amount || !accountNumber}
            className="w-full"
          >
            {isEncrypting ? 'Processing...' : 'Submit Encrypted Transaction'}
          </Button>

          {encryptedTransaction && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg space-y-2">
              <p className="text-sm font-medium text-green-700">Transaction Encrypted Successfully</p>
              <div className="space-y-1 text-xs">
                <p className="font-mono text-green-600 break-all">
                  <strong>Amount Handle:</strong> {encryptedTransaction.amount}
                </p>
                <p className="font-mono text-green-600 break-all">
                  <strong>Account Handle:</strong> {encryptedTransaction.accountNumber}
                </p>
              </div>
              <p className="text-xs text-green-600 mt-2">
                This encrypted transaction can be submitted to the blockchain while keeping
                all details private.
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card title="Use Case: Private Banking">
        <div className="prose max-w-none">
          <p className="text-sm text-gray-600 mb-4">
            This example demonstrates how FHEVM can enable private banking operations:
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <strong>Confidential Transactions:</strong> Keep transaction amounts and account
              numbers encrypted on the blockchain
            </li>
            <li>
              <strong>Privacy Compliance:</strong> Meet regulatory requirements while maintaining
              user privacy
            </li>
            <li>
              <strong>Secure Balances:</strong> Account balances remain encrypted while still
              allowing computations
            </li>
            <li>
              <strong>Audit Capability:</strong> Authorized parties can decrypt specific
              transactions when needed
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
