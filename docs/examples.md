# Examples Documentation

Real-world examples and use cases for the Universal FHEVM SDK.

---

## Table of Contents

- [Anonymous Legal Consultation](#anonymous-legal-consultation)
- [Private Voting System](#private-voting-system)
- [Confidential Token Transfer](#confidential-token-transfer)
- [Encrypted Auction](#encrypted-auction)
- [Private Healthcare Records](#private-healthcare-records)
- [Confidential Credit Score](#confidential-credit-score)

---

## Anonymous Legal Consultation

Full-featured legal consultation platform with encrypted client data.

### Smart Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";

contract AnonymousLegalConsultation {
    struct EncryptedConsultation {
        euint32 encryptedClientId;
        euint32 encryptedCategoryId;
        string encryptedQuestion;
        string encryptedResponse;
        uint256 timestamp;
        bool isResolved;
    }

    mapping(uint256 => EncryptedConsultation) public consultations;
    uint256 public consultationCounter;

    event ConsultationSubmitted(uint256 indexed id, uint256 timestamp);

    function submitConsultation(
        uint32 _clientId,
        uint32 _categoryId,
        string calldata _encryptedQuestion
    ) external payable {
        require(msg.value >= 0.001 ether, "Minimum fee required");

        consultationCounter++;

        euint32 encClientId = FHE.asEuint32(_clientId);
        euint32 encCategoryId = FHE.asEuint32(_categoryId);

        consultations[consultationCounter] = EncryptedConsultation({
            encryptedClientId: encClientId,
            encryptedCategoryId: encCategoryId,
            encryptedQuestion: _encryptedQuestion,
            encryptedResponse: "",
            timestamp: block.timestamp,
            isResolved: false
        });

        FHE.allowThis(encClientId);
        FHE.allowThis(encCategoryId);
        FHE.allow(encClientId, msg.sender);
        FHE.allow(encCategoryId, msg.sender);

        emit ConsultationSubmitted(consultationCounter, block.timestamp);
    }
}
```

### Frontend Implementation

```tsx
// components/ConsultationForm.tsx
import { useEncrypt } from '@fhevm/sdk/react';
import { useState } from 'react';
import { useContract } from './hooks/useContract';

export function ConsultationForm() {
  const { encrypt, isEncrypting } = useEncrypt();
  const contract = useContract();
  const [formData, setFormData] = useState({
    clientId: '',
    categoryId: '',
    question: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Encrypt sensitive IDs
    const encrypted = await encrypt(
      contract.address,
      userAddress,
      {
        clientId: Number(formData.clientId),
        categoryId: Number(formData.categoryId)
      }
    );

    if (!encrypted) return;

    // Submit to blockchain
    const tx = await contract.submitConsultation(
      encrypted.handles[0], // clientId
      encrypted.handles[1], // categoryId
      formData.question,    // Encrypted off-chain separately
      { value: ethers.parseEther('0.001') }
    );

    await tx.wait();
    alert('Consultation submitted!');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Client ID (Anonymous):</label>
        <input
          type="number"
          value={formData.clientId}
          onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
          placeholder="Enter anonymous ID"
          required
        />
      </div>

      <div>
        <label>Legal Category:</label>
        <select
          value={formData.categoryId}
          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          required
        >
          <option value="">Select category</option>
          <option value="1">Civil Law</option>
          <option value="2">Criminal Law</option>
          <option value="3">Family Law</option>
          <option value="4">Corporate Law</option>
        </select>
      </div>

      <div>
        <label>Your Question:</label>
        <textarea
          value={formData.question}
          onChange={(e) => setFormData({ ...formData, question: e.target.value })}
          placeholder="Describe your legal situation..."
          rows={5}
          required
        />
      </div>

      <button type="submit" disabled={isEncrypting}>
        {isEncrypting ? 'Encrypting & Submitting...' : 'Submit Consultation'}
      </button>
    </form>
  );
}
```

### View Consultations

```tsx
// components/ConsultationList.tsx
import { useDecrypt } from '@fhevm/sdk/react';
import { useEffect, useState } from 'react';

export function ConsultationList() {
  const { decrypt } = useDecrypt();
  const contract = useContract();
  const signer = useEthersSigner();
  const [consultations, setConsultations] = useState<any[]>([]);

  useEffect(() => {
    const loadConsultations = async () => {
      const count = await contract.consultationCounter();
      const items = [];

      for (let i = 1; i <= count; i++) {
        const consultation = await contract.consultations(i);

        // Decrypt client ID (requires user permission)
        const clientId = await decrypt(
          contract.address,
          consultation.encryptedClientId,
          signer
        );

        // Decrypt category ID
        const categoryId = await decrypt(
          contract.address,
          consultation.encryptedCategoryId,
          signer
        );

        items.push({
          id: i,
          clientId: clientId?.toString(),
          categoryId: categoryId?.toString(),
          question: consultation.encryptedQuestion,
          timestamp: consultation.timestamp,
          isResolved: consultation.isResolved
        });
      }

      setConsultations(items);
    };

    loadConsultations();
  }, []);

  return (
    <div>
      <h2>Your Consultations</h2>
      {consultations.map((item) => (
        <div key={item.id} className="consultation-card">
          <p><strong>Consultation #{item.id}</strong></p>
          <p>Client ID: {item.clientId}</p>
          <p>Category: {getCategoryName(item.categoryId)}</p>
          <p>Status: {item.isResolved ? 'Resolved' : 'Pending'}</p>
          <p>Submitted: {new Date(item.timestamp * 1000).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}

function getCategoryName(id: string): string {
  const categories: Record<string, string> = {
    '1': 'Civil Law',
    '2': 'Criminal Law',
    '3': 'Family Law',
    '4': 'Corporate Law'
  };
  return categories[id] || 'Unknown';
}
```

---

## Private Voting System

Encrypted voting with confidential ballot counting.

### Smart Contract

```solidity
contract PrivateVoting {
    struct Proposal {
        string description;
        euint32 yesVotes;
        euint32 noVotes;
        uint256 deadline;
        bool finalized;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    uint256 public proposalCounter;

    function vote(uint256 proposalId, bool voteYes) external {
        require(!hasVoted[proposalId][msg.sender], "Already voted");
        require(block.timestamp < proposals[proposalId].deadline, "Voting ended");

        // Encrypt vote
        ebool encryptedVote = FHE.asEbool(voteYes);

        // Increment appropriate counter homomorphically
        if (voteYes) {
            proposals[proposalId].yesVotes = FHE.add(
                proposals[proposalId].yesVotes,
                FHE.asEuint32(1)
            );
        } else {
            proposals[proposalId].noVotes = FHE.add(
                proposals[proposalId].noVotes,
                FHE.asEuint32(1)
            );
        }

        hasVoted[proposalId][msg.sender] = true;
    }

    function finalizeProposal(uint256 proposalId) external {
        require(block.timestamp >= proposals[proposalId].deadline, "Still active");
        proposals[proposalId].finalized = true;

        // Allow public decryption of results
        FHE.allowPublic(proposals[proposalId].yesVotes);
        FHE.allowPublic(proposals[proposalId].noVotes);
    }
}
```

### Frontend

```tsx
// components/VotingInterface.tsx
import { useEncrypt, usePublicDecrypt } from '@fhevm/sdk/react';

export function VotingInterface({ proposalId }: { proposalId: number }) {
  const { encrypt, isEncrypting } = useEncrypt();
  const { publicDecrypt } = usePublicDecrypt();
  const contract = useContract();

  const handleVote = async (voteYes: boolean) => {
    const tx = await contract.vote(proposalId, voteYes);
    await tx.wait();
    alert('Vote submitted!');
  };

  const viewResults = async () => {
    const proposal = await contract.proposals(proposalId);

    if (!proposal.finalized) {
      alert('Voting still in progress. Results hidden.');
      return;
    }

    // Public decryption after voting ends
    const yesVotes = await publicDecrypt(
      contract.address,
      proposal.yesVotes
    );

    const noVotes = await publicDecrypt(
      contract.address,
      proposal.noVotes
    );

    alert(`Yes: ${yesVotes}, No: ${noVotes}`);
  };

  return (
    <div>
      <h3>Proposal #{proposalId}</h3>
      <button onClick={() => handleVote(true)} disabled={isEncrypting}>
        Vote Yes
      </button>
      <button onClick={() => handleVote(false)} disabled={isEncrypting}>
        Vote No
      </button>
      <button onClick={viewResults}>View Results</button>
    </div>
  );
}
```

---

## Confidential Token Transfer

ERC20-style token with encrypted balances.

### Smart Contract

```solidity
contract ConfidentialToken {
    mapping(address => euint64) private balances;
    euint64 public totalSupply;

    function transfer(address to, uint64 amount) external {
        euint64 encAmount = FHE.asEuint64(amount);

        // Check balance (homomorphically)
        ebool hasSufficient = FHE.gte(balances[msg.sender], encAmount);
        require(FHE.decrypt(hasSufficient), "Insufficient balance");

        // Subtract from sender
        balances[msg.sender] = FHE.sub(balances[msg.sender], encAmount);

        // Add to receiver
        balances[to] = FHE.add(balances[to], encAmount);

        // Allow users to decrypt their own balances
        FHE.allow(balances[msg.sender], msg.sender);
        FHE.allow(balances[to], to);
    }

    function getBalance(address account) external view returns (euint64) {
        return balances[account];
    }
}
```

### Frontend

```tsx
// components/TokenTransfer.tsx
import { useEncrypt, useDecrypt } from '@fhevm/sdk/react';

export function TokenTransfer() {
  const { encrypt } = useEncrypt();
  const { decrypt } = useDecrypt();
  const contract = useContract();
  const signer = useEthersSigner();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [balance, setBalance] = useState<string | null>(null);

  const handleTransfer = async () => {
    const tx = await contract.transfer(
      recipient,
      BigInt(amount)
    );

    await tx.wait();
    alert('Transfer successful!');
  };

  const checkBalance = async () => {
    const encryptedBalance = await contract.getBalance(userAddress);

    const decrypted = await decrypt(
      contract.address,
      encryptedBalance,
      signer
    );

    setBalance(decrypted?.toString() || '0');
  };

  return (
    <div>
      <h3>Confidential Token Transfer</h3>

      <div>
        <button onClick={checkBalance}>Check Balance</button>
        {balance !== null && <p>Balance: {balance} tokens</p>}
      </div>

      <div>
        <input
          placeholder="Recipient address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={handleTransfer}>Transfer</button>
      </div>
    </div>
  );
}
```

---

## Encrypted Auction

Sealed-bid auction with private bids revealed after deadline.

### Smart Contract

```solidity
contract EncryptedAuction {
    struct Auction {
        string item;
        euint64 highestBid;
        address highestBidder;
        uint256 deadline;
        bool finalized;
    }

    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => mapping(address => euint64)) private bids;

    function placeBid(uint256 auctionId, uint64 bidAmount) external {
        require(block.timestamp < auctions[auctionId].deadline, "Auction ended");

        euint64 encBid = FHE.asEuint64(bidAmount);
        bids[auctionId][msg.sender] = encBid;

        // Compare with current highest (homomorphically)
        ebool isHigher = FHE.gt(encBid, auctions[auctionId].highestBid);

        if (FHE.decrypt(isHigher)) {
            auctions[auctionId].highestBid = encBid;
            auctions[auctionId].highestBidder = msg.sender;
        }

        FHE.allow(encBid, msg.sender);
    }

    function finalizeAuction(uint256 auctionId) external {
        require(block.timestamp >= auctions[auctionId].deadline, "Still active");

        auctions[auctionId].finalized = true;

        // Reveal winning bid
        FHE.allowPublic(auctions[auctionId].highestBid);
    }
}
```

### Frontend

```tsx
// components/AuctionBidding.tsx
export function AuctionBidding({ auctionId }: { auctionId: number }) {
  const { encrypt } = useEncrypt();
  const { publicDecrypt } = usePublicDecrypt();
  const contract = useContract();
  const [bidAmount, setBidAmount] = useState('');

  const placeBid = async () => {
    const tx = await contract.placeBid(
      auctionId,
      BigInt(bidAmount)
    );

    await tx.wait();
    alert('Bid placed! Amount is confidential until auction ends.');
  };

  const checkWinner = async () => {
    const auction = await contract.auctions(auctionId);

    if (!auction.finalized) {
      alert('Auction still active. Winner not revealed yet.');
      return;
    }

    const winningBid = await publicDecrypt(
      contract.address,
      auction.highestBid
    );

    alert(`Winner: ${auction.highestBidder}\nBid: ${winningBid} ETH`);
  };

  return (
    <div>
      <h3>Auction #{auctionId}</h3>
      <input
        type="number"
        placeholder="Bid amount (ETH)"
        value={bidAmount}
        onChange={(e) => setBidAmount(e.target.value)}
      />
      <button onClick={placeBid}>Place Bid</button>
      <button onClick={checkWinner}>Check Winner</button>
    </div>
  );
}
```

---

## Private Healthcare Records

Patient records with encrypted medical data.

### Smart Contract

```solidity
contract PrivateHealthcare {
    struct MedicalRecord {
        euint32 patientId;
        euint32 diagnosis;
        euint32 treatment;
        uint256 timestamp;
        address doctor;
    }

    mapping(uint256 => MedicalRecord) private records;
    mapping(address => bool) public authorizedDoctors;
    uint256 public recordCounter;

    modifier onlyAuthorizedDoctor() {
        require(authorizedDoctors[msg.sender], "Not authorized");
        _;
    }

    function addRecord(
        uint32 patientId,
        uint32 diagnosis,
        uint32 treatment
    ) external onlyAuthorizedDoctor {
        recordCounter++;

        euint32 encPatientId = FHE.asEuint32(patientId);
        euint32 encDiagnosis = FHE.asEuint32(diagnosis);
        euint32 encTreatment = FHE.asEuint32(treatment);

        records[recordCounter] = MedicalRecord({
            patientId: encPatientId,
            diagnosis: encDiagnosis,
            treatment: encTreatment,
            timestamp: block.timestamp,
            doctor: msg.sender
        });

        // Allow doctor and patient to decrypt
        FHE.allow(encPatientId, msg.sender);
        FHE.allow(encDiagnosis, msg.sender);
        FHE.allow(encTreatment, msg.sender);

        // Patient can view their own records
        FHE.allowThis(encPatientId);
    }

    function getRecord(uint256 recordId)
        external
        view
        returns (MedicalRecord memory)
    {
        return records[recordId];
    }
}
```

### Frontend

```tsx
// components/MedicalRecordForm.tsx
export function MedicalRecordForm() {
  const { encrypt, isEncrypting } = useEncrypt();
  const contract = useContract();
  const [formData, setFormData] = useState({
    patientId: '',
    diagnosis: '',
    treatment: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const encrypted = await encrypt(
      contract.address,
      userAddress,
      {
        patientId: Number(formData.patientId),
        diagnosis: Number(formData.diagnosis),
        treatment: Number(formData.treatment)
      }
    );

    if (!encrypted) return;

    const tx = await contract.addRecord(
      encrypted.handles[0], // patientId
      encrypted.handles[1], // diagnosis
      encrypted.handles[2], // treatment
      encrypted.inputProof
    );

    await tx.wait();
    alert('Medical record added successfully!');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        placeholder="Patient ID (encrypted)"
        value={formData.patientId}
        onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
        required
      />
      <input
        type="number"
        placeholder="Diagnosis code (encrypted)"
        value={formData.diagnosis}
        onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
        required
      />
      <input
        type="number"
        placeholder="Treatment code (encrypted)"
        value={formData.treatment}
        onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
        required
      />
      <button type="submit" disabled={isEncrypting}>
        {isEncrypting ? 'Encrypting...' : 'Add Record'}
      </button>
    </form>
  );
}

// components/PatientRecords.tsx
export function PatientRecords({ patientAddress }: { patientAddress: string }) {
  const { decrypt } = useDecrypt();
  const signer = useEthersSigner();
  const contract = useContract();
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    const loadRecords = async () => {
      const count = await contract.recordCounter();
      const items = [];

      for (let i = 1; i <= count; i++) {
        const record = await contract.getRecord(i);

        // Decrypt (requires patient or doctor permission)
        const patientId = await decrypt(
          contract.address,
          record.patientId,
          signer
        );

        const diagnosis = await decrypt(
          contract.address,
          record.diagnosis,
          signer
        );

        const treatment = await decrypt(
          contract.address,
          record.treatment,
          signer
        );

        items.push({
          id: i,
          patientId: patientId?.toString(),
          diagnosis: diagnosis?.toString(),
          treatment: treatment?.toString(),
          timestamp: record.timestamp,
          doctor: record.doctor
        });
      }

      setRecords(items);
    };

    loadRecords();
  }, [patientAddress]);

  return (
    <div>
      <h2>Patient Medical Records</h2>
      {records.map((record) => (
        <div key={record.id} className="record-card">
          <p><strong>Record #{record.id}</strong></p>
          <p>Patient ID: {record.patientId}</p>
          <p>Diagnosis: {getDiagnosisName(record.diagnosis)}</p>
          <p>Treatment: {getTreatmentName(record.treatment)}</p>
          <p>Date: {new Date(record.timestamp * 1000).toLocaleDateString()}</p>
          <p>Doctor: {record.doctor}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Confidential Credit Score

Credit scoring with encrypted financial data.

### Smart Contract

```solidity
contract ConfidentialCreditScore {
    struct CreditProfile {
        euint32 score;
        euint32 income;
        euint32 debt;
        uint256 lastUpdated;
        bool exists;
    }

    mapping(address => CreditProfile) private profiles;

    function updateProfile(
        uint32 income,
        uint32 debt
    ) external {
        euint32 encIncome = FHE.asEuint32(income);
        euint32 encDebt = FHE.asEuint32(debt);

        // Calculate credit score homomorphically
        // Simple formula: score = (income - debt) / 100
        euint32 difference = FHE.sub(encIncome, encDebt);
        euint32 score = FHE.div(difference, FHE.asEuint32(100));

        profiles[msg.sender] = CreditProfile({
            score: score,
            income: encIncome,
            debt: encDebt,
            lastUpdated: block.timestamp,
            exists: true
        });

        // Allow user to decrypt their own data
        FHE.allow(score, msg.sender);
        FHE.allow(encIncome, msg.sender);
        FHE.allow(encDebt, msg.sender);
    }

    function checkEligibility(address user, uint32 minScore)
        external
        view
        returns (ebool)
    {
        require(profiles[user].exists, "Profile not found");

        euint32 requiredScore = FHE.asEuint32(minScore);
        return FHE.gte(profiles[user].score, requiredScore);
    }
}
```

### Frontend

```tsx
// components/CreditScoreManager.tsx
export function CreditScoreManager() {
  const { encrypt } = useEncrypt();
  const { decrypt } = useDecrypt();
  const contract = useContract();
  const signer = useEthersSigner();
  const [income, setIncome] = useState('');
  const [debt, setDebt] = useState('');
  const [creditScore, setCreditScore] = useState<string | null>(null);

  const updateProfile = async () => {
    const tx = await contract.updateProfile(
      Number(income),
      Number(debt)
    );

    await tx.wait();
    alert('Profile updated!');
  };

  const viewScore = async () => {
    const profile = await contract.profiles(userAddress);

    const score = await decrypt(
      contract.address,
      profile.score,
      signer
    );

    setCreditScore(score?.toString() || '0');
  };

  const checkLoanEligibility = async (minScore: number) => {
    const eligible = await contract.checkEligibility(userAddress, minScore);

    // ebool result - need to decrypt
    const isEligible = await decrypt(
      contract.address,
      eligible,
      signer
    );

    alert(isEligible === 1n ? 'Eligible!' : 'Not eligible');
  };

  return (
    <div>
      <h3>Credit Score Management</h3>

      <div>
        <input
          type="number"
          placeholder="Annual income"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
        />
        <input
          type="number"
          placeholder="Total debt"
          value={debt}
          onChange={(e) => setDebt(e.target.value)}
        />
        <button onClick={updateProfile}>Update Profile</button>
      </div>

      <div>
        <button onClick={viewScore}>View Credit Score</button>
        {creditScore !== null && (
          <p>Your credit score: {creditScore}</p>
        )}
      </div>

      <div>
        <button onClick={() => checkLoanEligibility(700)}>
          Check Loan Eligibility (Score ≥ 700)
        </button>
      </div>
    </div>
  );
}
```

---

## Node.js CLI Examples

### Batch Encryption Script

```typescript
// scripts/batch-encrypt.ts
import { createFhevmInstance, encryptBatch } from '@fhevm/sdk';
import { JsonRpcProvider } from 'ethers';

async function main() {
  const client = createFhevmInstance({
    chainId: 9000,
    rpcUrl: 'https://devnet.zama.ai'
  });

  const provider = new JsonRpcProvider('https://devnet.zama.ai');
  await client.init(provider);

  console.log('Encrypting multiple values...');

  const encrypted = await encryptBatch(
    '0x1234...', // contract
    '0x5678...', // user
    {
      clientId: 42,
      categoryId: 5,
      amount: 1000,
      isUrgent: true
    }
  );

  console.log('Encrypted handles:', encrypted.handles);
  console.log('Proof:', encrypted.inputProof);
}

main().catch(console.error);
```

### Automated Decryption

```typescript
// scripts/decrypt-all.ts
import { createFhevmInstance, userDecrypt } from '@fhevm/sdk';
import { Wallet, JsonRpcProvider } from 'ethers';

async function main() {
  const client = createFhevmInstance({ chainId: 9000 });
  const provider = new JsonRpcProvider('https://devnet.zama.ai');
  await client.init(provider);

  const wallet = new Wallet(process.env.PRIVATE_KEY!, provider);

  const handles = [
    '0xabcd...',
    '0xef01...',
    '0x2345...'
  ];

  for (const handle of handles) {
    const value = await userDecrypt({
      contractAddress: '0x1234...',
      handle,
      signer: wallet
    });

    console.log(`Handle ${handle}: ${value}`);
  }
}

main().catch(console.error);
```

---

## Testing Examples

### Unit Tests

```typescript
// tests/encryption.test.ts
import { expect } from 'chai';
import { encryptInput } from '@fhevm/sdk';

describe('Encryption', () => {
  it('should auto-detect euint8', async () => {
    const encrypted = await encryptInput(
      contractAddress,
      userAddress,
      { value: 42 }
    );

    expect(encrypted.handles).to.have.length(1);
    expect(encrypted.inputProof).to.be.a('string');
  });

  it('should handle batch encryption', async () => {
    const encrypted = await encryptInput(
      contractAddress,
      userAddress,
      { id: 1, amount: 1000, active: true }
    );

    expect(encrypted.handles).to.have.length(3);
  });
});
```

---

For more information, see:
- [API Reference](./api-reference.md)
- [Quick Start Guide](./quick-start.md)
- [Architecture](./architecture.md)

Live demo: https://fhe-legal-consultation.vercel.app/
