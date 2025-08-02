// src/app/layout.tsx
'use client'
import './globals.css';
import './galeria.css';
import { useState, useEffect } from 'react';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import NavBar from '@/components/NavBar';
import FooterSection from '@/components/FooterSection';

const inter = Inter({ subsets: ['latin'] });

interface LayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  const [configuracion, setConfiguracion] = useState<any>(null);

  // Cargar la configuración del sitio
  useEffect(() => {
    const fetchConfiguracion = async () => {
      try {
        const response = await fetch('/api/configuracion');
        if (response.ok) {
          const data = await response.json();
          setConfiguracion(data);

          // Establecer el título de la página
          if (data.nombre_sitio) {
            document.title = data.nombre_sitio;
          }
        }
      } catch (error) {
        console.error('Error al cargar la configuración:', error);
      }
    };

    fetchConfiguracion();
  }, []);

  return (
    <html lang="es">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />

        {/* Favicon estático como fallback */}
        <link rel="icon" href="/favicon.ico" />

        {/* Meta descripción */}
        <meta name="description" content={
          configuracion?.nombre_sitio
            ? `Sitio web oficial de ${configuracion.nombre_sitio}`
            : "Sitio web oficial de Conexion 360 SAC"
        } />

        {/* Script para gestionar el favicon de forma independiente */}
        <Script src="/favicon.js" strategy="beforeInteractive" />
      </head>
      <body className={inter.className}>
        <NavBar />
        <main>{children}</main>
        <FooterSection />
      </body>
    </html>
  );
}