// src/app/layout.tsx
'use client'
import './globals.css';
import './galeria.css';
import { Inter } from 'next/font/google';
import NavBar from '@/components/NavBar';
import FooterSection from '@/components/FooterSection';
import SiteConfigLoader from '@/components/SiteConfigLoader';

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
        <NavBar />
        <main>{children}</main>
        <FooterSection />
      </body>
    </html>
  );
}
