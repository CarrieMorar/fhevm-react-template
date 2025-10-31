# Anonymous Legal Consultation Platform - React Version

**Secure, Private & Encrypted Legal Consultations on Blockchain**

This is a fully functional React/Next.js implementation of the Anonymous Legal Consultation Platform with integrated FHEVM SDK support.

---

## 🎯 Features

### ✅ Complete React Implementation
- Modern Next.js 14 with App Router
- TypeScript for full type safety
- Tailwind CSS for styling
- Responsive design

### ✅ FHEVM SDK Integration
- FHE Provider context
- Wallet connection with ethers.js v6
- Smart contract interactions
- Encrypted data handling

### ✅ Full Platform Functionality
- **Client Portal** - Submit encrypted legal consultations
- **View Portal** - Track consultation status and responses
- **Lawyer Portal** - Register as lawyer and provide responses
- **Admin Panel** - Platform management and oversight
- **Statistics Dashboard** - Real-time platform analytics

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MetaMask or compatible Web3 wallet
- Access to Zama Devnet (Chain ID: 9000)

### Installation

```bash
# Navigate to the project directory
cd examples/AnonymousLegalConsultation

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

---

## 📂 Project Structure

```
AnonymousLegalConsultation/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with FHE Provider
│   │   ├── page.tsx            # Main application page
│   │   └── globals.css         # Global styles with Tailwind
│   ├── components/
│   │   ├── FHEProvider.tsx     # FHE context provider
│   │   ├── WalletConnect.tsx   # Wallet connection component
│   │   ├── StatusMessage.tsx   # Status notifications
│   │   └── sections/           # Feature sections
│   │       ├── ClientSection.tsx
│   │       ├── ViewSection.tsx
│   │       ├── LawyerSection.tsx
│   │       ├── AdminSection.tsx
│   │       └── StatsSection.tsx
│   ├── hooks/
│   │   └── useWallet.ts        # Wallet connection hook
│   ├── lib/
│   │   └── contract.ts         # Contract ABI and constants
│   └── types/
│       └── index.ts            # TypeScript type definitions
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
└── README.md
```

---

## 💻 Usage

### 1. Connect Wallet

Click "Connect Wallet" to connect your MetaMask wallet. Ensure you're on Zama Devnet (Chain ID: 9000).

### 2. Submit a Consultation (Client)

1. Navigate to "Submit Consultation"
2. Enter your anonymous client ID (1-9999)
3. Select legal category
4. Enter your encrypted question
5. Set consultation fee (minimum 0.001 ETH)
6. Submit

### 3. Register as Lawyer

1. Navigate to "Lawyer Portal"
2. Select your specialty
3. Click "Register"
4. Wait for admin verification

### 4. Provide Legal Response (Lawyer)

1. After registration, enter consultation ID
2. Write your professional legal response
3. Submit response

### 5. Admin Functions

If you're the contract admin:
- Assign consultations to lawyers
- Verify lawyer registrations
- Update lawyer ratings
- Manage platform operations

### 6. View Statistics

Navigate to "Statistics" to see:
- Total platform consultations
- Total registered lawyers
- Verified lawyers count
- Your personal client statistics

---

## 🔧 Technical Details

### SDK Integration

The application integrates the FHEVM SDK through:

**FHE Provider** (`src/components/FHEProvider.tsx`):
```tsx
import { createFhevmInstance } from '@fhevm/sdk';

// Provides FHE context to all components
<FHEProvider config={{ chainId: 9000 }} autoInit>
  <App />
</FHEProvider>
```

**Wallet Hook** (`src/hooks/useWallet.ts`):
```tsx
import { BrowserProvider, Contract } from 'ethers';

// Manages wallet connection and contract instance
const { contract, account, isConnected } = useWallet();
```

**Contract Interactions**:
```tsx
// Example: Submit consultation
const tx = await contract.submitConsultation(
  clientId,
  categoryId,
  question,
  { value: parseEther(fee) }
);
await tx.wait();
```

### Smart Contract

**Contract Address**: `0xBA9Daca2dEE126861963cd31752A9aCBc5488Df7`

**Key Functions**:
- `submitConsultation()` - Submit encrypted legal question
- `registerLawyer()` - Register as platform lawyer
- `provideResponse()` - Lawyer provides consultation response
- `getConsultationDetails()` - View consultation information
- `getSystemStats()` - Platform statistics

---

## 🎨 Styling

The application uses:
- **Tailwind CSS** for utility-first styling
- **Custom CSS** for component-specific styles
- **Responsive design** for mobile/desktop support

Key style patterns:
```css
.btn-primary      /* Primary action buttons */
.card             /* Content containers */
.form-group       /* Form input groups */
.stat-card        /* Statistics display cards */
.status           /* Toast notifications */
```

---

## 🔐 Security Features

- **Wallet Connection**: Secure MetaMask integration
- **Network Verification**: Ensures correct blockchain network
- **Input Validation**: Client-side and contract-level validation
- **Error Handling**: Comprehensive error catching and user feedback
- **FHE Encryption**: Ready for encrypted data handling

---

## 🛠️ Development

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

### Type Checking

TypeScript will automatically check types during development.

---

## 📊 Comparison: Static vs React Version

| Feature | Static HTML | React Version |
|---------|-------------|---------------|
| Framework | Vanilla JS | Next.js 14 + React 18 |
| Styling | CSS | Tailwind CSS |
| Type Safety | None | Full TypeScript |
| State Management | DOM manipulation | React Hooks |
| Code Organization | Single files | Component-based |
| Routing | None | Next.js App Router |
| SDK Integration | Manual | Provider pattern |
| Build Process | None | Next.js optimized |
| Performance | Basic | Optimized with SSR |
| Maintainability | Low | High |

---

## 📚 API Reference

### Hooks

#### `useWallet()`
Manages wallet connection and contract instance.

```tsx
const {
  provider,      // ethers.js BrowserProvider
  contract,      // Contract instance
  account,       // Connected wallet address
  isConnected,   // Connection status
  isConnecting,  // Loading state
  error,         // Error message
  connectWallet, // Connect function
  disconnectWallet // Disconnect function
} = useWallet();
```

#### `useFHEContext()`
Access FHE provider context.

```tsx
const {
  isReady,       // FHE initialized
  isInitializing, // Loading state
  error,         // Error message
  instance,      // FHEVM instance
  config,        // FHE configuration
  init           // Initialize function
} = useFHEContext();
```

---

## 🤝 Contributing

Contributions are welcome! Please ensure:
- Code follows TypeScript best practices
- Components are properly typed
- Styles use Tailwind utilities
- Changes are tested with MetaMask

---

## 📄 License

MIT License - see LICENSE file for details.

---

## 🙏 Acknowledgments

- **Zama** - For FHEVM technology and SDK
- **Next.js** - React framework
- **Tailwind CSS** - Utility-first CSS framework
- **ethers.js** - Ethereum library

---

<div align="center">

**Built with Privacy in Mind** 🔐

[⬆ Back to Top](#anonymous-legal-consultation-platform---react-version)

</div>
