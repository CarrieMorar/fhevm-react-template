# API Reference

Complete API documentation for the Universal FHEVM SDK.

---

## Table of Contents

- [Core Functions](#core-functions)
- [React Hooks](#react-hooks)
- [Utilities](#utilities)
- [Type Definitions](#type-definitions)

---

## Core Functions

### `createFhevmInstance(config)`

Creates a new FHEVM client instance.

**Parameters:**
- `config: FhevmConfig` - Configuration object

**Returns:** `FhevmClient`

**Example:**
```typescript
import { createFhevmInstance } from '@fhevm/sdk';

const client = createFhevmInstance({
  chainId: 9000,
  rpcUrl: 'https://devnet.zama.ai',
  networkName: 'Zama Devnet'
});
```

---

### `encryptInput(contractAddress, userAddress, inputs)`

Encrypts inputs for contract interaction with automatic type detection.

**Parameters:**
- `contractAddress: string` - Target contract address
- `userAddress: string` - User's wallet address
- `inputs: Record<string, any>` - Key-value pairs to encrypt

**Returns:** `Promise<EncryptedInput>`

**Supported Types:**
- `boolean` → `ebool`
- `number` (0-255) → `euint8`
- `number` (256-65535) → `euint16`
- `number` (65536-4294967295) → `euint32`
- `bigint` → `euint64`
- `string` (address) → `eaddress`

**Example:**
```typescript
import { encryptInput } from '@fhevm/sdk';

const encrypted = await encryptInput(
  '0x1234...', // contract address
  '0x5678...', // user address
  {
    amount: 1000,        // Auto-detected as euint16
    isActive: true,      // Auto-detected as ebool
    userId: 42           // Auto-detected as euint8
  }
);

// Use encrypted data in contract call
await contract.submitData(encrypted.handles, encrypted.inputProof);
```

---

### `encryptBool(contractAddress, userAddress, value)`

Encrypts a boolean value.

**Parameters:**
- `contractAddress: string`
- `userAddress: string`
- `value: boolean`

**Returns:** `Promise<EncryptedInput>`

**Example:**
```typescript
const encrypted = await encryptBool(
  '0x1234...',
  '0x5678...',
  true
);
```

---

### `encryptUint8(contractAddress, userAddress, value)`

Encrypts an 8-bit unsigned integer (0-255).

**Parameters:**
- `contractAddress: string`
- `userAddress: string`
- `value: number`

**Returns:** `Promise<EncryptedInput>`

**Example:**
```typescript
const encrypted = await encryptUint8(
  '0x1234...',
  '0x5678...',
  42
);
```

---

### `encryptUint16(contractAddress, userAddress, value)`

Encrypts a 16-bit unsigned integer (0-65535).

**Parameters:**
- `contractAddress: string`
- `userAddress: string`
- `value: number`

**Returns:** `Promise<EncryptedInput>`

---

### `encryptUint32(contractAddress, userAddress, value)`

Encrypts a 32-bit unsigned integer (0-4294967295).

**Parameters:**
- `contractAddress: string`
- `userAddress: string`
- `value: number`

**Returns:** `Promise<EncryptedInput>`

---

### `encryptUint64(contractAddress, userAddress, value)`

Encrypts a 64-bit unsigned integer.

**Parameters:**
- `contractAddress: string`
- `userAddress: string`
- `value: bigint | number`

**Returns:** `Promise<EncryptedInput>`

---

### `encryptAddress(contractAddress, userAddress, value)`

Encrypts an Ethereum address.

**Parameters:**
- `contractAddress: string`
- `userAddress: string`
- `value: string` - Ethereum address (0x...)

**Returns:** `Promise<EncryptedInput>`

**Example:**
```typescript
const encrypted = await encryptAddress(
  '0x1234...',
  '0x5678...',
  '0xabcd...'
);
```

---

### `encryptBatch(contractAddress, userAddress, inputs)`

Encrypts multiple values in a single operation.

**Parameters:**
- `contractAddress: string`
- `userAddress: string`
- `inputs: Record<string, any>` - Multiple key-value pairs

**Returns:** `Promise<EncryptedInput>`

**Example:**
```typescript
const encrypted = await encryptBatch(
  '0x1234...',
  '0x5678...',
  {
    clientId: 123,
    categoryId: 5,
    isUrgent: true,
    maxFee: 1000n
  }
);
```

---

### `userDecrypt(params)`

Decrypts a value using EIP-712 signature (user permission required).

**Parameters:**
- `params: DecryptionRequest`
  - `contractAddress: string` - Contract address
  - `handle: string` - Encrypted value handle
  - `signer: JsonRpcSigner` - Ethers.js signer

**Returns:** `Promise<bigint>`

**Example:**
```typescript
import { BrowserProvider } from 'ethers';
import { userDecrypt } from '@fhevm/sdk';

const provider = new BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const decryptedValue = await userDecrypt({
  contractAddress: '0x1234...',
  handle: '0xabcd...',
  signer
});

console.log('Decrypted:', decryptedValue); // bigint
```

---

### `publicDecrypt(contractAddress, handle)`

Decrypts a publicly available encrypted value (no signature required).

**Parameters:**
- `contractAddress: string`
- `handle: string` - Encrypted value handle

**Returns:** `Promise<bigint>`

**Example:**
```typescript
const publicValue = await publicDecrypt(
  '0x1234...',
  '0xabcd...'
);
```

---

## React Hooks

### `FhevmProvider`

Context provider for FHEVM SDK in React applications.

**Props:**
- `config: FhevmConfig` - SDK configuration
- `autoInit?: boolean` - Auto-initialize on mount (default: false)
- `children: ReactNode`

**Example:**
```tsx
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
```

---

### `useFhevm()`

Access FHEVM client instance and initialization state.

**Returns:**
```typescript
{
  client: FhevmClient | null;
  isInitialized: boolean;
  isInitializing: boolean;
  init: () => Promise<void>;
  error: Error | null;
}
```

**Example:**
```tsx
import { useFhevm } from '@fhevm/sdk/react';

function MyComponent() {
  const { client, isInitialized, init } = useFhevm();

  useEffect(() => {
    if (!isInitialized) {
      init();
    }
  }, [isInitialized, init]);

  return <div>Initialized: {isInitialized ? 'Yes' : 'No'}</div>;
}
```

---

### `useEncrypt()`

Hook for encrypting data with loading states.

**Returns:**
```typescript
{
  encrypt: (
    contractAddress: string,
    userAddress: string,
    inputs: Record<string, any>
  ) => Promise<EncryptedInput | null>;
  isEncrypting: boolean;
  error: Error | null;
  clearError: () => void;
}
```

**Example:**
```tsx
import { useEncrypt } from '@fhevm/sdk/react';

function EncryptForm() {
  const { encrypt, isEncrypting, error } = useEncrypt();

  const handleSubmit = async () => {
    const encrypted = await encrypt(
      contractAddress,
      userAddress,
      { amount: 1000 }
    );

    if (encrypted) {
      await contract.submit(encrypted.handles, encrypted.inputProof);
    }
  };

  return (
    <button onClick={handleSubmit} disabled={isEncrypting}>
      {isEncrypting ? 'Encrypting...' : 'Submit'}
    </button>
  );
}
```

---

### `useEncryptBool()`

Hook for encrypting boolean values.

**Returns:**
```typescript
{
  encryptBool: (
    contractAddress: string,
    userAddress: string,
    value: boolean
  ) => Promise<EncryptedInput | null>;
  isEncrypting: boolean;
  error: Error | null;
}
```

---

### `useEncryptUint()`

Hook for encrypting unsigned integers (auto-detects size).

**Returns:**
```typescript
{
  encryptUint: (
    contractAddress: string,
    userAddress: string,
    value: number | bigint
  ) => Promise<EncryptedInput | null>;
  isEncrypting: boolean;
  error: Error | null;
}
```

---

### `useEncryptAddress()`

Hook for encrypting Ethereum addresses.

**Returns:**
```typescript
{
  encryptAddress: (
    contractAddress: string,
    userAddress: string,
    address: string
  ) => Promise<EncryptedInput | null>;
  isEncrypting: boolean;
  error: Error | null;
}
```

---

### `useDecrypt()`

Hook for user-permission decryption with EIP-712 signatures.

**Returns:**
```typescript
{
  decrypt: (
    contractAddress: string,
    handle: string,
    signer: JsonRpcSigner
  ) => Promise<bigint | null>;
  isDecrypting: boolean;
  error: Error | null;
}
```

**Example:**
```tsx
import { useDecrypt } from '@fhevm/sdk/react';
import { useEthersSigner } from './hooks/useEthersSigner';

function DecryptButton({ handle }: { handle: string }) {
  const { decrypt, isDecrypting } = useDecrypt();
  const signer = useEthersSigner();
  const [value, setValue] = useState<bigint | null>(null);

  const handleDecrypt = async () => {
    const decrypted = await decrypt(
      contractAddress,
      handle,
      signer
    );
    setValue(decrypted);
  };

  return (
    <div>
      <button onClick={handleDecrypt} disabled={isDecrypting}>
        {isDecrypting ? 'Decrypting...' : 'Decrypt'}
      </button>
      {value !== null && <p>Value: {value.toString()}</p>}
    </div>
  );
}
```

---

### `usePublicDecrypt()`

Hook for public decryption (no signature required).

**Returns:**
```typescript
{
  publicDecrypt: (
    contractAddress: string,
    handle: string
  ) => Promise<bigint | null>;
  isDecrypting: boolean;
  error: Error | null;
}
```

---

### `useFhevmInstance()`

Low-level hook to access raw FHEVM instance.

**Returns:** `IFhevmInstance | null`

**Example:**
```tsx
import { useFhevmInstance } from '@fhevm/sdk/react';

function AdvancedComponent() {
  const instance = useFhevmInstance();

  if (!instance) return <div>Not initialized</div>;

  // Direct access to fhevmjs methods
  const hasKeypair = instance.hasKeypair();

  return <div>Has Keypair: {hasKeypair ? 'Yes' : 'No'}</div>;
}
```

---

## Utilities

### `createEIP712Signature(contractAddress, handle, signer)`

Creates EIP-712 typed data signature for decryption permission.

**Parameters:**
- `contractAddress: string`
- `handle: string` - Encrypted value handle
- `signer: JsonRpcSigner`

**Returns:**
```typescript
Promise<{
  signature: string;
  publicKey: string;
}>
```

**Example:**
```typescript
import { createEIP712Signature } from '@fhevm/sdk/utils';

const { signature, publicKey } = await createEIP712Signature(
  '0x1234...',
  '0xabcd...',
  signer
);
```

---

### `parseEncryptedEvent(event, abi)`

Parses contract events containing encrypted data.

**Parameters:**
- `event: Log` - Ethers.js event log
- `abi: InterfaceAbi` - Contract ABI

**Returns:** Parsed event data

**Example:**
```typescript
import { parseEncryptedEvent } from '@fhevm/sdk/utils';

const events = await contract.queryFilter('ConsultationSubmitted');

for (const event of events) {
  const parsed = parseEncryptedEvent(event, contractAbi);
  console.log('Consultation ID:', parsed.args.consultationId);
}
```

---

### `getContractEncryptedState(contract, method, ...args)`

Retrieves encrypted state from contract view functions.

**Parameters:**
- `contract: Contract` - Ethers.js contract instance
- `method: string` - View function name
- `args: any[]` - Function arguments

**Returns:** `Promise<any>`

---

## Type Definitions

### `FhevmConfig`

```typescript
interface FhevmConfig {
  chainId: number;
  gatewayUrl?: string;
  aclAddress?: string;
  rpcUrl?: string;
  networkName?: string;
}
```

---

### `EncryptedInput`

```typescript
interface EncryptedInput {
  handles: string[];
  inputProof: string;
}
```

---

### `DecryptionRequest`

```typescript
interface DecryptionRequest {
  contractAddress: string;
  handle: string;
  signer: JsonRpcSigner;
}
```

---

### `NETWORK_CONFIGS`

Pre-configured network settings.

```typescript
const NETWORK_CONFIGS = {
  zama: {
    chainId: 9000,
    networkName: 'Zama Devnet',
    rpcUrl: 'https://devnet.zama.ai',
  },
  sepolia: {
    chainId: 11155111,
    networkName: 'Sepolia Testnet',
    rpcUrl: 'https://rpc.sepolia.org',
  },
  local: {
    chainId: 31337,
    networkName: 'Local Hardhat',
    rpcUrl: 'http://localhost:8545',
  }
};
```

**Usage:**
```typescript
import { NETWORK_CONFIGS } from '@fhevm/sdk';

const client = createFhevmInstance(NETWORK_CONFIGS.zama);
```

---

## Error Handling

All async functions can throw the following errors:

**`FhevmNotInitializedError`**
- Thrown when attempting operations before initialization
- Solution: Call `init()` or use `autoInit` prop

**`EncryptionError`**
- Thrown when encryption fails
- Common causes: Invalid input types, network issues

**`DecryptionError`**
- Thrown when decryption fails
- Common causes: Invalid handle, missing permissions, signature rejection

**`SignatureRejectedError`**
- Thrown when user rejects EIP-712 signature
- Handle gracefully in UI

**Example:**
```typescript
try {
  const encrypted = await encrypt(contractAddress, userAddress, { amount: 1000 });
} catch (error) {
  if (error.name === 'FhevmNotInitializedError') {
    console.error('Please initialize FHEVM first');
  } else if (error.name === 'EncryptionError') {
    console.error('Encryption failed:', error.message);
  }
}
```

---

## Best Practices

1. **Always initialize before use**
   ```tsx
   <FhevmProvider config={config} autoInit>
   ```

2. **Handle loading states**
   ```tsx
   const { encrypt, isEncrypting } = useEncrypt();
   <button disabled={isEncrypting}>Submit</button>
   ```

3. **Clear errors after handling**
   ```tsx
   const { error, clearError } = useEncrypt();
   useEffect(() => {
     if (error) {
       showNotification(error.message);
       clearError();
     }
   }, [error]);
   ```

4. **Use auto-type detection for simplicity**
   ```typescript
   // Good: Let SDK detect types
   await encrypt(addr, user, { amount: 1000, isActive: true });

   // Avoid: Manual type specification unless needed
   await encryptUint32(addr, user, 1000);
   ```

5. **Batch operations when possible**
   ```typescript
   // Good: Single encryption call
   await encryptBatch(addr, user, { id: 1, amount: 1000, active: true });

   // Avoid: Multiple separate calls
   await encryptUint8(addr, user, 1);
   await encryptUint32(addr, user, 1000);
   await encryptBool(addr, user, true);
   ```

---

## TypeScript Support

The SDK is built with TypeScript and provides full type safety:

```typescript
import type {
  FhevmConfig,
  EncryptedInput,
  DecryptionRequest
} from '@fhevm/sdk';

// Type-safe configuration
const config: FhevmConfig = {
  chainId: 9000,
  rpcUrl: 'https://devnet.zama.ai'
};

// Type-safe encryption
const encrypted: EncryptedInput = await encryptInput(
  contractAddress,
  userAddress,
  { amount: 1000 }
);
```

All hooks return fully typed objects with IntelliSense support.

---

For more examples, see [Examples Documentation](./examples.md).

For migration from direct fhevmjs usage, see [Migration Guide](./migration-guide.md).
