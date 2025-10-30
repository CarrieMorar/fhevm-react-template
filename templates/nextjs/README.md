# Next.js FHEVM SDK Template

Starter template for Next.js applications using the Universal FHEVM SDK.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## What's Included

- Next.js 14 with App Router
- FHEVM SDK integration with FhevmProvider
- TypeScript configuration
- Tailwind CSS
- Example components with SDK usage

## Basic Setup

### 1. Wrap your app with FhevmProvider

```tsx
// app/layout.tsx
import { FhevmProvider } from '@fhevm/sdk/react';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <FhevmProvider
          config={{
            chainId: 9000,
            networkName: 'Zama Devnet',
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

### 2. Use hooks in your components

```tsx
// app/page.tsx
'use client';

import { useEncrypt, useDecrypt } from '@fhevm/sdk/react';

export default function Page() {
  const { encrypt } = useEncrypt();
  const { decrypt } = useDecrypt();

  // Your logic here
}
```

## Full Example

For a complete implementation with use cases, see:
`examples/nextjs-legal-consultation/`

This includes:
- Encryption/decryption demos
- Homomorphic computation examples
- Banking and medical use cases
- API routes for FHE operations

## Learn More

- [FHEVM SDK Documentation](../../README.md)
- [Next.js Documentation](https://nextjs.org/docs)
