'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function SiteConfigLoader() {
  const pathname = usePathname();

  useEffect(() => {
    // No ejecutar en rutas de admin
    if (pathname?.startsWith('/admin')) return;

    fetch('/api/configuracion')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;

        if (data.nombre_sitio) {
          document.title = data.nombre_sitio;
        }

        if (data.favicon) {
          // Solo actualizar el href del icon existente, no eliminar/crear nodos
          const existing = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
          if (existing) {
            existing.href = data.favicon;
          }
        }
      })
      .catch((err) => console.error('Error cargando configuracion:', err));
  }, [pathname]);

  return null;
}
