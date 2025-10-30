# @fhevm/sdk

**Universal FHEVM SDK** - Framework-agnostic toolkit for building confidential dApps with Fully Homomorphic Encryption.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![npm version](https://img.shields.io/badge/npm-v1.0.0-blue)](https://npmjs.com/package/@fhevm/sdk)

A wagmi-like SDK for [Zama FHEVM](https://www.zama.ai/) that makes building privacy-preserving dApps simple, consistent, and developer-friendly.

---

## 📦 Installation

```bash
npm install @fhevm/sdk ethers
```

**Requirements:**
- Node.js >=18
- ethers.js v6.x
- React 18+ (optional, for React hooks)

---

## 🚀 Quick Start

### React / Next.js

```tsx
import { FhevmProvider, useFhevm, useEncrypt } from '@fhevm/sdk/react';

// 1. Wrap your app
export default function App() {
  return (
    <FhevmProvider config={{ chainId: 9000 }} autoInit>
      <YourApp />
    </FhevmProvider>
  );
}

// 2. Use in components
function YourApp() {
  const { isReady } = useFhevm();
  const { encrypt } = useEncrypt();

  const handleEncrypt = async () => {
    const encrypted = await encrypt(contractAddress, userAddress, {
      amount: 1000,
      isActive: true
    });
    console.log('Encrypted:', encrypted);
  };

  return <button onClick={handleEncrypt}>Encrypt Data</button>;
}
```

### Vanilla JavaScript / Node.js

```javascript
import { createFhevmInstance, encryptInput, userDecrypt } from '@fhevm/sdk';

// 1. Create instance
const fhevm = createFhevmInstance({ chainId: 9000 });

// 2. Initialize
await fhevm.init(provider);

// 3. Encrypt
const encrypted = await encryptInput(contractAddress, userAddress, {
  amount: 1000,
  category: 1
});

// 4. Decrypt
const value = await userDecrypt({
  contractAddress,
  handle: encryptedHandle,
  signer
});
```

---

## 🏗️ Architecture

### Framework-Agnostic Core

The SDK is built with a clean separation between core functionality and framework adapters:

```
@fhevm/sdk/
├── core/              # Framework-agnostic
│   ├── fhevm-client   # Instance management
│   ├── encryption     # Encryption utilities
│   ├── decryption     # Decryption utilities
│   └── types          # TypeScript definitions
├── react/             # React adapter (optional)
│   ├── FhevmProvider  # Context provider
│   ├── useFhevm       # Core hook
│   ├── useEncrypt     # Encryption hook
│   └── useDecrypt     # Decryption hook
└── utils/             # Helper utilities
    ├── abi            # ABI utilities
    └── eip712         # EIP-712 signatures
```

### Exports

The SDK provides two entry points:

```typescript
// Core SDK (framework-agnostic)
import { createFhevmInstance, encryptInput } from '@fhevm/sdk';

// React hooks
import { FhevmProvider, useFhevm, useEncrypt } from '@fhevm/sdk/react';
```

---

## 📚 API Reference

### Core API

#### `createFhevmInstance(config)`

Create a new FHEVM client instance.

```typescript
import { createFhevmInstance } from '@fhevm/sdk';

const client = createFhevmInstance({
  chainId: 9000,
  networkName: 'Zama Devnet',
  rpcUrl?: string,
  gatewayUrl?: string,
  aclAddress?: string
});

await client.init(provider);
```

#### `encryptInput(contractAddress, userAddress, inputs)`

Encrypt multiple inputs with automatic type detection.

```typescript
import { encryptInput } from '@fhevm/sdk';

const result = await encryptInput(
  '0x1234...', // contract address
  '0x5678...', // user address
  {
    amount: 1000,      // auto-detected as uint32
    isActive: true,    // auto-detected as bool
    category: 5        // auto-detected as uint8
  }
);

// Returns: { handles: string[], inputProof: string }
```

#### `userDecrypt(params)`

Decrypt encrypted data with EIP-712 signature.

```typescript
import { userDecrypt } from '@fhevm/sdk';

const value = await userDecrypt({
  contractAddress: '0x1234...',
  handle: '0xabcd...',
  signer: ethersWalletOrSigner
});

console.log(value); // bigint
```

#### `publicDecrypt(params)`

Decrypt publicly accessible data (no signature required).

```typescript
import { publicDecrypt } from '@fhevm/sdk';

const value = await publicDecrypt({
  contractAddress: '0x1234...',
  handle: '0xabcd...'
});
```

### React Hooks

#### `useFhevm()`

Core hook for FHEVM state management.

```typescript
const {
  isReady,        // boolean - SDK ready
  isInitializing, // boolean - currently initializing
  error,          // Error | null
  init,           // () => Promise<void>
  publicKey,      // string | null
  config          // FhevmConfig
} = useFhevm();
```

#### `useEncrypt()`

Hook for encryption operations.

```typescript
const {
  encrypt,        // (address, user, inputs) => Promise<EncryptedInput>
  isEncrypting,   // boolean
  error,          // Error | null
  clearError      // () => void
} = useEncrypt();

// Usage
const encrypted = await encrypt(contractAddress, userAddress, {
  amount: 1000,
  isActive: true
});
```

#### `useDecrypt()`

Hook for user decryption.

```typescript
const {
  decrypt,        // (params) => Promise<bigint>
  isDecrypting,   // boolean
  decryptedValue, // bigint | null
  error,          // Error | null
  clear           // () => void
} = useDecrypt();

// Usage
const value = await decrypt({
  contractAddress,
  handle,
  signer
});
```

#### `useBatchEncrypt()`

Batch encryption with type specification.

```typescript
const { encryptBatch } = useBatchEncrypt();

const encrypted = await encryptBatch(
  contractAddress,
  userAddress,
  [
    { type: 'uint32', value: 1000 },
    { type: 'bool', value: true },
    { type: 'address', value: '0x...' }
  ]
);
```

---

## 🎯 Features

### ✅ Framework-Agnostic Core
- Works with React, Vue, Node.js, or any JavaScript environment
- Zero framework dependencies in core package
- Optional framework adapters

### ✅ Wagmi-Like API
- Familiar hooks pattern: `useFhevm()`, `useEncrypt()`, `useDecrypt()`
- Provider-based architecture for React
- Simple function calls for non-React environments

### ✅ Complete FHEVM Workflow
- Initialization with automatic provider detection
- Input encryption (bool, uint8, uint16, uint32, uint64, address)
- User decryption with EIP-712 signatures
- Public decryption for shared data
- Batch operations support

### ✅ All-in-One Package
- Wraps `fhevmjs`, `ethers`, and all FHE dependencies
- No scattered dependencies - one `npm install`
- TypeScript definitions included

### ✅ Developer-Friendly
- < 10 lines of code to get started
- Clear error messages and documentation
- Minimal boilerplate

---

## 🔧 Type Definitions

### Core Types

```typescript
// FHEVM Configuration
interface FhevmConfig {
  chainId: number;
  networkName?: string;
  rpcUrl?: string;
  gatewayUrl?: string;
  aclAddress?: string;
}

// Encryption Result
interface EncryptionResult {
  handles: string[];
  inputProof: string;
}

// Decryption Parameters
interface DecryptionParams {
  contractAddress: string;
  handle: string;
  signer: any; // ethers.Signer
}

// Encryptable Types
type EncryptableType = 'bool' | 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'address';

// Typed Value for Batch Operations
interface TypedValue {
  type: EncryptableType;
  value: number | boolean | string;
}
```

---

## 💡 Usage Examples

### Example 1: Simple Encryption/Decryption

```typescript
import { FhevmProvider, useEncrypt, useDecrypt } from '@fhevm/sdk/react';
import { BrowserProvider } from 'ethers';

function PrivateVoting() {
  const { encrypt } = useEncrypt();
  const { decrypt } = useDecrypt();

  const castVote = async (candidateId: number) => {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    // Encrypt vote
    const encrypted = await encrypt(contractAddress, address, {
      candidateId,
      isValid: true
    });

    // Submit to contract
    const contract = new Contract(contractAddress, abi, signer);
    const tx = await contract.castVote(
      encrypted.handles[0],
      encrypted.handles[1],
      encrypted.inputProof
    );

    await tx.wait();
  };

  return <button onClick={() => castVote(1)}>Vote for Candidate 1</button>;
}
```

### Example 2: Batch Operations

```typescript
import { useBatchEncrypt } from '@fhevm/sdk/react';

function BankingApp() {
  const { encryptBatch } = useBatchEncrypt();

  const transferFunds = async (amount: number, recipient: string) => {
    const encrypted = await encryptBatch(
      contractAddress,
      userAddress,
      [
        { type: 'uint64', value: amount },
        { type: 'address', value: recipient },
        { type: 'bool', value: true } // approval flag
      ]
    );

    // Use encrypted data in transaction...
  };

  return <button onClick={() => transferFunds(1000, '0x...')}>Transfer</button>;
}
```

### Example 3: Server-Side Usage (Node.js)

```javascript
const { createFhevmInstance, encryptInput } = require('@fhevm/sdk');
const { JsonRpcProvider } = require('ethers');

async function serverSideEncryption() {
  // Create instance
  const fhevm = createFhevmInstance({
    chainId: 9000,
    rpcUrl: 'https://devnet.zama.ai'
  });

  // Initialize
  const provider = new JsonRpcProvider('https://devnet.zama.ai');
  await fhevm.init(provider);

  // Encrypt data
  const encrypted = await encryptInput(
    contractAddress,
    userAddress,
    { secretValue: 42 }
  );

  console.log('Encrypted handles:', encrypted.handles);
  console.log('Input proof:', encrypted.inputProof);
}
```

---

## 🛠️ Development

### Building from Source

```bash
# Clone repository
git clone https://github.com/your-org/fhevm-react-template.git
cd fhevm-react-template

# Install dependencies
npm install

# Build SDK
cd packages/fhevm-sdk
npm run build

# Watch mode
npm run dev
```

### Running Tests

```bash
npm test
```

### Type Checking

```bash
npm run type-check
```

---

## 📖 Additional Resources

- [Full Documentation](../../README.md)
- [Examples](../../examples/)
- [Zama FHEVM Docs](https://docs.zama.ai/fhevm)
- [fhevmjs Library](https://github.com/zama-ai/fhevmjs)

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

---

## 📄 License

MIT License - see [LICENSE](../../LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Zama** - For the revolutionary FHEVM technology
- **fhevmjs Team** - For the core FHE library
- **wagmi** - For API design inspiration

---

<div align="center">

**Built with ❤️ for Privacy and Developer Experience**

[⬆ Back to Top](#fhevmsdk)

</div>
