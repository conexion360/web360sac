// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, chmod } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync, statSync, readdirSync } from 'fs';
import { verifyAuth } from '@/lib/auth';
import sharp from 'sharp'; // Asegúrate de instalar sharp: npm install sharp

// Definir la URL base del servidor estático (si existe)
const STATIC_SERVER_URL = process.env.STATIC_SERVER_URL || '';

export async function POST(request: NextRequest) {
  try {
    // Verificar la autenticación, pero hacer opcional para permitir cargas públicas si es necesario
    const auth = await verifyAuth(request);

    // Solo para depuración - comenta esta sección en producción
    console.log("Auth status:", auth.success ? "Autenticado" : "No autenticado");
    if (!auth.success) {
      console.log("Auth error:", auth.error);
      // Permitimos continuar aunque falle la autenticación para fines de depuración
    }

    // Obtener el formulario con el archivo
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';

    // Opción para mantener la calidad y tamaño original
    const quality = parseInt(formData.get('quality') as string || '80');
    const width = parseInt(formData.get('width') as string || '0');
    const height = parseInt(formData.get('height') as string || '0');

    if (!file) {
      return NextResponse.json(
        { error: 'No se ha proporcionado un archivo' },
        { status: 400 }
      );
    }

    // Verificar si es una imagen
    const mimeType = file.type;
    const isImage = mimeType.startsWith('image/');

    // Estructura de carpetas y permisos
    console.log("CWD:", process.cwd());

    // Verificar la carpeta public
    const publicDir = join(process.cwd(), 'public');
    if (!existsSync(publicDir)) {
      console.log(`Creando directorio público: ${publicDir}`);
      mkdirSync(publicDir, { recursive: true, mode: 0o755 });
    } else {
      console.log(`Directorio público existe: ${publicDir}`);
      // Verificar permisos
      try {
        const stat = statSync(publicDir);
        console.log(`Permisos de directorio público: ${stat.mode.toString(8)}`);
      } catch (e) {
        console.error(`Error al verificar permisos: ${e}`);
      }
    }

    // Verificar/crear la carpeta imagenes
    const imagenesDir = join(publicDir, 'imagenes');
    if (!existsSync(imagenesDir)) {
      console.log(`Creando directorio imagenes: ${imagenesDir}`);
      mkdirSync(imagenesDir, { recursive: true, mode: 0o755 });
    }

    // Directorio específico para la carpeta del tipo de contenido (hero, galeria, etc.)
    const uploadDir = join(imagenesDir, folder);
    console.log(`Directorio de carga: ${uploadDir}`);

    if (!existsSync(uploadDir)) {
      console.log(`Creando directorio: ${uploadDir}`);
      mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
    } else {
      console.log(`El directorio ya existe: ${uploadDir}`);
      // Listar contenido para depuración
      try {
        const files = readdirSync(uploadDir);
        console.log(`Contenido del directorio (${files.length} archivos):`, files.slice(0, 5));
      } catch (e) {
        console.error(`Error al listar directorio: ${e}`);
      }
    }

    // Obtener la extensión y nombre original del archivo
    const originalFilename = file.name;
    const timestamp = Date.now();
    const filenameWithoutExt = originalFilename.split('.')[0].replace(/\s+/g, '-');

    // Procesar y guardar el archivo
    if (isImage && mimeType !== 'image/gif') { // No convertimos GIFs para mantener la animación
      // Convertir a WebP para imágenes
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Configurar sharp para la conversión
      let sharpInstance = sharp(buffer).webp({ quality });

      // Redimensionar si se especifican dimensiones
      if (width > 0 || height > 0) {
        sharpInstance = sharpInstance.resize({
          width: width || undefined,
          height: height || undefined,
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // Nombre del archivo WebP
      const webpFilename = `${timestamp}-${filenameWithoutExt}.webp`;
      const webpFilePath = join(uploadDir, webpFilename);

      // Guardar como WebP
      await sharpInstance.toFile(webpFilePath);

      // Establecer permisos de archivo
      try {
        await chmod(webpFilePath, 0o644);
        console.log(`Permisos establecidos para: ${webpFilePath}`);
      } catch (e) {
        console.error(`Error al establecer permisos: ${e}`);
      }

      // URL para acceder al archivo - Usando la URL del servidor estático si está configurada
      const fileUrl = STATIC_SERVER_URL
        ? `${STATIC_SERVER_URL}/imagenes/${folder}/${webpFilename}`
        : `/imagenes/${folder}/${webpFilename}`;

      console.log(`URL de imagen generada: ${fileUrl}`);

      // Verificar que el archivo existe después de la escritura
      const fileExists = existsSync(webpFilePath);
      console.log(`Verificación de archivo después de escritura: ${fileExists ? 'Existe' : 'No existe'}`);

      console.log(`Imagen convertida y guardada como WebP: ${fileUrl}`);

      // Crear URL absoluta para pruebas
      const host = request.headers.get('host') || 'localhost';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      const absoluteUrl = `${protocol}://${host}${fileUrl}`;

      return NextResponse.json({
        success: true,
        url: fileUrl,
        absoluteUrl,
        filename: webpFilename,
        originalFilename: originalFilename,
        format: 'webp',
        fileExists,
        absolutePath: webpFilePath,
        size: fileExists ? statSync(webpFilePath).size : 0
      });
    } else {
      // Para archivos que no son imágenes o son GIFs, guardamos sin convertir
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Generar un nombre de archivo único
      const fileExt = originalFilename.split('.').pop() || '';
      const filename = `${timestamp}-${filenameWithoutExt}.${fileExt}`;

      // Ruta completa del archivo
      const filePath = join(uploadDir, filename);

      // Guardar el archivo original
      await writeFile(filePath, buffer);

      // Establecer permisos de archivo
      try {
        await chmod(filePath, 0o644);
        console.log(`Permisos establecidos para: ${filePath}`);
      } catch (e) {
        console.error(`Error al establecer permisos: ${e}`);
      }

      // URL para acceder al archivo - Usando la URL del servidor estático si está configurada
      const fileUrl = STATIC_SERVER_URL
        ? `${STATIC_SERVER_URL}/imagenes/${folder}/${filename}`
        : `/imagenes/${folder}/${filename}`;

      console.log(`URL de archivo generada: ${fileUrl}`);

      // Verificar que el archivo existe después de la escritura
      const fileExists = existsSync(filePath);
      console.log(`Verificación de archivo después de escritura: ${fileExists ? 'Existe' : 'No existe'}`);

      console.log(`Archivo guardado sin conversión: ${fileUrl}`);

      // Crear URL absoluta para pruebas
      const host = request.headers.get('host') || 'localhost';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      const absoluteUrl = `${protocol}://${host}${fileUrl}`;

      return NextResponse.json({
        success: true,
        url: fileUrl,
        absoluteUrl,
        filename: filename,
        originalFilename: originalFilename,
        format: fileExt,
        fileExists,
        absolutePath: filePath,
        size: fileExists ? statSync(filePath).size : 0
      });
    }
  } catch (error) {
    console.error('Error al subir archivo:', error);
    return NextResponse.json(
      {
        error: 'Error al procesar el archivo',
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}