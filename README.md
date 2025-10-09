# 🔐 Universal FHEVM SDK

**Framework-agnostic toolkit for building confidential dApps with Fully Homomorphic Encryption**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)

🎥 **[Video Demo](./demo.mp4)** | 🌐 **[Live Demo - Next.js](https://anonymous-legal-consultation.vercel.app/)** | 📚 **[Documentation](#-documentation)**

A universal, wagmi-like SDK for **Zama FHEVM** that makes building privacy-preserving dApps simple, consistent, and developer-friendly. Works with **React**, **Next.js**, **Vue**, **Node.js**, or any JavaScript environment.

**Built for the Zama Bounty** - Demonstrating a complete, reusable FHEVM SDK with minimal boilerplate.

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [📦 Installation](#-installation)
- [🏗️ Architecture](#️-architecture)
- [💻 Usage](#-usage)
- [📚 Examples](#-examples)
- [🔧 API Reference](#-api-reference)
- [🎯 Design Philosophy](#-design-philosophy)
- [🛠️ Development](#️-development)
- [📄 License](#-license)

---

## ✨ Features

**🎯 Framework-Agnostic Core:**
- ✅ Works with React, Next.js, Vue, vanilla Node.js, or any framework
- ✅ Zero framework dependencies in core package
- ✅ Optional framework adapters (React hooks provided)

**🔌 Wagmi-Like API:**
- ✅ Familiar hooks pattern: `useFhevm()`, `useEncrypt()`, `useDecrypt()`
- ✅ Provider-based architecture for React
- ✅ Simple function calls for non-React environments

**🔐 Complete FHEVM Workflow:**
- ✅ Initialization with automatic provider detection
- ✅ Input encryption (bool, uint8, uint16, uint32, uint64, address)
- ✅ User decryption with EIP-712 signatures
- ✅ Public decryption for shared data
- ✅ Batch operations support

**📦 All-in-One Package:**
- ✅ Wraps `fhevmjs`, `ethers`, and all FHE dependencies
- ✅ No scattered dependencies - one `npm install`
- ✅ TypeScript definitions included

**⚡ Developer-Friendly:**
- ✅ < 10 lines of code to get started
- ✅ Clear error messages and documentation
- ✅ Minimal boilerplate

---

## 🚀 Quick Start

### Less than 10 lines to start!

**1. Install:**
```bash
npm install @fhevm/sdk ethers
```

**2. Initialize (React):**
```tsx
import { FhevmProvider } from '@fhevm/sdk/react';

<FhevmProvider config={{ chainId: 9000 }} autoInit>
  <App />
</FhevmProvider>
```

**3. Use:**
```tsx
import { useEncrypt, useDecrypt } from '@fhevm/sdk/react';

function MyComponent() {
  const { encrypt } = useEncrypt();
  const { decrypt } = useDecrypt();

  // Encrypt
  const encrypted = await encrypt(contractAddress, userAddress, {
    amount: 1000,
    category: 1
  });

  // Decrypt
  const value = await decrypt({
    contractAddress,
    handle: encryptedHandle,
    signer
  });
}
```

**That's it!** 🎉

---

## 📦 Installation

### Monorepo Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/fhevm-react-template.git
cd fhevm-react-template

# Install all dependencies from root
npm install

# Build the SDK
npm run build:sdk

# Run examples
npm run dev:nextjs    # Next.js example
npm run dev:node      # Vanilla Node.js example
```

### Standalone Installation

```bash
# Install SDK package
npm install @fhevm/sdk ethers

# For React projects, you already have React as peer dependency
# No additional installations needed!
```

---

## 🏗️ Architecture

### Project Structure

```
fhevm-react-template/
├── packages/
│   └── fhevm-sdk/                 # 📦 Universal SDK Package
│       ├── src/
│       │   ├── core/              # Framework-agnostic core
│       │   │   ├── fhevm-client.ts    # Client instance management
│       │   │   ├── encryption.ts      # Encryption utilities
│       │   │   ├── decryption.ts      # Decryption utilities
│       │   │   └── types.ts           # TypeScript definitions
│       │   ├── react/             # React hooks (optional)
│       │   │   ├── FhevmProvider.tsx  # Context provider
│       │   │   ├── useFhevm.ts        # Core hook
│       │   │   ├── useEncrypt.ts      # Encryption hooks
│       │   │   └── useDecrypt.ts      # Decryption hooks
│       │   ├── utils/             # Utilities
│       │   │   ├── eip712.ts          # EIP-712 signatures
│       │   │   └── abi.ts             # ABI utilities
│       │   ├── index.ts           # Core exports
│       │   └── react.ts           # React exports
│       └── package.json
├── examples/
│   ├── nextjs-legal-consultation/ # 🌐 Next.js Example
│   │   ├── app/                   # Next.js App Router
│   │   ├── components/            # React components
│   │   ├── contracts/             # Smart contracts from main app
│   │   └── lib/                   # SDK integration
│   ├── vanilla-node/              # 📦 Node.js Example
│   │   └── index.js              # Plain JavaScript usage
│   └── legal-consultation/        # ⚖️ Imported dApp Example
│       ├── contracts/             # AnonymousLegalConsultation.sol
│       ├── scripts/               # Deployment scripts
│       └── README.md              # Integration guide
├── docs/                          # 📚 Documentation
│   ├── API.md                    # Complete API reference
│   ├── QUICK_START.md            # Getting started guide
│   └── EXAMPLES.md               # Usage examples
├── package.json                  # Root package.json
└── README.md                     # This file
```

### SDK Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│         (Next.js, React, Vue, Node.js, etc.)                │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Optional Framework Adapters                     │
│                                                              │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│   │    React     │  │     Vue      │  │   Angular    │    │
│   │    Hooks     │  │  Composables │  │   Services   │    │
│   └──────────────┘  └──────────────┘  └──────────────┘    │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              Core SDK (Framework-Agnostic)                   │
│                                                              │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│   │   FHEVM      │  │  Encryption  │  │  Decryption  │    │
│   │   Client     │  │   Utilities  │  │  Utilities   │    │
│   └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                              │
│   ┌──────────────┐  ┌──────────────┐                       │
│   │   EIP-712    │  │     ABI      │                       │
│   │  Signatures  │  │   Utilities  │                       │
│   └──────────────┘  └──────────────┘                       │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              FHEVM Dependencies Layer                        │
│                                                              │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│   │   fhevmjs    │  │   ethers.js  │  │    Other     │    │
│   │   (Zama)     │  │      v6      │  │ Dependencies │    │
│   └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Usage

### React / Next.js

**1. Wrap your app with FhevmProvider:**

```tsx
// app/layout.tsx or pages/_app.tsx
import { FhevmProvider } from '@fhevm/sdk/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <FhevmProvider
          config={{
            chainId: 9000,
            networkName: 'Zama Devnet'
          }}
          autoInit
        >
          {children}
        </FhevmProvider>
      </body>
    </html>
  );
}
```

**2. Use hooks in components:**

```tsx
'use client';

import { useFhevm, useEncrypt, useDecrypt } from '@fhevm/sdk/react';
import { BrowserProvider } from 'ethers';

export function LegalConsultation() {
  const { isReady, init } = useFhevm();
  const { encrypt, isEncrypting } = useEncrypt();
  const { decrypt, decryptedValue } = useDecrypt();

  // Encrypt consultation data
  const submitConsultation = async () => {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    const encrypted = await encrypt(
      contractAddress,
      address,
      {
        clientId: 12345,
        category: 1,  // Civil Law
        fee: 1000
      }
    );

    // Use encrypted.handles and encrypted.inputProof in contract call
    const tx = await contract.submitConsultation(
      encrypted.handles[0],  // clientId
      encrypted.handles[1],  // category
      "encrypted_question",
      encrypted.inputProof,
      { value: ethers.parseEther("0.001") }
    );

    await tx.wait();
  };

  // Decrypt response
  const viewResponse = async (handle: string) => {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const value = await decrypt({
      contractAddress,
      handle,
      signer
    });

    console.log('Decrypted response:', value);
  };

  return (
    <div>
      {!isReady ? (
        <button onClick={init}>Initialize FHEVM</button>
      ) : (
        <>
          <button onClick={submitConsultation} disabled={isEncrypting}>
            Submit Consultation
          </button>
          {decryptedValue && <div>Response: {decryptedValue.toString()}</div>}
        </>
      )}
    </div>
  );
}
```

### Vanilla Node.js

```javascript
const { createFhevmInstance, encryptInput } = require('@fhevm/sdk');
const { ethers } = require('ethers');

async function main() {
  // 1. Create FHEVM client
  const fhevmClient = createFhevmInstance({
    chainId: 9000,
    rpcUrl: 'https://devnet.zama.ai'
  });

  // 2. Initialize
  const provider = new ethers.JsonRpcProvider('https://devnet.zama.ai');
  await fhevmClient.init(provider);

  // 3. Encrypt data
  const encrypted = await encryptInput(
    contractAddress,
    userAddress,
    {
      amount: 1000,
      category: 1
    }
  );

  console.log('Encrypted handles:', encrypted.handles);
  console.log('Input proof:', encrypted.inputProof);

  // 4. Use in contract interaction
  const contract = new ethers.Contract(contractAddress, abi, signer);
  const tx = await contract.submitData(
    encrypted.handles[0],
    encrypted.inputProof
  );

  await tx.wait();
  console.log('Transaction successful!');
}

main();
```

### Vue.js (Composition API)

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { createFhevmInstance, encryptInput } from '@fhevm/sdk';

const fhevmClient = createFhevmInstance({ chainId: 9000 });
const isReady = ref(false);
const encryptedData = ref(null);

onMounted(async () => {
  await fhevmClient.init();
  isReady.value = true;
});

async function encrypt() {
  const encrypted = await encryptInput(
    contractAddress,
    userAddress,
    { amount: 1000 }
  );
  encryptedData.value = encrypted;
}
</script>

<template>
  <div>
    <button v-if="isReady" @click="encrypt">Encrypt Data</button>
    <div v-if="encryptedData">
      Encrypted: {{ encryptedData.handles }}
    </div>
  </div>
</template>
```

---

## 📚 Examples

### 1. Next.js Legal Consultation (Full Example)

**Complete implementation of Anonymous Legal Consultation dApp:**

```bash
cd examples/nextjs-legal-consultation
npm install
npm run dev
```

**Features:**
- ✅ Full FHEVM SDK integration
- ✅ Encrypted consultation submission
- ✅ Lawyer registration with encrypted profiles
- ✅ Admin assignment system
- ✅ Response decryption with EIP-712
- ✅ Rating system

**Key Files:**
- `app/page.tsx` - Main application
- `components/ConsultationForm.tsx` - Encryption example
- `components/ResponseView.tsx` - Decryption example
- `lib/sdk-config.ts` - SDK configuration

### 2. Vanilla Node.js (CLI Example)

**Simple command-line tool for FHEVM operations:**

```bash
cd examples/vanilla-node
node index.js
```

**Features:**
- ✅ Framework-agnostic usage
- ✅ CLI interaction
- ✅ Batch encryption
- ✅ Public decryption

### 3. Legal Consultation dApp (Imported Example)

**Full smart contract example with SDK integration:**

Located in `examples/legal-consultation/`

**Imported Files:**
- `contracts/AnonymousLegalConsultation.sol` - Main contract
- `scripts/deploy.js` - Deployment with SDK
- `scripts/interact.js` - SDK interaction examples
- `test/` - Tests using SDK

**Setup:**
```bash
cd examples/legal-consultation
npm install
npm run compile
npm run deploy:sepolia
npm run interact
```

---

## 🔧 API Reference

### Core SDK

#### `createFhevmInstance(config)`

Create a new FHEVM client instance.

```typescript
import { createFhevmInstance } from '@fhevm/sdk';

const client = createFhevmInstance({
  chainId: 9000,
  networkName: 'Zama Devnet',
  rpcUrl: 'https://devnet.zama.ai',
  gatewayUrl: 'https://gateway.zama.ai',  // optional
  aclAddress: '0x...'                      // optional
});

await client.init(provider);
```

#### `encryptInput(contractAddress, userAddress, inputs)`

Encrypt multiple inputs with automatic type detection.

```typescript
import { encryptInput } from '@fhevm/sdk';

const encrypted = await encryptInput(
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
  handle: '0xabcd...',      // encrypted value handle
  signer: signer            // ethers.js signer
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

Core hook for FHEVM state.

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

See [docs/API.md](./docs/API.md) for complete API documentation.

---

## 🎯 Design Philosophy

### 1. **Framework-Agnostic Core**

The core SDK (`src/core/`) has **zero framework dependencies**. This means:
- ✅ Can be used in Node.js, Deno, or browser
- ✅ Works with any UI framework (React, Vue, Angular, Svelte)
- ✅ Testable without framework overhead

### 2. **Wagmi-Like Developer Experience**

Inspired by wagmi's clean API:
- ✅ Provider pattern for configuration
- ✅ Hook-based state management
- ✅ Automatic error handling
- ✅ TypeScript-first with full type safety

### 3. **Minimal Boilerplate**

Goal: **< 10 lines of code** to start using FHEVM.

**Before (manual setup):**
```typescript
// 50+ lines of boilerplate
import { initFhevm, createInstance } from 'fhevmjs';
await initFhevm();
const instance = await createInstance({ ... });
const input = instance.createEncryptedInput(...);
input.addUint32(value);
const encrypted = input.encrypt();
// ... more setup
```

**After (with SDK):**
```typescript
// 3 lines
const { encrypt } = useEncrypt();
const encrypted = await encrypt(address, user, { value: 1000 });
// Done!
```

### 4. **All Dependencies Included**

One `npm install @fhevm/sdk` gives you:
- ✅ fhevmjs
- ✅ Encryption/decryption utilities
- ✅ EIP-712 signature handling
- ✅ Contract interaction helpers
- ✅ TypeScript definitions

### 5. **Extensible & Modular**

Easy to add new features:
```typescript
// Add custom encryption type
export async function encryptCustom(instance, ...) {
  const input = instance.createEncryptedInput(...);
  input.addCustomType(value);
  return input.encrypt();
}
```

---

## 🛠️ Development

### Setup

```bash
# Clone repository
git clone https://github.com/yourusername/fhevm-react-template.git
cd fhevm-react-template

# Install dependencies
npm install

# Build SDK
npm run build:sdk

# Watch mode (development)
npm run dev:sdk
```

### Commands

**SDK Development:**
```bash
npm run build:sdk       # Build SDK package
npm run dev:sdk         # Watch mode
npm run test:sdk        # Run tests
npm run lint:sdk        # Lint code
```

**Examples:**
```bash
npm run dev:nextjs      # Run Next.js example
npm run dev:node        # Run Node.js example
npm run build:examples  # Build all examples
```

**Full Workflow:**
```bash
npm run build           # Build everything
npm run dev             # Run all examples in dev mode
npm run lint            # Lint all packages
npm run test            # Run all tests
```

### Project Structure

```
packages/fhevm-sdk/
├── src/
│   ├── core/          # Framework-agnostic core
│   ├── react/         # React hooks
│   ├── utils/         # Utilities
│   ├── index.ts       # Core exports
│   └── react.ts       # React exports
├── dist/              # Built output
├── package.json
└── tsconfig.json
```

### Adding New Features

**1. Add to core (framework-agnostic):**
```typescript
// packages/fhevm-sdk/src/core/my-feature.ts
export function myFeature() {
  // Implementation
}
```

**2. Export from index:**
```typescript
// packages/fhevm-sdk/src/index.ts
export * from './core/my-feature';
```

**3. Add React hook (optional):**
```typescript
// packages/fhevm-sdk/src/react/useMyFeature.ts
export function useMyFeature() {
  // Hook implementation
}
```

**4. Test:**
```bash
npm run test:sdk
```

---

## 📊 Comparison

### Before FHEVM SDK

```typescript
// ❌ Manual setup - 60+ lines
import { initFhevm, createInstance } from 'fhevmjs';
import { BrowserProvider, Contract } from 'ethers';

// Initialize fhevmjs
await initFhevm();

// Create instance
const provider = new BrowserProvider(window.ethereum);
const network = await provider.getNetwork();
const instance = await createInstance({
  chainId: Number(network.chainId),
  networkUrl: 'https://...',
  gatewayUrl: 'https://...',
});

// Encrypt
const signer = await provider.getSigner();
const address = await signer.getAddress();
const input = instance.createEncryptedInput(contractAddress, address);
input.addUint32(1000);
input.addBool(true);
const encrypted = await input.encrypt();

// Decrypt with EIP-712
const domain = { name: 'FHEVM', version: '1', chainId: ... };
const types = { DecryptionPermission: [...] };
const message = { handle: ..., contractAddress: ..., userAddress: ... };
const signature = await signer.signTypedData(domain, types, message);
// ... more boilerplate for gateway call
```

### With FHEVM SDK

```typescript
// ✅ SDK - 10 lines
import { FhevmProvider, useEncrypt, useDecrypt } from '@fhevm/sdk/react';

// Setup (once)
<FhevmProvider config={{ chainId: 9000 }} autoInit>
  <App />
</FhevmProvider>

// Use anywhere
const { encrypt } = useEncrypt();
const encrypted = await encrypt(contractAddress, userAddress, {
  amount: 1000,
  isActive: true
});

const { decrypt } = useDecrypt();
const value = await decrypt({ contractAddress, handle, signer });
```

**Savings: 50+ lines → 10 lines = 80% less code!**

---

## 📹 Video Demo

**[Watch Full Demo Video](./demo.mp4)**

**Video Contents:**
- 00:00 - Project overview and architecture
- 02:00 - SDK installation and setup
- 04:00 - Next.js example walkthrough
- 06:00 - Encryption demonstration
- 08:00 - Decryption with EIP-712
- 10:00 - Vanilla Node.js usage
- 12:00 - Design decisions and extensibility

---

## 🏆 Bounty Requirements Checklist

### ✅ Universal SDK Package (`packages/fhevm-sdk`)

- [x] **Framework-agnostic core** - Works with React, Vue, Node.js, any environment
- [x] **Initialization utilities** - `createFhevmInstance()`, automatic provider detection
- [x] **Encryption** - `encryptInput()`, batch encryption, type-specific functions
- [x] **Decryption** - `userDecrypt()` with EIP-712, `publicDecrypt()`
- [x] **Wagmi-like API** - React hooks (`useFhevm`, `useEncrypt`, `useDecrypt`)
- [x] **Modular structure** - Clean, reusable, extensible components

### ✅ Reusable Components

- [x] **FhevmProvider** - React context provider
- [x] **Encryption hooks** - `useEncrypt()`, `useBatchEncrypt()`, `useEncryptValue()`
- [x] **Decryption hooks** - `useDecrypt()`, `usePublicDecrypt()`, `useBatchDecrypt()`
- [x] **Type utilities** - Full TypeScript support

### ✅ Multi-Environment Examples

- [x] **Next.js** - `examples/nextjs-legal-consultation` (required)
- [x] **Vanilla Node.js** - `examples/vanilla-node` (bonus)
- [x] **Imported dApp** - `examples/legal-consultation` (Anonymous Legal Consultation)

### ✅ Documentation

- [x] **README** - Complete setup and usage guide (this file)
- [x] **API Reference** - `docs/API.md`
- [x] **Quick Start** - `docs/QUICK_START.md`
- [x] **Examples** - `docs/EXAMPLES.md`
- [x] **Code examples** - Throughout documentation

### ✅ Developer Experience

- [x] **Quick setup** - < 10 lines of code
- [x] **Minimal boilerplate** - One provider, simple hooks
- [x] **Clear commands** - Root-level scripts for all operations
- [x] **TypeScript** - Full type safety

### ✅ Deliverables

- [x] **GitHub repo** - Forked from fhevm-react-template
- [x] **Next.js example** - Fully functional with SDK
- [x] **Video demo** - `demo.mp4`
- [x] **Deployment link** - [https://anonymous-legal-consultation.vercel.app/](https://anonymous-legal-consultation.vercel.app/)
- [x] **README with links** - All resources documented

---

## 📝 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

**Special Thanks:**
- **Zama** - For the revolutionary FHEVM technology and bounty program
- **fhevmjs Team** - For the core FHE library
- **wagmi** - For API design inspiration
- **Next.js** - For the excellent framework
- **Open Source Community** - For making this possible

**Built for the Zama Bounty** - Creating the next generation of FHEVM tooling.

---

<div align="center">

**Built with ❤️ for Privacy and Developer Experience**

![FHEVM](https://img.shields.io/badge/FHEVM-Powered-blue?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-Compatible-blue?style=for-the-badge)

**Universal SDK**: ✅ Ready | **Examples**: ✅ Complete | **Status**: ✅ **Production Ready**

[⬆ Back to Top](#-universal-fhevm-sdk)

</div>
