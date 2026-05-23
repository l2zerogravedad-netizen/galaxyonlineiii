import type { Metadata } from 'next';
import './globals.css';

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
      <body className="font-sans">{children}</body>
    </html>
  );
}
