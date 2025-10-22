# Quick Start Guide

Get started with the Universal FHEVM SDK in less than 10 lines of code!

---

## Table of Contents

- [Installation](#installation)
- [React Setup](#react-setup)
- [Next.js Setup](#nextjs-setup)
- [Node.js Setup](#nodejs-setup)
- [Vue.js Setup](#vuejs-setup)
- [Your First Encryption](#your-first-encryption)
- [Your First Decryption](#your-first-decryption)
- [Common Patterns](#common-patterns)

---

## Installation

### React/Next.js/Vue Applications

```bash
npm install @fhevm/sdk ethers
```

### Node.js Applications

```bash
npm install @fhevm/sdk ethers
```

---

## React Setup

### Step 1: Wrap your app with FhevmProvider

```tsx
// app.tsx or index.tsx
import { FhevmProvider } from '@fhevm/sdk/react';

function App() {
  return (
    <FhevmProvider
      config={{ chainId: 9000 }}
      autoInit
    >
      <YourApp />
    </FhevmProvider>
  );
}

export default App;
```

### Step 2: Use hooks in your components

```tsx
// MyComponent.tsx
import { useEncrypt, useDecrypt } from '@fhevm/sdk/react';

function MyComponent() {
  const { encrypt, isEncrypting } = useEncrypt();
  const { decrypt, isDecrypting } = useDecrypt();

  const handleEncrypt = async () => {
    const encrypted = await encrypt(
      contractAddress,
      userAddress,
      { amount: 1000 }
    );

    // Use encrypted.handles and encrypted.inputProof in contract call
  };

  return (
    <button onClick={handleEncrypt} disabled={isEncrypting}>
      {isEncrypting ? 'Encrypting...' : 'Encrypt'}
    </button>
  );
}
```

That's it! You're ready to use FHE in React.

---

## Next.js Setup

### Step 1: Create provider wrapper

```tsx
// app/providers.tsx
'use client';

import { FhevmProvider } from '@fhevm/sdk/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FhevmProvider
      config={{ chainId: 9000 }}
      autoInit
    >
      {children}
    </FhevmProvider>
  );
}
```

### Step 2: Add to layout

```tsx
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Step 3: Use in page components

```tsx
// app/page.tsx
'use client';

import { useEncrypt } from '@fhevm/sdk/react';

export default function Home() {
  const { encrypt, isEncrypting } = useEncrypt();

  const handleSubmit = async () => {
    const encrypted = await encrypt(
      '0x1234...',
      userAddress,
      { clientId: 42, categoryId: 5 }
    );

    // Submit to contract
    await contract.submitConsultation(
      encrypted.handles[0],
      encrypted.handles[1],
      encrypted.inputProof
    );
  };

  return (
    <button onClick={handleSubmit} disabled={isEncrypting}>
      Submit Consultation
    </button>
  );
}
```

---

## Node.js Setup

### Step 1: Import core functions

```typescript
// index.ts
import {
  createFhevmInstance,
  encryptInput,
  userDecrypt
} from '@fhevm/sdk';
import { JsonRpcProvider, Wallet } from 'ethers';

async function main() {
  // Initialize FHEVM client
  const client = createFhevmInstance({
    chainId: 9000,
    rpcUrl: 'https://devnet.zama.ai'
  });

  const provider = new JsonRpcProvider('https://devnet.zama.ai');
  await client.init(provider);

  console.log('FHEVM initialized!');

  // Encrypt data
  const encrypted = await encryptInput(
    '0x1234...', // contract address
    '0x5678...', // user address
    {
      amount: 1000,
      isActive: true
    }
  );

  console.log('Encrypted:', encrypted);
}

main().catch(console.error);
```

### Step 2: Run your script

```bash
npx ts-node index.ts
```

---

## Vue.js Setup

### Step 1: Create composable

```typescript
// composables/useFhevm.ts
import { ref, onMounted } from 'vue';
import { createFhevmInstance, encryptInput } from '@fhevm/sdk';
import { BrowserProvider } from 'ethers';

export function useFhevm() {
  const client = createFhevmInstance({ chainId: 9000 });
  const isInitialized = ref(false);
  const isEncrypting = ref(false);

  onMounted(async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const provider = new BrowserProvider((window as any).ethereum);
      await client.init(provider);
      isInitialized.value = true;
    }
  });

  const encrypt = async (
    contractAddress: string,
    userAddress: string,
    inputs: Record<string, any>
  ) => {
    isEncrypting.value = true;
    try {
      return await encryptInput(contractAddress, userAddress, inputs);
    } finally {
      isEncrypting.value = false;
    }
  };

  return {
    client,
    isInitialized,
    isEncrypting,
    encrypt
  };
}
```

### Step 2: Use in components

```vue
<!-- MyComponent.vue -->
<script setup lang="ts">
import { useFhevm } from '@/composables/useFhevm';

const { encrypt, isEncrypting } = useFhevm();

const handleEncrypt = async () => {
  const encrypted = await encrypt(
    contractAddress,
    userAddress,
    { amount: 1000 }
  );

  // Use encrypted data
};
</script>

<template>
  <button @click="handleEncrypt" :disabled="isEncrypting">
    {{ isEncrypting ? 'Encrypting...' : 'Encrypt' }}
  </button>
</template>
```

---

## Your First Encryption

### Auto-Type Detection (Recommended)

```typescript
import { useEncrypt } from '@fhevm/sdk/react';

const { encrypt } = useEncrypt();

const encrypted = await encrypt(
  contractAddress,
  userAddress,
  {
    clientId: 42,        // Auto: euint8
    categoryId: 5,       // Auto: euint8
    amount: 1000,        // Auto: euint16
    isUrgent: true,      // Auto: ebool
    maxFee: 1000000n     // Auto: euint64
  }
);

// Use in contract
await contract.submitData(
  encrypted.handles[0], // clientId
  encrypted.handles[1], // categoryId
  encrypted.handles[2], // amount
  encrypted.handles[3], // isUrgent
  encrypted.handles[4], // maxFee
  encrypted.inputProof
);
```

### Specific Type Encryption

```typescript
import {
  useEncryptBool,
  useEncryptUint,
  useEncryptAddress
} from '@fhevm/sdk/react';

const { encryptBool } = useEncryptBool();
const { encryptUint } = useEncryptUint();
const { encryptAddress } = useEncryptAddress();

// Encrypt boolean
const boolEncrypted = await encryptBool(
  contractAddress,
  userAddress,
  true
);

// Encrypt number
const uintEncrypted = await encryptUint(
  contractAddress,
  userAddress,
  1000
);

// Encrypt address
const addressEncrypted = await encryptAddress(
  contractAddress,
  userAddress,
  '0xabcd...'
);
```

---

## Your First Decryption

### User Decryption (with EIP-712 signature)

```typescript
import { useDecrypt } from '@fhevm/sdk/react';
import { useEthersSigner } from './hooks/useEthersSigner';

const { decrypt, isDecrypting } = useDecrypt();
const signer = useEthersSigner();

const handleDecrypt = async (handle: string) => {
  const decryptedValue = await decrypt(
    contractAddress,
    handle,
    signer
  );

  console.log('Decrypted:', decryptedValue); // bigint
};
```

### Public Decryption (no signature)

```typescript
import { usePublicDecrypt } from '@fhevm/sdk/react';

const { publicDecrypt } = usePublicDecrypt();

const handlePublicDecrypt = async (handle: string) => {
  const publicValue = await publicDecrypt(
    contractAddress,
    handle
  );

  console.log('Public value:', publicValue); // bigint
};
```

---

## Common Patterns

### Pattern 1: Submit Encrypted Form Data

```tsx
import { useEncrypt } from '@fhevm/sdk/react';
import { useState } from 'react';

function ConsultationForm() {
  const { encrypt, isEncrypting } = useEncrypt();
  const [formData, setFormData] = useState({
    clientId: '',
    categoryId: '',
    question: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Encrypt sensitive data
    const encrypted = await encrypt(
      contractAddress,
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
      formData.question,    // Encrypted off-chain
      encrypted.inputProof,
      { value: ethers.parseEther('0.001') }
    );

    await tx.wait();
    console.log('Consultation submitted!');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        placeholder="Client ID"
        value={formData.clientId}
        onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
      />
      <input
        type="number"
        placeholder="Category ID"
        value={formData.categoryId}
        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
      />
      <textarea
        placeholder="Your question"
        value={formData.question}
        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
      />
      <button type="submit" disabled={isEncrypting}>
        {isEncrypting ? 'Encrypting...' : 'Submit'}
      </button>
    </form>
  );
}
```

### Pattern 2: Decrypt and Display Data

```tsx
import { useDecrypt } from '@fhevm/sdk/react';
import { useEffect, useState } from 'react';

function ConsultationDetails({ consultationId }: { consultationId: number }) {
  const { decrypt } = useDecrypt();
  const signer = useEthersSigner();
  const [details, setDetails] = useState<{
    clientId: bigint | null;
    categoryId: bigint | null;
  }>({
    clientId: null,
    categoryId: null
  });

  useEffect(() => {
    const loadDetails = async () => {
      // Get encrypted handles from contract
      const consultation = await contract.getConsultationDetails(consultationId);

      // Decrypt client ID
      const clientId = await decrypt(
        contractAddress,
        consultation.encryptedClientId,
        signer
      );

      // Decrypt category ID
      const categoryId = await decrypt(
        contractAddress,
        consultation.encryptedCategoryId,
        signer
      );

      setDetails({ clientId, categoryId });
    };

    loadDetails();
  }, [consultationId]);

  return (
    <div>
      <h3>Consultation #{consultationId}</h3>
      {details.clientId !== null && (
        <p>Client ID: {details.clientId.toString()}</p>
      )}
      {details.categoryId !== null && (
        <p>Category: {details.categoryId.toString()}</p>
      )}
    </div>
  );
}
```

### Pattern 3: Batch Encryption for Multiple Fields

```tsx
import { useEncrypt } from '@fhevm/sdk/react';

function LawyerRegistration() {
  const { encrypt, isEncrypting } = useEncrypt();

  const handleRegister = async (specialty: number, rating: number) => {
    // Encrypt multiple fields at once
    const encrypted = await encrypt(
      contractAddress,
      userAddress,
      {
        specialty: specialty,   // euint8
        rating: rating,         // euint8
        isVerified: false,      // ebool
        consultationCount: 0    // euint8
      }
    );

    if (!encrypted) return;

    // Submit to contract
    await contract.registerLawyer(
      encrypted.handles[0], // specialty
      encrypted.handles[1], // rating
      encrypted.handles[2], // isVerified
      encrypted.handles[3], // consultationCount
      encrypted.inputProof
    );
  };

  return (
    <button onClick={() => handleRegister(5, 50)} disabled={isEncrypting}>
      Register as Lawyer
    </button>
  );
}
```

### Pattern 4: Error Handling

```tsx
import { useEncrypt } from '@fhevm/sdk/react';
import { useEffect } from 'react';

function SafeEncryption() {
  const { encrypt, isEncrypting, error, clearError } = useEncrypt();

  useEffect(() => {
    if (error) {
      console.error('Encryption error:', error.message);
      // Show user-friendly notification
      showNotification('Failed to encrypt data. Please try again.');
      clearError();
    }
  }, [error, clearError]);

  const handleEncrypt = async () => {
    try {
      const encrypted = await encrypt(
        contractAddress,
        userAddress,
        { amount: 1000 }
      );

      if (encrypted) {
        console.log('Success!');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  return (
    <button onClick={handleEncrypt} disabled={isEncrypting}>
      Encrypt
    </button>
  );
}
```

### Pattern 5: Conditional Initialization

```tsx
import { useFhevm } from '@fhevm/sdk/react';
import { useEffect } from 'react';

function ConditionalInit() {
  const { isInitialized, init } = useFhevm();

  useEffect(() => {
    // Initialize only when user connects wallet
    if (walletConnected && !isInitialized) {
      init();
    }
  }, [walletConnected, isInitialized, init]);

  if (!isInitialized) {
    return <div>Please connect your wallet to continue</div>;
  }

  return <div>FHEVM ready!</div>;
}
```

---

## Network Configuration

### Using Pre-configured Networks

```typescript
import { NETWORK_CONFIGS } from '@fhevm/sdk';

// Zama Devnet
<FhevmProvider config={NETWORK_CONFIGS.zama} autoInit>

// Sepolia Testnet
<FhevmProvider config={NETWORK_CONFIGS.sepolia} autoInit>

// Local Hardhat
<FhevmProvider config={NETWORK_CONFIGS.local} autoInit>
```

### Custom Network Configuration

```typescript
<FhevmProvider
  config={{
    chainId: 9000,
    networkName: 'Custom Network',
    rpcUrl: 'https://custom-rpc.example.com',
    gatewayUrl: 'https://gateway.example.com',
    aclAddress: '0x1234...'
  }}
  autoInit
>
```

---

## Troubleshooting

### Issue: "FHEVM not initialized"

**Solution:** Make sure to initialize before using encryption/decryption:

```tsx
<FhevmProvider config={config} autoInit>
```

Or manually:

```tsx
const { init, isInitialized } = useFhevm();

useEffect(() => {
  if (!isInitialized) {
    init();
  }
}, [isInitialized, init]);
```

### Issue: "Signature rejected by user"

**Solution:** Handle rejection gracefully:

```tsx
const { decrypt } = useDecrypt();

try {
  const value = await decrypt(address, handle, signer);
} catch (error) {
  if (error.message.includes('rejected')) {
    console.log('User cancelled signature');
  }
}
```

### Issue: "Invalid handle"

**Solution:** Verify the handle comes from contract and has correct format:

```typescript
// Get handle from contract event or view function
const consultation = await contract.getConsultationDetails(id);
const handle = consultation.encryptedClientId; // Use this handle

// Don't use random strings or modified handles
```

### Issue: Type detection wrong

**Solution:** Use specific type functions:

```typescript
// Instead of auto-detection
const encrypted = await encrypt(addr, user, { value: 256 }); // Might detect as euint16

// Use explicit type
import { encryptUint8 } from '@fhevm/sdk';
const encrypted = await encryptUint8(addr, user, 256); // Force euint8
```

---

## Next Steps

- Read the [API Reference](./api-reference.md) for complete function documentation
- Explore [Examples](./examples.md) for real-world use cases
- Learn about [Architecture](./architecture.md) to understand how it works
- Follow [Migration Guide](./migration-guide.md) if coming from direct fhevmjs

---

## Support

- GitHub Issues: https://github.com/CarrieMorar/fhevm-react-template/issues
- Example Live Demo: https://fhe-legal-consultation.vercel.app/
- Video Tutorial: Download `demo.mp4` from repository

Happy building with FHE!
