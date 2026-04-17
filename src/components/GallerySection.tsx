"use client"
import React, { useState, useEffect, useMemo } from 'react';
import GalleryLightbox, { LightboxFoto } from './GalleryLightbox';

interface GalleryImage {
  id: number;
  titulo: string;
  descripcion: string | null;
  imagen: string;
  thumbnail: string | null;
  categoria: string | null;
  destacado: boolean;
  orden: number;
}

const PAGE_SIZE = 4;

const GallerySection: React.FC = () => {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [pageIndex, setPageIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/galeria');
        if (!res.ok) throw new Error('Error al cargar la galería');
        const data: GalleryImage[] = await res.json();
        setGalleryImages([...data].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)));
        setError(null);
      } catch (err: any) {
        console.error('Error fetching gallery images:', err);
        setError('No se pudieron cargar las imágenes de la galería');
        setGalleryImages([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Categorías únicas (álbumes)
  const categorias = useMemo(() => {
    const set = new Set<string>();
    galleryImages.forEach((img) => {
      const cat = img.categoria?.trim();
      if (cat) set.add(cat);
    });
    return Array.from(set).sort();
  }, [galleryImages]);

  // Seleccionar primera categoría por defecto
  useEffect(() => {
    if (!activeCategory && categorias.length > 0) {
      setActiveCategory(categorias[0]);
    }
  }, [categorias, activeCategory]);

  // Fotos del álbum activo
  const fotosAlbum = useMemo(() => {
    if (!activeCategory) return [];
    return galleryImages.filter((img) => img.categoria?.trim() === activeCategory);
  }, [galleryImages, activeCategory]);

  // Al cambiar de álbum, volver a página 0
  useEffect(() => {
    setPageIndex(0);
  }, [activeCategory]);

  const totalPages = Math.max(1, Math.ceil(fotosAlbum.length / PAGE_SIZE));
  const currentPage = pageIndex % totalPages;
  const visibleFotos = fotosAlbum.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  const nextPage = () => setPageIndex((p) => (p + 1) % totalPages);
  const prevPage = () => setPageIndex((p) => (p - 1 + totalPages) % totalPages);

  const openLightbox = (indexInPage: number) => {
    const absoluteIndex = currentPage * PAGE_SIZE + indexInPage;
    setLightboxIndex(absoluteIndex);
  };

  // Loading state
  if (loading && galleryImages.length === 0) {
    return (
      <section id="galeria" className="relative py-20 bg-primary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold">
              <span className="text-white">Nuestra </span>
              <span className="text-secondary">Galería</span>
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto mt-4">Cargando galería...</p>
          </div>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="galeria" className="relative py-20 bg-primary overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Título */}
        <div className="text-center mb-10 reveal-on-scroll">
          <h2 className="text-4xl md:text-5xl font-extrabold">
            <span className="text-white">Nuestra </span>
            <span className="text-secondary">Galería</span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto mt-4">
            Explora nuestra colección de momentos memorables y eventos destacados
          </p>
        </div>

        {/* Pestañas de álbumes */}
        {categorias.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-10 reveal-on-scroll">
            {categorias.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-3 rounded-xl text-sm md:text-base font-bold transition-all duration-300 min-w-[140px] text-center leading-tight shadow-md ${
                    isActive
                      ? 'bg-secondary text-[#031c3b] shadow-glow'
                      : 'bg-white/90 text-[#031c3b] hover:bg-secondary/20 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Grid de fotos con flechas */}
        {fotosAlbum.length === 0 ? (
          <div className="text-center text-gray-300 py-12">
            No hay imágenes en este álbum.
          </div>
        ) : (
          <div className="relative reveal-on-scroll">
            {/* Flecha izquierda */}
            {fotosAlbum.length > PAGE_SIZE && (
              <button
                onClick={prevPage}
                aria-label="Anterior"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-6 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary-light/80 hover:bg-secondary text-white flex items-center justify-center transition-all shadow-lg"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Grid 4 columnas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {visibleFotos.map((foto, idx) => (
                <button
                  key={foto.id}
                  onClick={() => openLightbox(idx)}
                  aria-label={`Abrir foto ${idx + 1} de ${activeCategory}`}
                  className="group relative overflow-hidden rounded-xl bg-gray-200 aspect-square shadow-lg hover:shadow-2xl transition-all"
                >
                  <img
                    src={foto.imagen}
                    alt={foto.descripcion || activeCategory}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                    <svg
                      className="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </button>
              ))}
              {/* Relleno si la última página tiene menos fotos, para mantener el grid alineado */}
              {Array.from({ length: Math.max(0, PAGE_SIZE - visibleFotos.length) }).map((_, i) => (
                <div key={`ph-${i}`} className="hidden md:block aspect-square" />
              ))}
            </div>

            {/* Flecha derecha */}
            {fotosAlbum.length > PAGE_SIZE && (
              <button
                onClick={nextPage}
                aria-label="Siguiente"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-6 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary-light/80 hover:bg-secondary text-white flex items-center justify-center transition-all shadow-lg"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Indicador de página */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPageIndex(i)}
                    aria-label={`Ir a página ${i + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      i === currentPage ? 'w-8 bg-secondary' : 'w-2 bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Botón ver galería completa */}
        <div className="mt-12 text-center reveal-on-scroll">
          <a
            href="/galeria"
            className="inline-flex items-center gap-2 rounded-full bg-secondary px-8 py-3 text-sm font-bold text-[#031c3b] transition-all hover:bg-secondary-light hover:-translate-y-0.5 shadow-lg"
          >
            Ver galería completa
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <GalleryLightbox
          fotos={fotosAlbum.map<LightboxFoto>((f) => ({
            id: f.id,
            titulo: f.titulo,
            descripcion: f.descripcion,
            imagen: f.imagen,
          }))}
          index={lightboxIndex}
          albumName={activeCategory}
          onClose={() => setLightboxIndex(null)}
          onChange={(i) => setLightboxIndex(i)}
        />
      )}
    </section>
  );
};

export default GallerySection;
