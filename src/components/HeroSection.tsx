// src/components/HeroSection.tsx
"use client"
import React, { useState, useEffect } from 'react';
import { useImageKitUrl } from './ImageKitImage';

interface HeroSlide {
  id: number;
  titulo: string;
  descripcion: string | null;
  imagen_desktop: string;
  imagen_mobile: string;
  orden: number;
  activo: boolean;
}

const HeroSection: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { generateUrl } = useImageKitUrl();

  // Detectar mobile
  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    const t = setTimeout(() => setIsLoaded(true), 150);
    return () => {
      window.removeEventListener('resize', checkIsMobile);
      clearTimeout(t);
    };
  }, []);

  // Cargar slides
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/api/hero');
        if (!response.ok) throw new Error('Error al cargar los slides');
        const data = await response.json();
        const active = data
          .filter((s: HeroSlide) => s.activo)
          .sort((a: HeroSlide, b: HeroSlide) => a.orden - b.orden);
        setSlides(active);
      } catch (err) {
        console.error('Error fetching hero slides:', err);
        setSlides([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getOptimizedImageUrl = (imageUrl: string, mobile: boolean) => {
    if (!imageUrl) return '';
    return generateUrl(imageUrl, {
      width: mobile ? 828 : 1920,
      height: mobile ? 1472 : 1080,
      quality: 85,
      format: 'webp',
      crop: 'maintain_ratio',
    });
  };

  // Autoplay
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (idx: number) => setCurrentSlide(idx);
  const nextSlide = () => setCurrentSlide((p) => (p + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((p) => (p - 1 + slides.length) % slides.length);

  if (loading) {
    return (
      <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary-dark">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-secondary"></div>
      </section>
    );
  }

  return (
    <section id="inicio" className="relative min-h-screen w-full overflow-hidden bg-primary-dark">
      {/* Fondo - imágenes con Ken Burns */}
      <div className="absolute inset-0 z-0">
        {slides.length > 0 ? (
          slides.map((slide, idx) => {
            const imageUrl = isMobile ? slide.imagen_mobile : slide.imagen_desktop;
            const optimizedUrl = getOptimizedImageUrl(imageUrl, isMobile);
            const isActive = idx === currentSlide;

            return (
              <div
                key={slide.id}
                className="absolute inset-0 transition-opacity duration-[1500ms] ease-in-out"
                style={{ opacity: isActive ? 1 : 0, zIndex: isActive ? 1 : 0 }}
                aria-hidden={!isActive}
              >
                {optimizedUrl && (
                  <div
                    className={`absolute inset-0 w-full h-full bg-center bg-cover ${isActive ? 'hero-kenburns' : ''}`}
                    style={{ backgroundImage: `url(${optimizedUrl})` }}
                  />
                )}
              </div>
            );
          })
        ) : null}

        {/* Overlay gradient: oscuro abajo y a la izquierda para legibilidad del texto */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary-dark/60 to-transparent" />
        <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-primary-dark/85 via-primary-dark/40 to-transparent" />
        <div className="md:hidden absolute inset-0 bg-primary-dark/40" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 min-h-screen flex flex-col justify-end md:justify-center">
        <div className="container mx-auto px-5 sm:px-8 lg:px-12 pb-20 md:pb-0 pt-28 md:pt-24">
          <div
            className={`max-w-3xl transition-all duration-1000 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            {/* Etiqueta */}
            <div
              className={`inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full border border-secondary/40 bg-secondary/10 backdrop-blur-sm transition-all duration-700 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold text-secondary tracking-wide uppercase">
                Productora de eventos
              </span>
            </div>

            {/* Título */}
            <h1
              className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] text-white mb-5 transition-all duration-1000 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              CONEXIÓN <span className="text-secondary">360</span>
              <span className="block text-xl sm:text-2xl md:text-3xl font-semibold text-gray-200 mt-3">
                Creamos experiencias inolvidables
              </span>
            </h1>

            {/* Descripción */}
            <p
              className={`text-gray-200/90 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mb-8 transition-all duration-1000 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: '400ms' }}
            >
              Líderes en la producción y organización de eventos de Rock, Cumbia, Salsa, Folklore y más.
              Convierte tu evento en una experiencia inolvidable con nosotros.
            </p>

            {/* Botones */}
            <div
              className={`flex flex-col sm:flex-row gap-3 sm:gap-4 mb-10 transition-all duration-1000 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: '600ms' }}
            >
              <a
                href="#contacto"
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-secondary text-primary-dark font-bold shadow-lg hover:bg-secondary-light hover:-translate-y-0.5 transition-all duration-300"
              >
                <span>CONTÁCTANOS</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href="#nosotros"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border-2 border-white/30 text-white font-bold backdrop-blur-sm hover:bg-white/10 hover:border-white/60 transition-all duration-300"
              >
                CONOCE MÁS
              </a>
            </div>

            {/* Géneros */}
            <div
              className={`flex flex-wrap gap-2 sm:gap-3 transition-all duration-1000 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ transitionDelay: '800ms' }}
            >
              {[
                { emoji: '🎸', name: 'Rock' },
                { emoji: '💃', name: 'Cumbia' },
                { emoji: '🎺', name: 'Salsa' },
                { emoji: '🪘', name: 'Folklore' },
              ].map((g) => (
                <div
                  key={g.name}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 hover:bg-white/20 hover:border-secondary/40 transition-all"
                >
                  <span className="text-base">{g.emoji}</span>
                  <span className="text-sm font-medium text-white">{g.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Controles del carrusel */}
        {slides.length > 1 && (
          <>
            {/* Flechas (desktop) */}
            <button
              onClick={prevSlide}
              aria-label="Slide anterior"
              className="hidden md:flex absolute left-6 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-secondary hover:text-primary-dark text-white backdrop-blur-sm items-center justify-center transition-all border border-white/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              aria-label="Slide siguiente"
              className="hidden md:flex absolute right-6 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-secondary hover:text-primary-dark text-white backdrop-blur-sm items-center justify-center transition-all border border-white/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Indicadores (puntos) */}
            <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  aria-label={`Ir al slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    idx === currentSlide ? 'w-10 bg-secondary' : 'w-6 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
