// src/lib/imagekit.ts
import ImageKit from 'imagekit';

// Configuración del cliente ImageKit
export const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || ''
});

// Función para generar token de autenticación (si es necesario para el frontend)
export function getAuthenticationParameters() {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    return authenticationParameters;
}

// Función para generar URLs optimizadas
export function generateImageUrl(
    path: string,
    transformations?: any[],
    transformationPosition?: 'path' | 'query'
) {
    return imagekit.url({
        path,
        transformation: transformations,
        transformationPosition: transformationPosition || 'path'
    });
}

// Función para subir archivo
export async function uploadFile(
    file: Buffer | string,
    fileName: string,
    folder?: string,
    tags?: string[]
) {
    try {
        const result = await imagekit.upload({
            file: file,
            fileName: fileName,
            folder: folder || '/',
            tags: tags || [],
            useUniqueFileName: true,
            isPrivateFile: false
        });

        return result;
    } catch (error) {
        console.error('Error uploading to ImageKit:', error);
        throw error;
    }
}

// Función para eliminar archivo
export async function deleteFile(fileId: string) {
    try {
        const result = await imagekit.deleteFile(fileId);
        return result;
    } catch (error) {
        console.error('Error deleting from ImageKit:', error);
        throw error;
    }
}