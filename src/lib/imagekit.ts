// src/lib/imagekit.ts
import ImageKit from 'imagekit';

let _imagekit: ImageKit | null = null;

function getImageKit(): ImageKit {
    if (_imagekit) return _imagekit;

    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    if (!publicKey || !privateKey || !urlEndpoint) {
        throw new Error(
            'ImageKit no configurado: faltan IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY o IMAGEKIT_URL_ENDPOINT'
        );
    }

    _imagekit = new ImageKit({ publicKey, privateKey, urlEndpoint });
    return _imagekit;
}

export const imagekit = new Proxy({} as ImageKit, {
    get(_target, prop) {
        const instance = getImageKit();
        const value = (instance as any)[prop];
        return typeof value === 'function' ? value.bind(instance) : value;
    }
});

export function getAuthenticationParameters() {
    return getImageKit().getAuthenticationParameters();
}

export function generateImageUrl(
    path: string,
    transformations?: any[],
    transformationPosition?: 'path' | 'query'
) {
    return getImageKit().url({
        path,
        transformation: transformations,
        transformationPosition: transformationPosition || 'path'
    });
}

export async function uploadFile(
    file: Buffer | string,
    fileName: string,
    folder?: string,
    tags?: string[]
) {
    try {
        const result = await getImageKit().upload({
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

export async function deleteFile(fileId: string) {
    try {
        const result = await getImageKit().deleteFile(fileId);
        return result;
    } catch (error) {
        console.error('Error deleting from ImageKit:', error);
        throw error;
    }
}
