'use client';
import { useEffect } from 'react';

export default function SiteConfigLoader() {
  useEffect(() => {
    fetch('/api/configuracion')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;

        if (data.nombre_sitio) {
          document.title = data.nombre_sitio;
        }

        if (data.favicon) {
          document.querySelectorAll('link[rel*="icon"]').forEach((el) => el.remove());
          const formats: { rel: string; sizes?: string }[] = [
            { rel: 'icon', sizes: '32x32' },
            { rel: 'shortcut icon' },
            { rel: 'apple-touch-icon' },
          ];
          formats.forEach((f) => {
            const link = document.createElement('link');
            link.rel = f.rel;
            if (f.sizes) link.setAttribute('sizes', f.sizes);
            link.href = data.favicon;
            document.head.appendChild(link);
          });
        }
      })
      .catch((err) => console.error('Error cargando configuracion:', err));
  }, []);

  return null;
}
