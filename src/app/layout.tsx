// src/app/layout.tsx - Server Component
import './globals.css';
import './galeria.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import SiteConfigLoader from '@/components/SiteConfigLoader';
import PublicChrome from '@/components/PublicChrome';
import { db } from '@/lib/db';

const inter = Inter({ subsets: ['latin'] });

async function getSiteConfig() {
  try {
    const result = await db.query('SELECT nombre_sitio, favicon, logo FROM configuracion LIMIT 1');
    return result.rows[0] || null;
  } catch (err) {
    console.error('Error cargando configuracion en layout:', err);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();

  const title = config?.nombre_sitio || 'Conexión 360 SAC';
  const favicon = config?.favicon || '/favicon.ico';

  return {
    title,
    description: `Sitio web oficial de ${config?.nombre_sitio || 'Conexión 360 SAC'}`,
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <SiteConfigLoader />
        <PublicChrome>{children}</PublicChrome>
      </body>
    </html>
  );
}
