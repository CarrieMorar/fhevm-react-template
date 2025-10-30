# Vue FHEVM SDK Template

Starter template for Vue.js applications using the Universal FHEVM SDK.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## What's Included

- Vue 3 with Composition API
- FHEVM SDK framework-agnostic core
- TypeScript support
- Example components

## Basic Setup

### 1. Install SDK

```bash
npm install @fhevm/sdk ethers
```

### 2. Create FHEVM composable

```typescript
// src/composables/useFhevm.ts
import { ref, onMounted } from 'vue';
import { createFhevmInstance, encryptInput } from '@fhevm/sdk';

export function useFhevm() {
  const isReady = ref(false);
  const fhevmClient = createFhevmInstance({
    chainId: 9000,
    networkName: 'Zama Devnet',
  });

  onMounted(async () => {
    await fhevmClient.init();
    isReady.value = true;
  });

  const encrypt = async (contractAddress: string, userAddress: string, data: any) => {
    return encryptInput(contractAddress, userAddress, data);
  };

  return {
    isReady,
    encrypt,
  };
}
```

### 3. Use in components

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useFhevm } from '@/composables/useFhevm';

const { isReady, encrypt } = useFhevm();
const value = ref('');

const handleEncrypt = async () => {
  const encrypted = await encrypt(contractAddress, userAddress, {
    value: parseInt(value.value)
  });
  console.log('Encrypted:', encrypted.handles);
};
</script>

<template>
  <div>
    <div v-if="isReady">
      <input v-model="value" type="number" placeholder="Enter value" />
      <button @click="handleEncrypt">Encrypt</button>
    </div>
    <div v-else>Initializing FHEVM...</div>
  </div>
</template>
```

## Learn More

- [FHEVM SDK Documentation](../../README.md)
- [Vue Documentation](https://vuejs.org)
