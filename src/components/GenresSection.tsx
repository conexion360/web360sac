// src/components/GenresSection.tsx
"use client"
import React, { useState, useEffect } from 'react';

interface Genre {
  id: number;
  nombre: string;
  descripcion: string | null;
  imagen: string;
  icono: string | null;
  orden: number;
  activo: boolean;
}

const GenresSection: React.FC = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar los géneros desde la API
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/generos');

        if (!response.ok) {
          throw new Error('Error al cargar los géneros musicales');
        }

        const data = await response.json();

        // Filtrar solo los géneros activos y ordenar por el campo orden
        const activeGenres = data
          .filter((genre: Genre) => genre.activo)
          .sort((a: Genre, b: Genre) => a.orden - b.orden);

        setGenres(activeGenres);
        setError(null);
      } catch (err) {
        console.error('Error fetching genres:', err);
        setError('No se pudieron cargar los géneros musicales');

        // Datos de respaldo en caso de error
        setGenres([
          {
            id: 1,
            nombre: 'Rock',
            descripcion: 'Conciertos y festivales de Rock',
            imagen: '',
            icono: 'music_note',
            orden: 1,
            activo: true
          },
          {
            id: 2,
            nombre: 'Cumbia',
            descripcion: 'Eventos y giras de Cumbia.',
            imagen: '',
            icono: 'music_note',
            orden: 2,
            activo: true
          },
          {
            id: 3,
            nombre: 'Salsa',
            descripcion: 'Salsa con los mejores.',
            imagen: '',
            icono: 'music_note',
            orden: 3,
            activo: true
          },
          {
            id: 4,
            nombre: 'Folklore - Andino',
            descripcion: 'Festivales de música tradicional peruana.',
            imagen: '',
            icono: 'music_note',
            orden: 4,
            activo: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  // Función para obtener el emoji según el nombre del género
  const getEmoji = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('rock')) return '🎸';
    if (lowerName.includes('cumbia')) return '💃';
    if (lowerName.includes('salsa')) return '🎺';
    if (lowerName.includes('folklore') || lowerName.includes('andino')) return '🪘';
    return '🎵'; // Emoji por defecto
  };

  // Función para obtener la URL de la imagen o retornar null si no existe
  const getImageUrl = (imagen: string) => {
    if (imagen && imagen !== '') {
      return imagen;
    }
    return null;
  };

  return (
    <section id="generos" className="relative py-32 overflow-hidden">
      {/* Background con gradiente y efectos */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary to-primary-dark">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,205,208,0.1),transparent_70%)]"></div>
      </div>

      <div className="relative container mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <h2 className="inline-block relative text-4xl font-bold mb-4 reveal-on-scroll">
            <span className="text-white">Géneros</span>
            <span className="text-secondary ml-2">Musicales</span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto mt-6 reveal-on-scroll">
            Nos especializamos en la producción de eventos de diversos géneros musicales,
            ofreciendo experiencias únicas para cada estilo.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
          </div>
        ) : genres.length === 0 ? (
          <div className="text-center text-gray-300">
            No hay géneros musicales disponibles en este momento.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {genres.map((genre) => (
              <div
                key={genre.id}
                className="reveal-on-scroll"
              >
                <div className="group relative rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-500 hover:scale-105">
                  {/* Card Background */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {getImageUrl(genre.imagen) ? (
                      <img
                        src={getImageUrl(genre.imagen) || ''}
                        alt={genre.nombre}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback si la imagen falla
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentNode as HTMLElement;
                          parent.classList.add('bg-primary-dark', 'flex', 'items-center', 'justify-center');
                          const emoji = document.createElement('div');
                          emoji.className = 'text-6xl mb-4';
                          emoji.textContent = getEmoji(genre.nombre);
                          parent.appendChild(emoji);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-primary-dark flex items-center justify-center">
                        <div className="text-6xl mb-4">{getEmoji(genre.nombre)}</div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>
                  </div>

                  {/* Content */}
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{genre.nombre}</h3>
                    <p className="text-gray-300 text-sm transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      {genre.descripcion || `Eventos y producciones de ${genre.nombre}`}
                    </p>
                    <a
                      href="#contacto"
                      className="inline-block mt-4 text-secondary hover:text-white transition-colors duration-300 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                    >
                      Organizar evento →
                    </a>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default GenresSection;