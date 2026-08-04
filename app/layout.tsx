import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SI-RUANG | Sistem Informasi Peminjaman Ruangan',
  description: 'Sistem Informasi Manajemen & Peminjaman Ruangan Kampus Terpadu',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} antialiased transition-colors duration-200`}>
        {children}
      </body>
    </html>
  );
}
