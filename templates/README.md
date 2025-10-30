# FHEVM SDK Templates

This directory contains starter templates for different frameworks demonstrating FHEVM SDK integration.

## Available Templates

### Next.js Template
Location: `templates/nextjs/`

Complete Next.js App Router template with FHEVM SDK integration.

**Features:**
- FhevmProvider setup
- React hooks integration
- API routes for FHE operations
- TypeScript support
- Tailwind CSS styling

**Full Example:** See `examples/nextjs-legal-consultation/` for a complete implementation with use cases.

### React Template
Location: `templates/react/`

React application template with FHEVM SDK.

**Features:**
- Create React App or Vite setup
- FHEVM SDK hooks
- Component examples

### Vue Template
Location: `templates/vue/`

Vue.js template with FHEVM SDK integration.

**Features:**
- Vue 3 Composition API
- FHEVM SDK integration
- Reactive state management

### Node.js Template
Location: `templates/nodejs/`

Pure Node.js template for server-side FHE operations.

**Features:**
- Framework-agnostic usage
- CLI examples
- Server-side encryption/decryption

**Full Example:** See `examples/vanilla-node/` for a complete Node.js implementation.

## Quick Start

### Using Next.js Template

```bash
# Copy template to your project
cp -r templates/nextjs my-fhevm-app
cd my-fhevm-app

# Install dependencies
npm install

# Run development server
npm run dev
```

### Using Node.js Template

```bash
# Copy template
cp -r templates/nodejs my-fhevm-cli
cd my-fhevm-cli

# Install dependencies
npm install

# Run
node index.js
```

## Complete Examples

For full-featured examples with real use cases, see the `examples/` directory:

- **Next.js Legal Consultation** - `examples/nextjs-legal-consultation/`
- **Vanilla Node.js** - `examples/vanilla-node/`
- **Legacy Examples** - `examples/legal-consultation/`, `examples/AnonymousLegalConsultation/`

## Documentation

For detailed SDK documentation, see the main [README.md](../README.md) in the root directory.
