// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { uploadFile } from '@/lib/imagekit';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    // Verificar la autenticación (opcional para depuración)
    const auth = await verifyAuth(request);
    console.log("Auth status:", auth.success ? "Autenticado" : "No autenticado");

    // En desarrollo, permitir continuar aunque falle la autenticación
    if (!auth.success && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener el formulario con el archivo
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';

    // Opciones de procesamiento
    const quality = parseInt(formData.get('quality') as string || '85');
    const width = parseInt(formData.get('width') as string || '0');
    const height = parseInt(formData.get('height') as string || '0');

    if (!file) {
      return NextResponse.json(
        { error: 'No se ha proporcionado un archivo' },
        { status: 400 }
      );
    }

    console.log(`Procesando archivo: ${file.name} (${file.type})`);

    // Verificar si es una imagen
    const mimeType = file.type;
    const isImage = mimeType.startsWith('image/');

    // Obtener buffer del archivo
    const arrayBuffer = await file.arrayBuffer();
    let fileBuffer = Buffer.from(arrayBuffer);

    // Procesar imagen si es necesario
    let finalFileName = file.name;
    let processedBuffer = fileBuffer;

    if (isImage && mimeType !== 'image/gif') {
      // Procesar con Sharp para optimizar antes de subir a ImageKit
      let sharpInstance = sharp(fileBuffer);

      // Redimensionar si se especifican dimensiones
      if (width > 0 || height > 0) {
        sharpInstance = sharpInstance.resize({
          width: width || undefined,
          height: height || undefined,
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // Convertir a WebP para mejor compresión
      sharpInstance = sharpInstance.webp({ quality });

      processedBuffer = await sharpInstance.toBuffer();

      // Cambiar la extensión del archivo a .webp
      const nameWithoutExt = file.name.split('.')[0];
      finalFileName = `${nameWithoutExt}.webp`;
    }

    // Generar nombre único con timestamp
    const timestamp = Date.now();
    const fileNameWithoutExt = finalFileName.split('.')[0].replace(/\s+/g, '-');
    const fileExtension = finalFileName.split('.').pop();
    const uniqueFileName = `${timestamp}-${fileNameWithoutExt}.${fileExtension}`;

    // Subir a ImageKit
    console.log(`Subiendo a ImageKit: ${uniqueFileName} en carpeta: ${folder}`);

    const uploadResult = await uploadFile(
      processedBuffer,
      uniqueFileName,
      folder,
      [folder, 'upload'] // Tags para organizar
    );

    console.log(`Archivo subido exitosamente a ImageKit:`, {
      fileId: uploadResult.fileId,
      name: uploadResult.name,
      url: uploadResult.url
    });

    // Generar diferentes URLs con transformaciones para responsive
    const baseUrl = uploadResult.url;

    // URLs optimizadas para diferentes dispositivos
    const responsiveUrls = {
      thumbnail: `${baseUrl}?tr=w-300,h-200,c-maintain_ratio`,
      small: `${baseUrl}?tr=w-600,h-400,c-maintain_ratio`,
      medium: `${baseUrl}?tr=w-1200,h-800,c-maintain_ratio`,
      large: `${baseUrl}?tr=w-1920,h-1080,c-maintain_ratio`,
      original: baseUrl
    };

    return NextResponse.json({
      success: true,
      url: baseUrl,
      fileId: uploadResult.fileId,
      name: uploadResult.name,
      originalFilename: file.name,
      processedFilename: uniqueFileName,
      format: isImage && mimeType !== 'image/gif' ? 'webp' : fileExtension,
      folder: folder,
      size: uploadResult.size,
      responsiveUrls: responsiveUrls,
      imagekitResponse: {
        fileId: uploadResult.fileId,
        name: uploadResult.name,
        url: uploadResult.url,
        thumbnailUrl: uploadResult.thumbnailUrl,
        fileType: uploadResult.fileType,
        filePath: uploadResult.filePath
      }
    });

  } catch (error: any) {
    console.error('Error al subir archivo a ImageKit:', error);

    return NextResponse.json(
      {
        error: 'Error al procesar el archivo',
        details: error.message || String(error),
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}