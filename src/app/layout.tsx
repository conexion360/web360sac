// src/app/layout.tsx
'use client'
import './globals.css';
import './galeria.css';
import { Inter } from 'next/font/google';
import SiteConfigLoader from '@/components/SiteConfigLoader';
import PublicChrome from '@/components/PublicChrome';

const inter = Inter({ subsets: ['latin'] });

interface LayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="es">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Sitio web oficial de Conexion 360 SAC" />
      </head>
      <body className={inter.className}>
        <SiteConfigLoader />
        <PublicChrome>{children}</PublicChrome>
      </body>
    </html>
  );
}
