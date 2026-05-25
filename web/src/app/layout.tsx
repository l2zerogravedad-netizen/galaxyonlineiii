import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { Providers } from '@/components/providers/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DESTOCK SPACE - Cliente Web',
  description: 'Cliente web oficial para DESTOCK SPACE - Desarrollado con Cursor',
  keywords: ['destock space', 'space game', 'mmorpg', 'web client', 'cursor'],
  authors: [{ name: 'DESTOCK SPACE Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#1e40af',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
                border: '1px solid #334155',
                borderRadius: '0.5rem',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#1e293b',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#1e293b',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
