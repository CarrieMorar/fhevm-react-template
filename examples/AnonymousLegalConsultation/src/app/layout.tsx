import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { FHEProvider } from '@/components/FHEProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Anonymous Legal Consultation Platform',
  description: 'Secure, Private & Encrypted Legal Consultations on Blockchain',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FHEProvider
          config={{
            chainId: 9000,
            networkName: 'Zama Devnet',
          }}
          autoInit
        >
          {children}
        </FHEProvider>
      </body>
    </html>
  );
}
