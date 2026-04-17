// src/app/admin/galeria/editar/[id]/page.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';

export default function EditarImagenGaleria() {
  const params = useParams();
  const id = params.id;

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    orden: 1,
    destacado: false,
    imagen: '',
    thumbnail: ''
  });

  const [imagen, setImagen] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [mostrarNuevaCategoria, setMostrarNuevaCategoria] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const router = useRouter();

  // Cargar datos del item y categorías
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem('adminToken');
        const authHeader = { Authorization: `Bearer ${token}` };

        const [itemResponse, listResponse] = await Promise.all([
          fetch(`/api/galeria/${id}`, { headers: authHeader }),
          fetch('/api/galeria', { headers: authHeader })
        ]);

        if (!itemResponse.ok) {
          throw new Error('Error al cargar la imagen');
        }

        const item = await itemResponse.json();
        setFormData({
          titulo: item.titulo || '',
          descripcion: item.descripcion || '',
          categoria: item.categoria || '',
          orden: item.orden || 1,
          destacado: !!item.destacado,
          imagen: item.imagen || '',
          thumbnail: item.thumbnail || ''
        });

        if (item.imagen) {
          setPreview(item.imagen);
        }

        if (listResponse.ok) {
          const data = await listResponse.json();
          const uniqueCategorias = Array.from(
            new Set(data.map((it: any) => it.categoria).filter(Boolean))
          ) as string[];
          setCategorias(uniqueCategorias);
        }
      } catch (err: any) {
        console.error('Error fetching galeria item:', err);
        setError('No se pudo cargar la imagen. Por favor, intenta de nuevo.');
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setImagen(file);
      setPreview(fileUrl);
    }
  };

  const handleAddCategoria = () => {
    if (nuevaCategoria.trim() && !categorias.includes(nuevaCategoria.trim())) {
      setCategorias([...categorias, nuevaCategoria.trim()]);
      setFormData(prev => ({ ...prev, categoria: nuevaCategoria.trim() }));
      setNuevaCategoria('');
      setMostrarNuevaCategoria(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');

      const updateData: any = { ...formData };

      // Subir nueva imagen si el usuario la cambió
      if (imagen) {
        const uploadForm = new FormData();
        uploadForm.append('file', imagen);
        uploadForm.append('folder', 'galeria');

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: uploadForm
        });

        if (!uploadResponse.ok) {
          throw new Error('Error al subir la imagen');
        }

        const uploadData = await uploadResponse.json();
        updateData.imagen = uploadData.url;
        updateData.thumbnail = uploadData.url;
      }

      const response = await fetch(`/api/galeria/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la imagen');
      }

      setSuccess('Imagen actualizada correctamente');
      setTimeout(() => {
        router.push('/admin/galeria');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar la imagen');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Editar Imagen de Galería</h1>
          <button
            onClick={() => router.push('/admin/galeria')}
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
                    Título
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
                  <label htmlFor="orden" className="block text-sm font-medium text-gray-700 mb-1">
                    Orden
                  </label>
                  <input
                    type="number"
                    id="orden"
                    name="orden"
                    min="1"
                    value={formData.orden}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción (opcional)
                  </label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                  />
                </div>

                <div>
                  <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <div className="flex items-center space-x-2">
                    {!mostrarNuevaCategoria ? (
                      <>
                        <select
                          id="categoria"
                          name="categoria"
                          value={formData.categoria}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                        >
                          <option value="">Seleccionar categoría</option>
                          {categorias.map(cat => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setMostrarNuevaCategoria(true)}
                          className="bg-gray-100 p-2 rounded-md text-gray-600 hover:bg-gray-200"
                        >
                          <span className="material-icons-outlined">add</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={nuevaCategoria}
                          onChange={(e) => setNuevaCategoria(e.target.value)}
                          placeholder="Nueva categoría"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                        />
                        <button
                          type="button"
                          onClick={handleAddCategoria}
                          className="bg-secondary p-2 rounded-md text-white hover:bg-secondary-light"
                        >
                          <span className="material-icons-outlined">check</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setMostrarNuevaCategoria(false)}
                          className="bg-gray-100 p-2 rounded-md text-gray-600 hover:bg-gray-200"
                        >
                          <span className="material-icons-outlined">close</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div>
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
                      Destacar en la galería
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="imagen" className="block text-sm font-medium text-gray-700 mb-1">
                    Imagen
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      id="imagen"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="imagen"
                      className="bg-gray-100 border border-gray-300 rounded-md px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors"
                    >
                      Cambiar imagen
                    </label>
                    {preview && (
                      <div className="h-24 w-24 bg-gray-200 rounded overflow-hidden">
                        <img
                          src={preview}
                          alt="Vista previa"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Tamaño recomendado: 1200x800px. Deja vacío para mantener la imagen actual.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => router.push('/admin/galeria')}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-4 hover:bg-gray-300 transition-colors"
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
