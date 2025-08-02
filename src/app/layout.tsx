// src/app/layout.tsx
'use client'
import './globals.css';
import './galeria.css';
import { useState, useEffect } from 'react';
import { Inter } from 'next/font/google';
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

        {/* Favicon dinámico */}
        {configuracion?.favicon && (
          <link rel="icon" href={configuracion.favicon} />
        )}

        {/* Meta descripción */}
        <meta name="description" content={
          configuracion?.nombre_sitio
            ? `Sitio web oficial de ${configuracion.nombre_sitio}`
            : "Sitio web oficial de Conexion 360 SAC"
        } />
      </head>
      <body className={inter.className}>
        <NavBar />
        <main>{children}</main>
        <FooterSection />
      </body>
    </html>
  );
}