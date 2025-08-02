-- setup-imagekit-migration.sql
-- Script para agregar campos de ImageKit a las tablas existentes

-- Agregar campos ImageKit a la tabla hero_slides
ALTER TABLE hero_slides 
ADD COLUMN IF NOT EXISTS imagekit_file_id_desktop VARCHAR(255),
ADD COLUMN IF NOT EXISTS imagekit_file_id_mobile VARCHAR(255);

-- Agregar campos ImageKit a la tabla galeria
ALTER TABLE galeria 
ADD COLUMN IF NOT EXISTS imagekit_file_id VARCHAR(255);

-- Agregar campos ImageKit a la tabla generos
ALTER TABLE generos 
ADD COLUMN IF NOT EXISTS imagekit_file_id VARCHAR(255);

-- Agregar campos ImageKit a la tabla configuracion
ALTER TABLE configuracion 
ADD COLUMN IF NOT EXISTS imagekit_logo_file_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS imagekit_favicon_file_id VARCHAR(255);

-- Agregar campos ImageKit a la tabla sobre_nosotros
ALTER TABLE sobre_nosotros 
ADD COLUMN IF NOT EXISTS imagekit_file_id VARCHAR(255);

-- Agregar campos ImageKit a la tabla musica para covers
ALTER TABLE musica 
ADD COLUMN IF NOT EXISTS imagekit_cover_file_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS imagekit_audio_file_id VARCHAR(255);

-- Índices para mejorar performance en búsquedas por fileId
CREATE INDEX IF NOT EXISTS idx_hero_slides_imagekit_desktop ON hero_slides(imagekit_file_id_desktop);
CREATE INDEX IF NOT EXISTS idx_hero_slides_imagekit_mobile ON hero_slides(imagekit_file_id_mobile);
CREATE INDEX IF NOT EXISTS idx_galeria_imagekit ON galeria(imagekit_file_id);
CREATE INDEX IF NOT EXISTS idx_generos_imagekit ON generos(imagekit_file_id);
CREATE INDEX IF NOT EXISTS idx_musica_imagekit_cover ON musica(imagekit_cover_file_id);
CREATE INDEX IF NOT EXISTS idx_musica_imagekit_audio ON musica(imagekit_audio_file_id);

-- Comentarios para documentar los campos
COMMENT ON COLUMN hero_slides.imagekit_file_id_desktop IS 'ID del archivo en ImageKit para imagen desktop';
COMMENT ON COLUMN hero_slides.imagekit_file_id_mobile IS 'ID del archivo en ImageKit para imagen mobile';
COMMENT ON COLUMN galeria.imagekit_file_id IS 'ID del archivo en ImageKit para imagen de galería';
COMMENT ON COLUMN generos.imagekit_file_id IS 'ID del archivo en ImageKit para imagen de género';
COMMENT ON COLUMN musica.imagekit_cover_file_id IS 'ID del archivo en ImageKit para cover de música';
COMMENT ON COLUMN musica.imagekit_audio_file_id IS 'ID del archivo en ImageKit para archivo de audio';
COMMENT ON COLUMN configuracion.imagekit_logo_file_id IS 'ID del archivo en ImageKit para logo del sitio';
COMMENT ON COLUMN configuracion.imagekit_favicon_file_id IS 'ID del archivo en ImageKit para favicon del sitio';
COMMENT ON COLUMN sobre_nosotros.imagekit_file_id IS 'ID del archivo en ImageKit para imagen de sobre nosotros';