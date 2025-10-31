import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { FhevmProvider } from '@fhevm/sdk/react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FHEVM Legal Consultation Example',
  description: 'Next.js example showcasing FHEVM SDK integration with Anonymous Legal Consultation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FhevmProvider
          config={{
            chainId: 9000,
            networkName: 'Zama Devnet',
            rpcUrl: 'https://devnet.zama.ai',
          }}
          autoInit
        >
          {children}
        </FhevmProvider>
      </body>
    </html>
  );
}
