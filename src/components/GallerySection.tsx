"use client"
import React, { useState, useEffect, useMemo } from 'react';

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

const GallerySection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState<GalleryImage | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Todas');

  // Cargar imágenes de la galería desde la API
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/galeria');

        if (!response.ok) {
          throw new Error('Error al cargar la galería');
        }

        const data = await response.json();

        // Ordenar por el campo orden
        const sortedImages = [...data].sort((a, b) => a.orden - b.orden);

        setGalleryImages(sortedImages);
        setError(null);
      } catch (err) {
        console.error('Error fetching gallery images:', err);
        setError('No se pudieron cargar las imágenes de la galería');
        setGalleryImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  // Obtener categorías únicas (solo las que tienen al menos una imagen)
  const categorias = useMemo(() => {
    const set = new Set<string>();
    galleryImages.forEach(img => {
      if (img.categoria && img.categoria.trim()) {
        set.add(img.categoria.trim());
      }
    });
    return Array.from(set).sort();
  }, [galleryImages]);

  // Imágenes filtradas según pestaña activa
  const imagenesFiltradas = useMemo(() => {
    if (activeCategory === 'Todas') return galleryImages;
    return galleryImages.filter(img => img.categoria?.trim() === activeCategory);
  }, [galleryImages, activeCategory]);

  // Resetear índice si la categoría cambió
  useEffect(() => {
    setActiveIndex(0);
  }, [activeCategory]);

  const nextSlide = () => {
    if (imagenesFiltradas.length === 0) return;
    setActiveIndex((prevIndex) => (prevIndex + 1) % imagenesFiltradas.length);
  };

  const prevSlide = () => {
    if (imagenesFiltradas.length === 0) return;
    setActiveIndex((prevIndex) => (prevIndex - 1 + imagenesFiltradas.length) % imagenesFiltradas.length);
  };

  const openModal = (slide: GalleryImage) => {
    setActiveSlide(slide);
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalOpen(false);
    document.body.style.overflow = '';
  };

  const nextModalSlide = () => {
    if (activeSlide) {
      const currentIndex = imagenesFiltradas.findIndex(img => img.id === activeSlide.id);
      const nextIndex = (currentIndex + 1) % imagenesFiltradas.length;
      setActiveSlide(imagenesFiltradas[nextIndex]);
    }
  };

  const prevModalSlide = () => {
    if (activeSlide) {
      const currentIndex = imagenesFiltradas.findIndex(img => img.id === activeSlide.id);
      const prevIndex = (currentIndex - 1 + imagenesFiltradas.length) % imagenesFiltradas.length;
      setActiveSlide(imagenesFiltradas[prevIndex]);
    }
  };

  // Autoplay del carrusel
  useEffect(() => {
    if (imagenesFiltradas.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % imagenesFiltradas.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [imagenesFiltradas.length]);

  // Manejo de teclas
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalOpen) {
        closeModal();
      }
      if (modalOpen) {
        if (e.key === 'ArrowLeft') prevModalSlide();
        if (e.key === 'ArrowRight') nextModalSlide();
      } else {
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen, activeSlide, imagenesFiltradas]);

  // Loading state
  if (galleryImages.length === 0 && loading) {
    return (
      <section id="galeria" className="gallery-section">
        <div className="gallery-background"></div>
        <div className="gallery-gradient"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center mb-12 reveal-on-scroll">
            <h2 className="gallery-title">
              <span className="gallery-title-primary">Nuestra</span>
              <span className="gallery-title-secondary">Galería</span>
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">Cargando galería...</p>
          </div>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="galeria" className="gallery-section">
      <div className="gallery-background"></div>
      <div className="gallery-gradient"></div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-8 reveal-on-scroll">
          <h2 className="gallery-title">
            <span className="gallery-title-primary">Nuestra</span>
            <span className="gallery-title-secondary">Galería</span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Explora nuestra colección de momentos memorables y eventos destacados
          </p>
        </div>

        {/* Pestañas de categorías */}
        {categorias.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-10 reveal-on-scroll">
            <button
              onClick={() => setActiveCategory('Todas')}
              className={`px-5 py-2 rounded-full text-sm md:text-base font-medium transition-all duration-300 ${
                activeCategory === 'Todas'
                  ? 'bg-secondary text-primary shadow-lg'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Todas ({galleryImages.length})
            </button>
            {categorias.map(cat => {
              const count = galleryImages.filter(i => i.categoria?.trim() === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-full text-sm md:text-base font-medium transition-all duration-300 ${
                    activeCategory === cat
                      ? 'bg-secondary text-primary shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        )}

        {imagenesFiltradas.length === 0 ? (
          <div className="text-center text-gray-300 py-12">
            No hay imágenes en esta categoría.
          </div>
        ) : (
          <div className="carousel-3d-container reveal-on-scroll">
            <div className="carousel-3d-wrapper">
              <div className="carousel-3d-stage">
                {imagenesFiltradas.map((image, index) => {
                  const position = index - activeIndex;
                  const zIndex = imagenesFiltradas.length - Math.abs(position);
                  const opacity = Math.abs(position) > 2 ? 0 : 1 - Math.abs(position) * 0.3;
                  const translateZ = -Math.abs(position) * 150;
                  const rotateY = position * 45;

                  return (
                    <div
                      key={image.id}
                      className={`carousel-3d-slide ${index === activeIndex ? 'active' : ''}`}
                      style={{
                        transform: `translateZ(${translateZ}px) rotateY(${rotateY}deg)`,
                        opacity,
                        zIndex
                      }}
                      onClick={() => index === activeIndex ? openModal(image) : setActiveIndex(index)}
                    >
                      <div className="carousel-3d-slide-inner">
                        {image.imagen ? (
                          <img
                            src={image.imagen}
                            alt={image.titulo}
                            className="carousel-3d-image"
                          />
                        ) : (
                          <div className="bg-gray-800 h-full w-full flex items-center justify-center text-white">
                            {image.titulo}
                          </div>
                        )}
                        <div className="carousel-3d-overlay">
                          <div className="p-6 absolute bottom-0 w-full">
                            <h3 className="text-xl font-bold text-white">{image.titulo}</h3>
                            {image.descripcion && (
                              <p className="text-gray-200">{image.descripcion}</p>
                            )}
                          </div>
                        </div>
                        <div className="light-effect"></div>
                      </div>
                      <div className="carousel-3d-reflection"></div>
                    </div>
                  );
                })}
              </div>

              <button className="carousel-nav-btn carousel-prev-btn" onClick={prevSlide} aria-label="Imagen anterior">
                &lt;
              </button>
              <button className="carousel-nav-btn carousel-next-btn" onClick={nextSlide} aria-label="Imagen siguiente">
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal para vista ampliada */}
      {modalOpen && activeSlide && (
        <div className="gallery-modal" onClick={closeModal}>
          <div className="gallery-modal-backdrop"></div>
          <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="gallery-modal-close" onClick={closeModal} aria-label="Cerrar vista ampliada">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>

            <button className="modal-nav-btn modal-prev-btn" onClick={prevModalSlide} aria-label="Imagen anterior">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>

            <button className="modal-nav-btn modal-next-btn" onClick={nextModalSlide} aria-label="Imagen siguiente">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>

            <div className="modal-image-container">
              {activeSlide.imagen ? (
                <img src={activeSlide.imagen} alt={activeSlide.titulo} className="modal-image" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white text-xl">
                  {activeSlide.titulo}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default GallerySection;
