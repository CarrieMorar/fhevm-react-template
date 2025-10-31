# Next.js FHEVM SDK Example

This is a complete Next.js example demonstrating the integration of the Universal FHEVM SDK with various use cases.

## Features

- **Full SDK Integration**: Complete implementation of @fhevm/sdk in Next.js App Router
- **Encryption Demo**: Interactive encryption and decryption examples
- **Homomorphic Computation**: Demonstrations of computing on encrypted data
- **Banking Example**: Private financial transactions use case
- **Medical Records**: HIPAA-compliant healthcare data management
- **API Routes**: Server-side FHE operations endpoints

## Getting Started

### Prerequisites

- Node.js 18+
- MetaMask or compatible Web3 wallet
- Access to Zama Devnet (or local FHEVM node)

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout with FhevmProvider
│   ├── page.tsx                # Main page
│   ├── globals.css             # Global styles
│   └── api/                    # API routes
│       ├── fhe/
│       │   ├── route.ts         # Main FHE operations
│       │   ├── encrypt/route.ts # Encryption endpoint
│       │   ├── decrypt/route.ts # Decryption endpoint
│       │   └── compute/route.ts # Computation endpoint
│       └── keys/route.ts       # Key management
│
├── components/                 # React components
│   ├── ui/                     # UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   ├── fhe/                    # FHE-specific components
│   │   ├── EncryptionDemo.tsx
│   │   └── ComputationDemo.tsx
│   └── examples/               # Use case examples
│       ├── BankingExample.tsx
│       └── MedicalExample.tsx
│
├── lib/                        # Utilities
│   ├── fhe/
│   │   ├── client.ts           # Client-side FHE operations
│   │   └── types.ts            # FHE type definitions
│   └── utils/
│       ├── security.ts         # Security utilities
│       └── validation.ts       # Validation helpers
│
└── types/                      # TypeScript types
    ├── fhe.ts
    └── api.ts
```

## Usage Examples

### Basic Encryption

```tsx
import { useEncrypt } from '@fhevm/sdk/react';

function MyComponent() {
  const { encrypt } = useEncrypt();

  const handleEncrypt = async () => {
    const encrypted = await encrypt(contractAddress, userAddress, {
      value: 1000
    });
    console.log('Encrypted handle:', encrypted.handles[0]);
  };
}
```

### Decryption with EIP-712

```tsx
import { useDecrypt } from '@fhevm/sdk/react';

function MyComponent() {
  const { decrypt, decryptedValue } = useDecrypt();

  const handleDecrypt = async () => {
    await decrypt({
      contractAddress,
      handle: encryptedHandle,
      signer
    });
    console.log('Decrypted value:', decryptedValue);
  };
}
```

## SDK Integration

This example demonstrates the complete FHEVM SDK workflow:

1. **Initialization**: FhevmProvider wraps the app in `layout.tsx`
2. **Encryption**: Multiple examples of encrypting different data types
3. **Decryption**: User decryption with EIP-712 signatures
4. **Computation**: Homomorphic operations on encrypted data
5. **Use Cases**: Real-world examples (banking, medical records)

## Building for Production

```bash
npm run build
npm start
```

## Learn More

- [FHEVM SDK Documentation](../../README.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Zama FHEVM](https://docs.zama.ai/fhevm)

## License

MIT
