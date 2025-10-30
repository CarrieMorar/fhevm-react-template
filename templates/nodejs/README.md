# Node.js FHEVM SDK Template

Starter template for Node.js applications using the Universal FHEVM SDK.

## Quick Start

```bash
# Install dependencies
npm install

# Run
node index.js
```

## What's Included

- Pure Node.js setup (framework-agnostic)
- FHEVM SDK core functionality
- Example scripts for encryption/decryption
- TypeScript support (optional)

## Basic Usage

### 1. Install SDK

```bash
npm install @fhevm/sdk ethers
```

### 2. Create main script

```javascript
// index.js
const { createFhevmInstance, encryptInput, userDecrypt } = require('@fhevm/sdk');
const { ethers } = require('ethers');

async function main() {
  // Create FHEVM instance
  const fhevmClient = createFhevmInstance({
    chainId: 9000,
    networkName: 'Zama Devnet',
    rpcUrl: 'https://devnet.zama.ai'
  });

  // Initialize
  const provider = new ethers.JsonRpcProvider('https://devnet.zama.ai');
  await fhevmClient.init(provider);

  console.log('FHEVM initialized successfully!');

  // Encrypt data
  const contractAddress = '0x...';
  const userAddress = '0x...';

  const encrypted = await encryptInput(contractAddress, userAddress, {
    amount: 1000,
    value: 42
  });

  console.log('Encrypted handles:', encrypted.handles);
  console.log('Input proof:', encrypted.inputProof);

  // Use in contract interaction
  const contract = new ethers.Contract(contractAddress, abi, signer);
  const tx = await contract.submitData(
    encrypted.handles[0],
    encrypted.inputProof
  );

  await tx.wait();
  console.log('Transaction successful!');
}

main().catch(console.error);
```

## Full Example

For a complete implementation, see:
`examples/vanilla-node/`

This includes:
- Complete CLI interface
- Batch encryption
- Public decryption examples
- Contract interaction

## Learn More

- [FHEVM SDK Documentation](../../README.md)
- [Node.js Documentation](https://nodejs.org)
