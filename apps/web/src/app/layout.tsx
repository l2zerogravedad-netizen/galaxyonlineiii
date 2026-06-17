import type { Metadata } from 'next';
import './globals.css';
import '@/lib/apiBase';
import PostHogProvider from '@/components/PostHogProvider';

export const metadata: Metadata = {
  title: 'Galaxy Online III',
  description: 'Un juego de estrategia espacial 4X',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="font-sans">
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
