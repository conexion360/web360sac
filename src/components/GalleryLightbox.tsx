'use client';
import React, { useEffect, useRef } from 'react';

export interface LightboxFoto {
  id: number;
  titulo: string;
  descripcion: string | null;
  imagen: string;
}

interface LightboxProps {
  fotos: LightboxFoto[];
  index: number;
  albumName: string;
  onClose: () => void;
  onChange: (i: number) => void;
}

export default function GalleryLightbox({ fotos, index, albumName, onClose, onChange }: LightboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const foto = fotos[index];

  const goPrev = () => {
    onChange((index - 1 + fotos.length) % fotos.length);
  };

  const goNext = () => {
    onChange((index + 1) % fotos.length);
  };

  // Keyboard navigation + body scroll lock
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [index, fotos.length]);

  // Preload neighbors
  useEffect(() => {
    if (fotos.length <= 1) return;
    const prev = fotos[(index - 1 + fotos.length) % fotos.length];
    const next = fotos[(index + 1) % fotos.length];
    [prev, next].forEach((f) => {
      if (f?.imagen) {
        const img = new Image();
        img.src = f.imagen;
      }
    });
  }, [index, fotos]);

  // Focus trap basic
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  if (!foto) return null;

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Vista ampliada: ${albumName}`}
      tabIndex={-1}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm outline-none"
      onClick={onClose}
    >
      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-1.5 rounded-full text-sm text-white z-10">
        {index + 1} / {fotos.length}
      </div>

      {/* Close */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Cerrar"
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Image */}
      <div className="relative max-w-[95vw] max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <img
          src={foto.imagen}
          alt={foto.descripcion || albumName}
          className="max-h-[75vh] sm:max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl"
        />

        {/* Controls row */}
        <div className="mt-4 flex items-center gap-4 w-full justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Imagen anterior"
            className="w-12 h-12 rounded-full bg-primary/70 hover:bg-primary text-white flex items-center justify-center transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="text-white text-center min-w-0 px-2">
            <p className="font-semibold truncate max-w-[50vw]">{albumName}</p>
            {foto.descripcion && <p className="text-sm text-white/80 truncate max-w-[50vw]">{foto.descripcion}</p>}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Imagen siguiente"
            className="w-12 h-12 rounded-full bg-primary/70 hover:bg-primary text-white flex items-center justify-center transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
