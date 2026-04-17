// src/app/admin/musica/editar/[id]/page.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';

interface Genero {
  id: number;
  nombre: string;
}

export default function EditarMusica() {
  const params = useParams();
  const id = params.id;

  const [formData, setFormData] = useState({
    titulo: '',
    artista: '',
    genero_id: '' as string | number,
    orden: '' as string | number,
    destacado: false,
    reproducible_web: true,
    archivo: '',
    imagen_cover: ''
  });

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [previewCover, setPreviewCover] = useState<string | null>(null);
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const router = useRouter();

  // Cargar datos de la canción y géneros
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        const authHeader = { Authorization: `Bearer ${token}` };

        const [songResponse, generosResponse] = await Promise.all([
          fetch(`/api/musica/${id}`, { headers: authHeader }),
          fetch('/api/generos', { headers: authHeader })
        ]);

        if (!songResponse.ok) {
          throw new Error('Error al cargar la canción');
        }

        const song = await songResponse.json();
        setFormData({
          titulo: song.titulo || '',
          artista: song.artista || '',
          genero_id: song.genero_id ?? '',
          orden: song.orden ?? '',
          destacado: !!song.destacado,
          reproducible_web: song.reproducible_web !== false,
          archivo: song.archivo || '',
          imagen_cover: song.imagen_cover || ''
        });

        if (song.imagen_cover) {
          setPreviewCover(song.imagen_cover);
        }

        if (generosResponse.ok) {
          const data = await generosResponse.json();
          setGeneros(data);
        }
      } catch (err: any) {
        console.error('Error fetching musica item:', err);
        setError('No se pudo cargar la canción. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setCoverImage(file);
      setPreviewCover(fileUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');
      setUploadProgress(0);

      let coverUrl = formData.imagen_cover;
      let archivoUrl = formData.archivo;

      // Subir nueva portada si se cambió
      if (coverImage) {
        setUploadProgress(10);
        const formDataCover = new FormData();
        formDataCover.append('file', coverImage);
        formDataCover.append('folder', 'covers');

        const uploadCoverResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: formDataCover
        });

        if (!uploadCoverResponse.ok) {
          throw new Error('Error al subir la imagen de portada');
        }

        const coverData = await uploadCoverResponse.json();
        coverUrl = coverData.url;
        setUploadProgress(40);
      }

      // Subir nuevo audio si se cambió
      if (audioFile) {
        setUploadProgress(50);
        const formDataAudio = new FormData();
        formDataAudio.append('file', audioFile);
        formDataAudio.append('folder', 'musica');

        const uploadAudioResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: formDataAudio
        });

        if (!uploadAudioResponse.ok) {
          throw new Error('Error al subir el archivo de audio');
        }

        const audioData = await uploadAudioResponse.json();
        archivoUrl = audioData.url;
        setUploadProgress(80);
      }

      // Actualizar la canción
      const response = await fetch(`/api/musica/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          titulo: formData.titulo,
          artista: formData.artista,
          archivo: archivoUrl,
          imagen_cover: coverUrl,
          genero_id: formData.genero_id ? parseInt(String(formData.genero_id)) : null,
          destacado: formData.destacado,
          reproducible_web: formData.reproducible_web,
          orden: formData.orden ? parseInt(String(formData.orden)) : null
        })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la canción');
      }

      setUploadProgress(100);
      setSuccess('Canción actualizada correctamente');
      setTimeout(() => {
        router.push('/admin/musica');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar la canción');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Editar Canción</h1>
          <button
            onClick={() => router.push('/admin/musica')}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-300 transition-colors"
          >
            <span className="material-icons-outlined">arrow_back</span>
            <span>Volver</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                    Título de la canción *
                  </label>
                  <input
                    type="text"
                    id="titulo"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="artista" className="block text-sm font-medium text-gray-700 mb-1">
                    Artista
                  </label>
                  <input
                    type="text"
                    id="artista"
                    name="artista"
                    value={formData.artista}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                  />
                </div>

                <div>
                  <label htmlFor="genero_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Género
                  </label>
                  <select
                    id="genero_id"
                    name="genero_id"
                    value={formData.genero_id}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                  >
                    <option value="">Seleccionar género</option>
                    {generos.map(genero => (
                      <option key={genero.id} value={genero.id}>
                        {genero.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="orden" className="block text-sm font-medium text-gray-700 mb-1">
                    Orden (opcional)
                  </label>
                  <input
                    type="number"
                    id="orden"
                    name="orden"
                    min="1"
                    value={formData.orden}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                  />
                </div>

                <div>
                  <label htmlFor="audioFile" className="block text-sm font-medium text-gray-700 mb-1">
                    Archivo de audio MP3
                  </label>
                  <div className="flex items-center">
                    <input
                      type="file"
                      id="audioFile"
                      accept="audio/mp3,audio/mpeg"
                      onChange={handleAudioChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="audioFile"
                      className="bg-gray-100 border border-gray-300 rounded-md px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors inline-block"
                    >
                      Cambiar archivo
                    </label>
                    {audioFile ? (
                      <span className="ml-3 text-sm text-gray-600">{audioFile.name}</span>
                    ) : formData.archivo ? (
                      <span className="ml-3 text-sm text-gray-600 truncate max-w-[200px]">
                        Actual: {formData.archivo.split('/').pop()}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Deja vacío para mantener el archivo actual.
                  </p>
                </div>

                <div>
                  <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-1">
                    Imagen de portada (opcional)
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      id="coverImage"
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="coverImage"
                      className="bg-gray-100 border border-gray-300 rounded-md px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors"
                    >
                      Cambiar imagen
                    </label>
                    {previewCover && (
                      <div className="h-16 w-16 bg-gray-200 rounded overflow-hidden">
                        <img
                          src={previewCover}
                          alt="Vista previa"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="destacado"
                    name="destacado"
                    checked={formData.destacado}
                    onChange={handleChange}
                    className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                  />
                  <label htmlFor="destacado" className="ml-2 block text-sm text-gray-700">
                    Destacar en la página principal
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="reproducible_web"
                    name="reproducible_web"
                    checked={formData.reproducible_web}
                    onChange={handleChange}
                    className="h-4 w-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                  />
                  <label htmlFor="reproducible_web" className="ml-2 block text-sm text-gray-700">
                    Permitir reproducción en la web
                  </label>
                </div>
              </div>

              {saving && uploadProgress > 0 && (
                <div className="mt-6">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-secondary h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {uploadProgress < 100 ? 'Subiendo archivos...' : 'Procesando...'}
                  </p>
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => router.push('/admin/musica')}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-4 hover:bg-gray-300 transition-colors"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary-light transition-colors flex items-center"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
