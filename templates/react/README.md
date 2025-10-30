# React FHEVM SDK Template

Starter template for React applications using the Universal FHEVM SDK.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm start
```

## What's Included

- React 18
- FHEVM SDK with React hooks
- TypeScript support
- Example components

## Basic Setup

### 1. Wrap your app with FhevmProvider

```tsx
// src/App.tsx
import { FhevmProvider } from '@fhevm/sdk/react';
import MainComponent from './components/MainComponent';

function App() {
  return (
    <FhevmProvider
      config={{
        chainId: 9000,
        networkName: 'Zama Devnet',
      }}
      autoInit
    >
      <MainComponent />
    </FhevmProvider>
  );
}

export default App;
```

### 2. Use FHEVM hooks

```tsx
// src/components/MainComponent.tsx
import { useFhevm, useEncrypt } from '@fhevm/sdk/react';

export default function MainComponent() {
  const { isReady } = useFhevm();
  const { encrypt, isEncrypting } = useEncrypt();

  const handleEncrypt = async () => {
    const encrypted = await encrypt(contractAddress, userAddress, {
      value: 1000
    });
    console.log('Encrypted:', encrypted.handles);
  };

  return (
    <div>
      {isReady ? (
        <button onClick={handleEncrypt} disabled={isEncrypting}>
          Encrypt Data
        </button>
      ) : (
        <p>Initializing FHEVM...</p>
      )}
    </div>
  );
}
```

## Learn More

- [FHEVM SDK Documentation](../../README.md)
- [React Documentation](https://react.dev)
