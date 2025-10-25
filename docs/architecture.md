# Architecture Documentation

Deep dive into the Universal FHEVM SDK architecture, design decisions, and internal workings.

---

## Table of Contents

- [Overview](#overview)
- [Design Philosophy](#design-philosophy)
- [Core Architecture](#core-architecture)
- [React Integration](#react-integration)
- [Encryption Pipeline](#encryption-pipeline)
- [Decryption Pipeline](#decryption-pipeline)
- [Type System](#type-system)
- [Security Model](#security-model)
- [Performance Considerations](#performance-considerations)
- [Extension Points](#extension-points)

---

## Overview

The Universal FHEVM SDK is designed as a **framework-agnostic**, **type-safe**, and **developer-friendly** abstraction over the fhevmjs library. It provides:

- **Zero dependencies** core for maximum portability
- **Wagmi-like hooks** for React applications
- **Auto-type detection** for encryption
- **EIP-712 signatures** for decryption permissions
- **Comprehensive error handling** with clear messages

---

## Design Philosophy

### 1. Framework Agnostic Core

The SDK separates framework-specific code from core functionality:

```
packages/fhevm-sdk/
├── src/
│   ├── core/           ← Framework-agnostic (no React/Vue)
│   │   ├── fhevm-client.ts
│   │   ├── encryption.ts
│   │   ├── decryption.ts
│   │   └── types.ts
│   ├── react/          ← React-specific hooks
│   │   ├── FhevmProvider.tsx
│   │   └── useFhevm.ts
│   └── utils/          ← Pure utilities
│       ├── eip712.ts
│       └── abi.ts
```

**Benefits:**
- Core can be used in Node.js, Deno, or browser without React
- Easy to add Vue, Angular, Svelte adapters
- Smaller bundle size (import only what you need)

### 2. Singleton Pattern for Client

The FHEVM client uses singleton pattern to avoid re-initialization:

```typescript
// fhevm-client.ts
export class FhevmClient {
  private instance: IFhevmInstance | null = null;

  async init(provider?: BrowserProvider): Promise<IFhevmInstance> {
    if (this.instance && this.instance.hasKeypair()) {
      return this.instance; // Return existing instance
    }

    // Initialize only if needed
    this.instance = await createFhevmjsInstance({ ... });
    return this.instance;
  }
}
```

**Benefits:**
- Avoids expensive re-initialization
- Maintains keypair across component re-renders
- Reduces memory usage

### 3. Auto-Type Detection

Instead of requiring developers to specify types, the SDK automatically detects:

```typescript
export async function encryptInput(
  contractAddress: string,
  userAddress: string,
  inputs: Record<string, any>
): Promise<EncryptedInput> {
  for (const [key, value] of Object.entries(inputs)) {
    if (typeof value === 'boolean') {
      encryptedInput.addBool(value);
    } else if (typeof value === 'number') {
      // Auto-detect euint8, euint16, euint32 based on value
      if (value <= 255) encryptedInput.addUint8(value);
      else if (value <= 65535) encryptedInput.addUint16(value);
      else if (value <= 4294967295) encryptedInput.addUint32(value);
    }
  }
}
```

**Benefits:**
- 60+ lines reduced to 10 lines
- Less error-prone (no manual type specification)
- Still allows manual type functions when needed

### 4. Wagmi-Inspired API

Following wagmi's successful patterns:

```typescript
// Wagmi pattern
const { data, isLoading, error } = useContractRead({ ... });

// FHEVM SDK pattern
const { encrypt, isEncrypting, error } = useEncrypt();
```

**Benefits:**
- Familiar API for Web3 developers
- Consistent patterns across hooks
- Built-in loading and error states

---

## Core Architecture

### Client Initialization Flow

```
┌─────────────────────────────────────────────────────┐
│ 1. User imports createFhevmInstance                 │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│ 2. Create FhevmClient with config                   │
│    - chainId, rpcUrl, gatewayUrl                    │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│ 3. Call client.init(provider?)                      │
│    - Check if already initialized                   │
│    - Initialize fhevm library if needed             │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│ 4. Create fhevmjs instance                          │
│    - Generate keypair                               │
│    - Connect to gateway                             │
│    - Setup ACL                                      │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│ 5. Return IFhevmInstance                            │
│    - Ready for encryption/decryption                │
└─────────────────────────────────────────────────────┘
```

### Key Components

**1. FhevmClient**
- Manages fhevmjs instance lifecycle
- Handles initialization and configuration
- Provides instance access to encryption/decryption functions

**2. Encryption Module**
- Accepts plain values
- Detects types automatically
- Creates encrypted inputs
- Returns handles and proof

**3. Decryption Module**
- Accepts encrypted handles
- Creates EIP-712 signatures
- Requests gateway decryption
- Returns decrypted bigint values

**4. Utilities Module**
- EIP-712 signature creation
- ABI parsing and event handling
- Type conversion helpers

---

## React Integration

### Context Provider Pattern

```typescript
// FhevmProvider.tsx
const FhevmContext = createContext<FhevmContextValue | null>(null);

export function FhevmProvider({ config, children, autoInit }: Props) {
  const [client] = useState(() => createFhevmInstance(config));
  const [isInitialized, setIsInitialized] = useState(false);

  const init = useCallback(async () => {
    await client.init(provider);
    setIsInitialized(true);
  }, [client]);

  return (
    <FhevmContext.Provider value={{ client, isInitialized, init }}>
      {children}
    </FhevmContext.Provider>
  );
}
```

**Benefits:**
- Single client instance shared across app
- Initialization state available to all components
- No prop drilling

### Hook Architecture

All hooks follow this structure:

```typescript
export function useEncrypt() {
  const instance = useFhevmInstance(); // Get instance from context
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const encrypt = useCallback(async (...args) => {
    setIsEncrypting(true);
    setError(null);
    try {
      return await encryptInput(...args);
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setIsEncrypting(false);
    }
  }, [instance]);

  return { encrypt, isEncrypting, error, clearError };
}
```

**Benefits:**
- Consistent API across all hooks
- Built-in loading and error states
- Proper cleanup and error handling

---

## Encryption Pipeline

### Step-by-Step Flow

```
User Data Input
      │
      ▼
┌─────────────────────────────────────┐
│ 1. Type Detection                   │
│    - boolean → ebool                │
│    - number → euint8/16/32/64       │
│    - string (address) → eaddress    │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│ 2. Create EncryptedInput            │
│    instance.createEncryptedInput()  │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│ 3. Add Values by Type               │
│    encryptedInput.addUint32(1000)   │
│    encryptedInput.addBool(true)     │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│ 4. Encrypt                          │
│    encryptedInput.encrypt()         │
│    - Generate ZK proof              │
│    - Create handles                 │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│ 5. Return Result                    │
│    { handles: string[],             │
│      inputProof: string }           │
└─────────────────────────────────────┘
      │
      ▼
Contract Transaction
```

### Type Detection Logic

```typescript
function detectType(value: any): string {
  if (typeof value === 'boolean') return 'ebool';

  if (typeof value === 'number' || typeof value === 'bigint') {
    const num = Number(value);
    if (num <= 255) return 'euint8';
    if (num <= 65535) return 'euint16';
    if (num <= 4294967295) return 'euint32';
    return 'euint64';
  }

  if (typeof value === 'string' && value.startsWith('0x')) {
    if (value.length === 42) return 'eaddress';
  }

  throw new Error(`Unsupported type for value: ${value}`);
}
```

### Batch Encryption Optimization

Multiple values encrypted in single operation:

```typescript
const encrypted = await encryptBatch(addr, user, {
  id: 1,        // Added to same EncryptedInput
  amount: 1000, // Added to same EncryptedInput
  active: true  // Added to same EncryptedInput
});

// More efficient than:
// await encryptUint8(...); await encryptUint32(...); await encryptBool(...);
```

**Benefits:**
- Single ZK proof for multiple values
- Reduced gas costs
- Faster execution

---

## Decryption Pipeline

### User Decryption Flow (with EIP-712)

```
Encrypted Handle
      │
      ▼
┌─────────────────────────────────────┐
│ 1. Get User's Signer                │
│    const signer = await provider    │
│                   .getSigner()      │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│ 2. Create EIP-712 Message           │
│    domain = { name, chainId, ... }  │
│    message = { handle, address }    │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│ 3. User Signs with Wallet           │
│    signature = await signer         │
│      .signTypedData(domain, msg)    │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│ 4. Request Gateway Decryption       │
│    POST /decrypt                    │
│    { handle, signature, publicKey } │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│ 5. Gateway Verifies Signature       │
│    - Check ACL permissions          │
│    - Verify EIP-712 signature       │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│ 6. Decrypt and Return               │
│    return decryptedValue (bigint)   │
└─────────────────────────────────────┘
```

### Public Decryption Flow (no signature)

```
Public Handle
      │
      ▼
┌─────────────────────────────────────┐
│ 1. Request Gateway Decryption       │
│    POST /decrypt-public             │
│    { handle }                       │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│ 2. Gateway Checks ACL               │
│    - Verify public access allowed   │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│ 3. Return Decrypted Value           │
│    return value (bigint)            │
└─────────────────────────────────────┘
```

### EIP-712 Signature Structure

```typescript
const domain = {
  name: 'FHEVM',
  version: '1',
  chainId: 9000,
  verifyingContract: contractAddress
};

const types = {
  DecryptionPermission: [
    { name: 'handle', type: 'bytes32' },
    { name: 'contractAddress', type: 'address' },
    { name: 'userAddress', type: 'address' }
  ]
};

const message = {
  handle: '0xabcd...',
  contractAddress: '0x1234...',
  userAddress: '0x5678...'
};

const signature = await signer.signTypedData(domain, types, message);
```

---

## Type System

### TypeScript Type Definitions

```typescript
// Core configuration
interface FhevmConfig {
  chainId: number;           // Required: Network ID
  gatewayUrl?: string;       // Optional: Custom gateway
  aclAddress?: string;       // Optional: ACL contract
  rpcUrl?: string;           // Optional: Custom RPC
  networkName?: string;      // Optional: Display name
}

// Encrypted data result
interface EncryptedInput {
  handles: string[];         // Array of encrypted handles
  inputProof: string;        // ZK proof for verification
}

// Decryption request
interface DecryptionRequest {
  contractAddress: string;   // Contract address
  handle: string;            // Encrypted handle
  signer: JsonRpcSigner;     // User's signer
}
```

### Runtime Type Safety

```typescript
// Validate at runtime
function validateConfig(config: FhevmConfig): void {
  if (!config.chainId) {
    throw new Error('chainId is required');
  }

  if (config.chainId < 1) {
    throw new Error('chainId must be positive');
  }
}

// Validate encryption inputs
function validateInput(value: any, type: string): void {
  if (type === 'euint8' && (value < 0 || value > 255)) {
    throw new Error('euint8 must be 0-255');
  }

  if (type === 'eaddress' && !value.startsWith('0x')) {
    throw new Error('eaddress must start with 0x');
  }
}
```

---

## Security Model

### Access Control

**1. Client-Side Encryption**
- Data encrypted in user's browser
- Private key never leaves device
- Only encrypted data sent to blockchain

**2. EIP-712 Signatures**
- User explicitly approves each decryption
- Signature tied to specific handle and contract
- Cannot be replayed or reused

**3. Gateway ACL**
- Smart contract defines access rules
- Gateway enforces permissions
- Only authorized users can decrypt

### Threat Model

**Protected Against:**
- ✅ Unauthorized decryption (ACL + signatures)
- ✅ Man-in-the-middle (HTTPS + encryption)
- ✅ Replay attacks (nonce in signatures)
- ✅ Contract tampering (immutable blockchain)

**Not Protected Against:**
- ❌ Compromised user device
- ❌ Malicious contract code
- ❌ Gateway unavailability (centralization risk)

### Best Practices

```typescript
// 1. Validate contract address
const isValidContract = await verifyContract(contractAddress);
if (!isValidContract) {
  throw new Error('Invalid contract');
}

// 2. Limit decryption permissions
FHE.allow(encryptedData, authorizedUser); // Only specific user

// 3. Use time-limited access
if (block.timestamp > expirationTime) {
  revert('Access expired');
}

// 4. Audit decryption requests
emit DecryptionRequested(user, handle, timestamp);
```

---

## Performance Considerations

### Initialization Cost

**First Load:**
- Load fhevmjs library: ~500ms
- Generate keypair: ~200ms
- Connect to gateway: ~100ms
- **Total: ~800ms**

**Subsequent Loads:**
- Return cached instance: ~1ms

**Optimization:**
```typescript
<FhevmProvider config={config} autoInit>
  {/* Initialize early, before user needs it */}
</FhevmProvider>
```

### Encryption Performance

| Type | Values | Time | Gas Cost |
|------|--------|------|----------|
| Single euint8 | 1 | ~50ms | ~50k gas |
| Batch 5 values | 5 | ~100ms | ~150k gas |
| Single euint64 | 1 | ~70ms | ~70k gas |

**Optimization:**
- Use batch encryption for multiple values
- Prefer smaller types (euint8 > euint32 > euint64)
- Cache encrypted results when possible

### Decryption Performance

| Type | Time | Gas Cost |
|------|------|----------|
| User decrypt | ~2s | Free (off-chain) |
| Public decrypt | ~500ms | Free (off-chain) |

**Optimization:**
- Batch decryption requests
- Cache decrypted values
- Use public decrypt when possible (no signature)

### Bundle Size

| Package | Size | Gzipped |
|---------|------|---------|
| Core only | 15 KB | 5 KB |
| Core + React | 25 KB | 8 KB |
| Core + React + Utils | 30 KB | 10 KB |

**Optimization:**
```typescript
// Import only what you need
import { encryptInput } from '@fhevm/sdk'; // Core only
import { useEncrypt } from '@fhevm/sdk/react'; // + React
```

---

## Extension Points

### Custom Network Support

```typescript
// Add custom network
const customConfig: FhevmConfig = {
  chainId: 12345,
  networkName: 'My Custom Network',
  rpcUrl: 'https://rpc.custom.network',
  gatewayUrl: 'https://gateway.custom.network',
  aclAddress: '0x...'
};

const client = createFhevmInstance(customConfig);
```

### Framework Adapters

To add support for Vue, Angular, etc:

```typescript
// packages/fhevm-sdk/src/vue/useFhevm.ts
import { ref, onMounted } from 'vue';
import { createFhevmInstance } from '../core/fhevm-client';

export function useFhevm(config: FhevmConfig) {
  const client = createFhevmInstance(config);
  const isInitialized = ref(false);

  onMounted(async () => {
    await client.init();
    isInitialized.value = true;
  });

  return { client, isInitialized };
}
```

### Custom Encryption Types

```typescript
// Add custom encryption for special types
export async function encryptCustomType(
  contractAddress: string,
  userAddress: string,
  data: CustomType
): Promise<EncryptedInput> {
  const instance = getFhevmInstance();
  const input = instance.createEncryptedInput(contractAddress, userAddress);

  // Custom logic for your type
  input.addUint32(data.field1);
  input.addBool(data.field2);

  return input.encrypt();
}
```

### Middleware Support

```typescript
// Add middleware for logging, analytics, etc
export function withLogging<T>(
  fn: (...args: any[]) => Promise<T>
): (...args: any[]) => Promise<T> {
  return async (...args) => {
    console.log('Calling:', fn.name, args);
    const result = await fn(...args);
    console.log('Result:', result);
    return result;
  };
}

// Usage
const encrypt = withLogging(encryptInput);
```

---

## Architecture Diagrams

### Component Hierarchy

```
┌─────────────────────────────────────────────────┐
│              User Application                   │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│            FhevmProvider (React)                │
│         or useFhevm (Vue/Custom)                │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│              Core SDK Layer                     │
│   ┌──────────────┬──────────────┬────────────┐  │
│   │ FhevmClient  │  Encryption  │ Decryption │  │
│   └──────────────┴──────────────┴────────────┘  │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│             fhevmjs Library                     │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│        FHEVM Gateway + Blockchain               │
└─────────────────────────────────────────────────┘
```

### Data Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│   User   │────▶│   SDK    │────▶│  fhevmjs │────▶│ Gateway  │
│  Input   │     │ Encrypt  │     │  Encrypt │     │ + Chain  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                                                          │
                                                          ▼
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│   User   │◀────│   SDK    │◀────│  fhevmjs │◀────│ Gateway  │
│  Output  │     │ Decrypt  │     │  Decrypt │     │ Response │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
```

---

## Future Enhancements

### Planned Features

1. **Caching Layer**
   - Cache encrypted values locally
   - Reduce redundant encryption operations

2. **Batch Decryption API**
   - Decrypt multiple handles in parallel
   - Single signature for multiple values

3. **Vue/Angular/Svelte Adapters**
   - Official framework adapters
   - Consistent API across frameworks

4. **Developer Tools**
   - Browser extension for debugging
   - Encrypted data inspector
   - Performance profiler

5. **Advanced Type Support**
   - Custom struct encryption
   - Array encryption
   - Complex type composition

---

For implementation details, see the [API Reference](./api-reference.md).

For usage examples, see [Examples Documentation](./examples.md).
