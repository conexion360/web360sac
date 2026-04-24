// src/components/HeroSection.tsx
'use client';
import React, { useState, useEffect } from 'react';
import HeroSlider from './HeroSlider';
import HeroSliderSkeleton from './HeroSliderSkeleton';
import type { HeroSlide } from '@/types/hero';

interface ApiHeroSlide {
  id: number;
  titulo: string;
  descripcion: string | null;
  imagen_desktop: string;
  imagen_mobile: string | null;
  orden: number;
  activo: boolean;
}

const HeroSection: React.FC = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/api/hero');
        if (!response.ok) throw new Error('Error al cargar los slides');
        const data: ApiHeroSlide[] = await response.json();

        // Mapear a la estructura que espera HeroSlider
        const mapped: HeroSlide[] = data.map((s) => ({
          id: String(s.id),
          imageUrl: s.imagen_desktop,
          mobileImageUrl: s.imagen_mobile ?? null,
          title: s.titulo,
          subtitle: s.descripcion ?? '',
          linkUrl: null,
          order: s.orden,
          active: s.activo,
        }));

        setSlides(mapped);
      } catch (err) {
        console.error('Error fetching hero slides:', err);
        setSlides([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <HeroSliderSkeleton />;
  if (slides.length === 0) return null;

  return <HeroSlider slides={slides} autoPlayInterval={6000} />;
};

export default HeroSection;
