'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import GalleryLightbox, { LightboxFoto } from '@/components/GalleryLightbox';

interface Foto {
  id: number;
  titulo: string;
  descripcion: string | null;
  imagen: string;
  thumbnail: string | null;
  categoria: string | null;
  destacado: boolean;
  orden: number;
}

interface Album {
  id: string;
  nombre: string;
  descripcion: string | null;
  fotos: Foto[];
}

function FotoCard({
  foto,
  albumName,
  onClick,
  index,
  preload
}: {
  foto: Foto;
  albumName: string;
  onClick: () => void;
  index: number;
  preload: boolean;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <button
      onClick={onClick}
      aria-label={`Abrir foto ${index + 1} de ${albumName}`}
      className="group relative overflow-hidden rounded-xl bg-gray-100 shadow-sm transition-shadow hover:shadow-lg aspect-square"
    >
      {!loaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}

      <img
        src={foto.imagen}
        alt={foto.descripcion || `${albumName} - Conexión 360`}
        loading={preload ? 'eager' : 'lazy'}
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/40 flex items-center justify-center">
        <svg
          className="h-10 w-10 text-white opacity-0 transition-opacity group-hover:opacity-100 drop-shadow-lg"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
      </div>
    </button>
  );
}

export default function GaleriaPage() {
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ album: Album; index: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/galeria');
        if (!res.ok) throw new Error('No se pudo cargar la galería');
        const data: Foto[] = await res.json();
        setFotos([...data].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)));
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error al cargar');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const albums: Album[] = useMemo(() => {
    const map = new Map<string, Album>();
    fotos.forEach((foto) => {
      const categoria = foto.categoria?.trim() || 'Sin categoría';
      const id = categoria.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
      if (!map.has(id)) {
        map.set(id, { id, nombre: categoria, descripcion: null, fotos: [] });
      }
      map.get(id)!.fotos.push(foto);
    });
    return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [fotos]);

  const totalFotos = fotos.length;

  // IntersectionObserver para resaltar álbum activo en la barra sticky
  useEffect(() => {
    if (albums.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          const id = visible[0].target.id.replace('album-', '');
          setActiveAlbumId(id);
        }
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    albums.forEach((album) => {
      const el = document.getElementById(`album-${album.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [albums]);

  const scrollToAlbum = (id: string) => {
    const el = document.getElementById(`album-${id}`);
    if (!el) return;
    const offset = 140; // navbar + sticky bar
    const y = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  const abrirLightbox = (album: Album, index: number) => {
    setLightbox({ album, index });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero banner */}
      <section className="relative h-60 sm:h-72 overflow-hidden bg-gradient-to-br from-[#031c3b] via-primary to-primary-light flex items-center justify-center">
        <div className="absolute top-8 left-8 w-48 h-48 bg-yellow-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-8 right-8 w-56 h-56 bg-red-400/10 rounded-full blur-3xl" />

        <div className="relative z-10 text-center px-4">
          <nav className="text-white/60 text-sm mb-3">
            <Link href="/" className="hover:text-white">Inicio</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Galería</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white">
            Galería <span className="text-secondary">Fotográfica</span>
          </h1>
          {!loading && (
            <p className="mt-3 text-white/70 text-sm sm:text-base">
              {totalFotos} {totalFotos === 1 ? 'foto' : 'fotos'} en {albums.length}{' '}
              {albums.length === 1 ? 'álbum' : 'álbumes'}
            </p>
          )}
        </div>
      </section>

      {/* Barra navegación rápida sticky */}
      {albums.length > 0 && (
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 overflow-x-auto py-3 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
              {albums.map((album) => {
                const isActive = activeAlbumId === album.id;
                return (
                  <button
                    key={album.id}
                    onClick={() => scrollToAlbum(album.id)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-primary/10 hover:text-primary'
                    }`}
                  >
                    {album.nombre}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Contenido */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-600 py-12">{error}</div>
      ) : albums.length === 0 ? (
        <div className="text-center text-gray-500 py-20">No hay fotos disponibles.</div>
      ) : (
        albums.map((album, albumIdx) => (
          <section
            key={album.id}
            id={`album-${album.id}`}
            className="py-12 sm:py-16 border-b border-gray-100 last:border-0 scroll-mt-32"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#031c3b]">
                    {album.nombre}
                  </h2>
                  {album.descripcion && (
                    <p className="mt-2 text-gray-600 max-w-2xl">{album.descripcion}</p>
                  )}
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {album.fotos.length} {album.fotos.length === 1 ? 'foto' : 'fotos'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {album.fotos.map((foto, i) => (
                  <FotoCard
                    key={foto.id}
                    foto={foto}
                    albumName={album.nombre}
                    index={i}
                    preload={albumIdx === 0 && i < 4}
                    onClick={() => abrirLightbox(album, i)}
                  />
                ))}
              </div>
            </div>
          </section>
        ))
      )}

      {lightbox && (
        <GalleryLightbox
          fotos={lightbox.album.fotos.map<LightboxFoto>((f) => ({
            id: f.id,
            titulo: f.titulo,
            descripcion: f.descripcion,
            imagen: f.imagen
          }))}
          index={lightbox.index}
          albumName={lightbox.album.nombre}
          onClose={() => setLightbox(null)}
          onChange={(i) => setLightbox((prev) => (prev ? { ...prev, index: i } : null))}
        />
      )}
    </div>
  );
}
