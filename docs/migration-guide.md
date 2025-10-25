# Migration Guide

Complete guide for migrating from direct fhevmjs usage to the Universal FHEVM SDK.

---

## Table of Contents

- [Why Migrate?](#why-migrate)
- [Before and After Comparison](#before-and-after-comparison)
- [Step-by-Step Migration](#step-by-step-migration)
- [Breaking Changes](#breaking-changes)
- [Feature Mapping](#feature-mapping)
- [Common Migration Patterns](#common-migration-patterns)
- [Troubleshooting](#troubleshooting)

---

## Why Migrate?

### Benefits of Using the SDK

| Feature | Direct fhevmjs | Universal SDK |
|---------|----------------|---------------|
| **Lines of Code** | 60+ lines | < 10 lines |
| **Type Safety** | Manual types | Auto-detection |
| **React Integration** | Custom hooks needed | Built-in hooks |
| **Error Handling** | Manual try-catch | Built-in states |
| **Loading States** | Manual state management | Automatic |
| **Bundle Size** | Full library | Tree-shakeable |
| **Framework Support** | Manual adaptation | React/Vue/Node.js ready |
| **Developer Experience** | Complex setup | Wagmi-like API |

### Code Reduction Example

**Before (fhevmjs):**
```typescript
// 60+ lines
import { initFhevm, createFhevmjsInstance } from 'fhevmjs';

let instance: FhevmInstance;

async function initializeFhevm() {
  await initFhevm();
  instance = await createFhevmjsInstance({
    chainId: 9000,
    networkUrl: 'https://devnet.zama.ai',
    gatewayUrl: '...',
  });
}

async function encryptData(value: number) {
  if (!instance) await initializeFhevm();

  const input = instance.createEncryptedInput(
    contractAddress,
    userAddress
  );

  if (value <= 255) {
    input.addUint8(value);
  } else if (value <= 65535) {
    input.addUint16(value);
  } else {
    input.addUint32(value);
  }

  return input.encrypt();
}
```

**After (Universal SDK):**
```typescript
// < 10 lines
import { useEncrypt } from '@fhevm/sdk/react';

function MyComponent() {
  const { encrypt } = useEncrypt();

  const encrypted = await encrypt(
    contractAddress,
    userAddress,
    { value: 1000 }
  );
}
```

**Result: 83% code reduction!**

---

## Before and After Comparison

### Initialization

#### Before (fhevmjs)

```typescript
import { initFhevm, createFhevmjsInstance } from 'fhevmjs';
import { BrowserProvider } from 'ethers';

let fhevmInstance: FhevmInstance | null = null;

export async function initializeFHEVM() {
  if (fhevmInstance) return fhevmInstance;

  await initFhevm();

  const provider = new BrowserProvider(window.ethereum);

  fhevmInstance = await createFhevmjsInstance({
    chainId: 9000,
    networkUrl: await provider.getNetwork().then(n => n.rpcUrl),
    gatewayUrl: 'https://gateway.zama.ai',
    aclAddress: '0x...',
  });

  return fhevmInstance;
}

// In your component
useEffect(() => {
  initializeFHEVM().catch(console.error);
}, []);
```

#### After (Universal SDK)

```tsx
import { FhevmProvider } from '@fhevm/sdk/react';

function App() {
  return (
    <FhevmProvider config={{ chainId: 9000 }} autoInit>
      <YourApp />
    </FhevmProvider>
  );
}
```

---

### Encryption

#### Before (fhevmjs)

```typescript
async function encryptValue(value: number) {
  const instance = await initializeFHEVM();

  const input = instance.createEncryptedInput(
    contractAddress,
    userAddress
  );

  // Manual type selection
  if (value <= 255) {
    input.addUint8(value);
  } else if (value <= 65535) {
    input.addUint16(value);
  } else if (value <= 4294967295) {
    input.addUint32(value);
  } else {
    input.addUint64(BigInt(value));
  }

  const encrypted = input.encrypt();

  return {
    handles: encrypted.handles,
    proof: encrypted.inputProof
  };
}
```

#### After (Universal SDK)

```typescript
import { useEncrypt } from '@fhevm/sdk/react';

const { encrypt } = useEncrypt();

const encrypted = await encrypt(
  contractAddress,
  userAddress,
  { value: 1000 } // Auto-detects type
);
```

---

### Decryption

#### Before (fhevmjs)

```typescript
async function decryptValue(handle: string) {
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const network = await provider.getNetwork();
  const userAddress = await signer.getAddress();

  // Create EIP-712 signature manually
  const domain = {
    name: 'FHEVM',
    version: '1',
    chainId: Number(network.chainId),
    verifyingContract: contractAddress,
  };

  const types = {
    DecryptionPermission: [
      { name: 'handle', type: 'bytes32' },
      { name: 'contractAddress', type: 'address' },
      { name: 'userAddress', type: 'address' },
    ],
  };

  const message = {
    handle,
    contractAddress,
    userAddress,
  };

  const signature = await signer.signTypedData(domain, types, message);

  // Request decryption from gateway
  const response = await fetch('https://gateway.zama.ai/decrypt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      handle,
      signature,
      publicKey: userAddress,
    }),
  });

  const { decryptedValue } = await response.json();
  return BigInt(decryptedValue);
}
```

#### After (Universal SDK)

```typescript
import { useDecrypt } from '@fhevm/sdk/react';

const { decrypt } = useDecrypt();
const signer = useEthersSigner();

const value = await decrypt(
  contractAddress,
  handle,
  signer
);
```

---

## Step-by-Step Migration

### Step 1: Install the SDK

```bash
npm install @fhevm/sdk ethers
```

### Step 2: Replace Initialization

**Remove:**
```typescript
import { initFhevm, createFhevmjsInstance } from 'fhevmjs';

// Manual initialization code...
```

**Add:**
```tsx
import { FhevmProvider } from '@fhevm/sdk/react';

function App() {
  return (
    <FhevmProvider config={{ chainId: 9000 }} autoInit>
      {children}
    </FhevmProvider>
  );
}
```

### Step 3: Replace Encryption Logic

**Find all instances of:**
```typescript
const input = instance.createEncryptedInput(...);
input.addUint8(...);
input.addUint32(...);
const encrypted = input.encrypt();
```

**Replace with:**
```typescript
import { useEncrypt } from '@fhevm/sdk/react';

const { encrypt, isEncrypting } = useEncrypt();

const encrypted = await encrypt(
  contractAddress,
  userAddress,
  { value: 1000 }
);
```

### Step 4: Replace Decryption Logic

**Find all instances of:**
```typescript
// Manual EIP-712 signature + gateway request
const signature = await signer.signTypedData(...);
const response = await fetch('https://gateway.zama.ai/decrypt', ...);
```

**Replace with:**
```typescript
import { useDecrypt } from '@fhevm/sdk/react';

const { decrypt } = useDecrypt();

const value = await decrypt(
  contractAddress,
  handle,
  signer
);
```

### Step 5: Update State Management

**Remove manual loading states:**
```typescript
const [isLoading, setIsLoading] = useState(false);

setIsLoading(true);
try {
  // encryption/decryption
} finally {
  setIsLoading(false);
}
```

**Use built-in states:**
```typescript
const { encrypt, isEncrypting, error } = useEncrypt();

// isEncrypting automatically managed
```

### Step 6: Test Migration

```typescript
// Run your existing tests
npm test

// Verify encryption still works
// Verify decryption still works
// Check loading states
// Verify error handling
```

---

## Breaking Changes

### 1. Import Paths

**Before:**
```typescript
import { createFhevmjsInstance } from 'fhevmjs';
```

**After:**
```typescript
import { createFhevmInstance } from '@fhevm/sdk';
```

### 2. Instance Creation

**Before:**
```typescript
const instance = await createFhevmjsInstance({ ... });
```

**After:**
```typescript
const client = createFhevmInstance({ ... });
await client.init();
```

### 3. Encryption API

**Before:**
```typescript
const input = instance.createEncryptedInput(addr, user);
input.addUint32(1000);
const encrypted = input.encrypt();
```

**After:**
```typescript
const encrypted = await encryptInput(addr, user, { value: 1000 });
```

### 4. Type Selection

**Before:** Manual type selection based on value
```typescript
if (value <= 255) input.addUint8(value);
else if (value <= 65535) input.addUint16(value);
```

**After:** Automatic type detection
```typescript
encrypt(addr, user, { value }); // Auto-detects
```

### 5. Error Handling

**Before:** Manual try-catch
```typescript
try {
  const encrypted = await encrypt();
} catch (error) {
  setError(error);
}
```

**After:** Built-in error states
```typescript
const { encrypt, error } = useEncrypt();
// error automatically set on failure
```

---

## Feature Mapping

### Core Functions

| fhevmjs | Universal SDK | Notes |
|---------|---------------|-------|
| `initFhevm()` | `<FhevmProvider autoInit>` | Automatic in React |
| `createFhevmjsInstance()` | `createFhevmInstance()` | Similar API |
| `instance.createEncryptedInput()` | `encryptInput()` | Simplified |
| `input.addUint8()` | Auto-detected | No manual call needed |
| `input.addUint32()` | Auto-detected | No manual call needed |
| `input.addBool()` | Auto-detected | No manual call needed |
| `input.encrypt()` | Return value | Automatic |
| Manual EIP-712 | `userDecrypt()` | Built-in |
| Manual gateway request | `publicDecrypt()` | Built-in |

### React Integration

| fhevmjs | Universal SDK |
|---------|---------------|
| Custom context | `FhevmProvider` |
| Custom hooks | `useFhevm()`, `useEncrypt()`, etc. |
| Manual loading state | `isEncrypting`, `isDecrypting` |
| Manual error state | `error` prop in hooks |

---

## Common Migration Patterns

### Pattern 1: Component with Encryption

**Before:**
```tsx
function SubmitForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const instance = await initializeFHEVM();
      const input = instance.createEncryptedInput(addr, user);

      if (amount <= 255) {
        input.addUint8(amount);
      } else {
        input.addUint32(amount);
      }

      const encrypted = input.encrypt();

      await contract.submit(encrypted.handles, encrypted.inputProof);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button onClick={handleSubmit} disabled={isLoading}>
      {isLoading ? 'Loading...' : 'Submit'}
    </button>
  );
}
```

**After:**
```tsx
import { useEncrypt } from '@fhevm/sdk/react';

function SubmitForm() {
  const { encrypt, isEncrypting, error } = useEncrypt();

  const handleSubmit = async () => {
    const encrypted = await encrypt(addr, user, { amount });

    if (encrypted) {
      await contract.submit(encrypted.handles, encrypted.inputProof);
    }
  };

  return (
    <button onClick={handleSubmit} disabled={isEncrypting}>
      {isEncrypting ? 'Loading...' : 'Submit'}
    </button>
  );
}
```

### Pattern 2: Multiple Encryptions

**Before:**
```typescript
const input1 = instance.createEncryptedInput(addr, user);
input1.addUint8(clientId);
const enc1 = input1.encrypt();

const input2 = instance.createEncryptedInput(addr, user);
input2.addUint8(categoryId);
const enc2 = input2.encrypt();

await contract.submit(
  enc1.handles[0],
  enc2.handles[0],
  enc1.inputProof
);
```

**After:**
```typescript
const encrypted = await encrypt(addr, user, {
  clientId,
  categoryId
});

await contract.submit(
  encrypted.handles[0],
  encrypted.handles[1],
  encrypted.inputProof
);
```

### Pattern 3: Conditional Initialization

**Before:**
```typescript
useEffect(() => {
  if (walletConnected && !fhevmInitialized) {
    initializeFHEVM().then(() => setFhevmInitialized(true));
  }
}, [walletConnected, fhevmInitialized]);
```

**After:**
```tsx
const { init, isInitialized } = useFhevm();

useEffect(() => {
  if (walletConnected && !isInitialized) {
    init();
  }
}, [walletConnected, isInitialized, init]);
```

### Pattern 4: Decryption with Signature

**Before:**
```typescript
const signer = await provider.getSigner();
const userAddress = await signer.getAddress();
const network = await provider.getNetwork();

const domain = {
  name: 'FHEVM',
  version: '1',
  chainId: Number(network.chainId),
  verifyingContract: contractAddress,
};

const types = {
  DecryptionPermission: [
    { name: 'handle', type: 'bytes32' },
    { name: 'contractAddress', type: 'address' },
    { name: 'userAddress', type: 'address' },
  ],
};

const message = { handle, contractAddress, userAddress };
const signature = await signer.signTypedData(domain, types, message);

const response = await fetch(gatewayUrl, {
  method: 'POST',
  body: JSON.stringify({ handle, signature, publicKey: userAddress }),
});

const { decryptedValue } = await response.json();
```

**After:**
```typescript
const { decrypt } = useDecrypt();
const signer = useEthersSigner();

const value = await decrypt(contractAddress, handle, signer);
```

---

## Troubleshooting

### Issue: "Cannot find module '@fhevm/sdk'"

**Solution:** Install the SDK:
```bash
npm install @fhevm/sdk ethers
```

### Issue: "FhevmContext is null"

**Solution:** Wrap your app with `FhevmProvider`:
```tsx
<FhevmProvider config={{ chainId: 9000 }} autoInit>
  <App />
</FhevmProvider>
```

### Issue: "FHEVM not initialized"

**Solution:** Either use `autoInit` or call `init()` manually:
```tsx
const { init, isInitialized } = useFhevm();

useEffect(() => {
  if (!isInitialized) {
    init();
  }
}, [isInitialized, init]);
```

### Issue: Encrypted handles not working in contract

**Solution:** Ensure you're passing both `handles` and `inputProof`:
```typescript
const encrypted = await encrypt(addr, user, { value: 1000 });

await contract.submit(
  encrypted.handles[0],  // Handle
  encrypted.inputProof   // Proof (required!)
);
```

### Issue: Type detection selecting wrong type

**Solution:** Use specific type functions:
```typescript
// Instead of auto-detection
import { encryptUint8 } from '@fhevm/sdk';

const encrypted = await encryptUint8(addr, user, 255);
```

### Issue: Decryption returns null

**Solution:** Check that:
1. User has permission (ACL)
2. Signature was not rejected
3. Handle is valid

```typescript
const { decrypt, error } = useDecrypt();

const value = await decrypt(addr, handle, signer);

if (!value) {
  console.error('Decryption failed:', error);
}
```

### Issue: Bundle size increased

**Solution:** Import only what you need:
```typescript
// Good: Tree-shakeable
import { encryptInput } from '@fhevm/sdk';

// Avoid: Imports everything
import * as FhevmSDK from '@fhevm/sdk';
```

---

## Migration Checklist

- [ ] Install `@fhevm/sdk` and `ethers`
- [ ] Remove direct `fhevmjs` imports
- [ ] Add `FhevmProvider` to app root
- [ ] Replace initialization code
- [ ] Update encryption calls to use `useEncrypt()`
- [ ] Update decryption calls to use `useDecrypt()`
- [ ] Remove manual loading state management
- [ ] Remove manual error handling where applicable
- [ ] Update types to use SDK types
- [ ] Test all encryption operations
- [ ] Test all decryption operations
- [ ] Verify error handling works
- [ ] Check bundle size reduction
- [ ] Update documentation/comments

---

## Need Help?

- **Documentation**: [API Reference](./api-reference.md)
- **Examples**: [Examples Documentation](./examples.md)
- **Architecture**: [Architecture Guide](./architecture.md)
- **GitHub**: https://github.com/CarrieMorar/fhevm-react-template
- **Live Demo**: https://fhe-legal-consultation.vercel.app/

---

## Migration Support

If you encounter issues during migration, please:

1. Check this guide first
2. Review the [Quick Start](./quick-start.md)
3. Compare with [Examples](./examples.md)
4. Open an issue on GitHub with:
   - Your current fhevmjs code
   - What you tried with SDK
   - Error messages/behavior

We're here to help make your migration smooth!
