// src/components/HeroSlider.tsx
'use client';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import type { HeroSlide } from '@/types/hero';
import { useAutoPlay } from '@/hooks/useAutoPlay';
import { useImageKitUrl } from './ImageKitImage';

interface HeroSliderProps {
  slides: HeroSlide[];
  autoPlayInterval?: number;
}

function ChevronLeft({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRight({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default function HeroSlider({ slides, autoPlayInterval = 6000 }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { generateUrl } = useImageKitUrl();

  // Ordenar y filtrar slides (activos + por order)
  const orderedSlides = useMemo(() => {
    return [...slides].filter((s) => s.active).sort((a, b) => a.order - b.order);
  }, [slides]);

  const totalSlides = orderedSlides.length;

  // Detectar viewport mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Detectar prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Ir al siguiente / anterior
  const goNext = useCallback(() => {
    setCurrentIndex((p) => (p + 1) % totalSlides);
  }, [totalSlides]);

  const goPrev = useCallback(() => {
    setCurrentIndex((p) => (p - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goTo = useCallback((idx: number) => {
    setCurrentIndex(idx);
  }, []);

  // Auto-play
  useAutoPlay({
    enabled: totalSlides > 1 && !prefersReducedMotion,
    interval: autoPlayInterval,
    onTick: goNext,
    paused: isHovered,
  });

  // Navegación por teclado
  useEffect(() => {
    const el = containerRef.current;
    if (!el || totalSlides <= 1) return;

    const handleKey = (e: KeyboardEvent) => {
      if (document.activeElement && el.contains(document.activeElement)) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          goPrev();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          goNext();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, totalSlides]);

  // Precargar siguiente slide a los 4s
  useEffect(() => {
    if (totalSlides <= 1) return;
    const nextIdx = (currentIndex + 1) % totalSlides;
    const nextSlide = orderedSlides[nextIdx];
    if (!nextSlide) return;

    const timer = setTimeout(() => {
      const url = isMobile && nextSlide.mobileImageUrl ? nextSlide.mobileImageUrl : nextSlide.imageUrl;
      if (url) {
        const img = new Image();
        img.src = optimize(url, isMobile);
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [currentIndex, orderedSlides, isMobile, totalSlides]);

  function optimize(url: string, mobile: boolean): string {
    if (!url) return '';
    return generateUrl(url, {
      width: mobile ? 800 : 1900,
      height: mobile ? 800 : 600,
      quality: 85,
      format: 'webp',
      crop: 'maintain_ratio',
    });
  }

  if (totalSlides === 0) return null;

  const transitionClass = prefersReducedMotion
    ? 'transition-none'
    : 'transition-opacity duration-500 ease-in-out';

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden bg-black"
      style={{
        aspectRatio: isMobile ? '1 / 1' : '19 / 6',
        minHeight: isMobile ? undefined : 400,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Hero slider"
      tabIndex={0}
    >
      {/* Slides */}
      {orderedSlides.map((slide, idx) => {
        const isActive = idx === currentIndex;
        const isFirst = idx === 0;
        const imgSrc = isMobile && slide.mobileImageUrl ? slide.mobileImageUrl : slide.imageUrl;
        const optimizedSrc = optimize(imgSrc, isMobile);

        const imgEl = (
          <img
            src={optimizedSrc}
            alt={slide.title}
            loading={isActive ? 'eager' : 'lazy'}
            fetchPriority={isFirst ? 'high' : 'auto'}
            decoding="async"
            sizes="100vw"
            className="absolute inset-0 w-full h-full object-cover"
          />
        );

        const content = (
          <>
            {imgEl}
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />

            {/* Text overlay */}
            <div
              className={`absolute inset-x-0 bottom-0 px-6 md:px-16 pb-16 md:pb-24 text-white ${
                isMobile ? 'text-center' : 'text-left'
              }`}
            >
              <h2 className="text-3xl md:text-6xl font-bold drop-shadow-lg leading-tight">
                {slide.title}
              </h2>
              {slide.subtitle && (
                <p className="text-base md:text-xl text-white/90 mt-2 md:mt-3 drop-shadow-md max-w-2xl">
                  {slide.subtitle}
                </p>
              )}
            </div>
          </>
        );

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 ${transitionClass}`}
            style={{
              opacity: isActive ? 1 : 0,
              zIndex: isActive ? 1 : 0,
              pointerEvents: isActive ? 'auto' : 'none',
            }}
            aria-hidden={!isActive}
            aria-live={isActive ? 'polite' : 'off'}
          >
            {slide.linkUrl ? (
              <Link href={slide.linkUrl} className="block absolute inset-0 cursor-pointer">
                {content}
              </Link>
            ) : (
              content
            )}
          </div>
        );
      })}

      {/* Flechas (solo desktop) */}
      {totalSlides > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Slide anterior"
            className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-[4%] z-10 w-12 h-12 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 hover:scale-110 transition-all duration-300"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Slide siguiente"
            className="hidden md:flex absolute top-1/2 -translate-y-1/2 right-[4%] z-10 w-12 h-12 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 hover:scale-110 transition-all duration-300"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots indicators */}
          <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {orderedSlides.map((_, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goTo(idx)}
                  aria-label={`Ir al slide ${idx + 1}`}
                  aria-current={isActive ? 'true' : 'false'}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isActive ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
