// src/components/ImageKitImage.tsx
'use client'
import React, { useState } from 'react';

interface ImageKitImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
    crop?: 'maintain_ratio' | 'force' | 'at_least' | 'at_max';
    focus?: 'center' | 'top' | 'left' | 'bottom' | 'right' | 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right';
    progressive?: boolean;
    lossless?: boolean;
    blur?: number;
    grayscale?: boolean;
    loading?: 'lazy' | 'eager';
    onLoad?: () => void;
    onError?: () => void;
    fallback?: string;
    placeholder?: string;
}

export const ImageKitImage: React.FC<ImageKitImageProps> = ({
    src,
    alt,
    width,
    height,
    className = '',
    quality = 85,
    format = 'auto',
    crop = 'maintain_ratio',
    focus = 'center',
    progressive = true,
    lossless = false,
    blur,
    grayscale = false,
    loading = 'lazy',
    onLoad,
    onError,
    fallback,
    placeholder
}) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Construir URL con transformaciones
    const buildImageUrl = (baseUrl: string, transformations: string[] = []) => {
        if (!baseUrl) return '';

        // Si ya es una URL de ImageKit, extraer la parte base
        let cleanUrl = baseUrl;
        if (baseUrl.includes('?tr=')) {
            cleanUrl = baseUrl.split('?tr=')[0];
        }

        if (transformations.length === 0) return cleanUrl;

        const transformationString = transformations.join(',');
        return `${cleanUrl}?tr=${transformationString}`;
    };

    // Crear transformaciones basadas en props
    const createTransformations = () => {
        const transformations: string[] = [];

        if (width) transformations.push(`w-${width}`);
        if (height) transformations.push(`h-${height}`);
        if (crop) transformations.push(`c-${crop}`);
        if (focus && focus !== 'center') transformations.push(`fo-${focus}`);
        if (quality !== 85) transformations.push(`q-${quality}`);
        if (format !== 'auto') transformations.push(`f-${format}`);
        if (progressive) transformations.push('pr-true');
        if (lossless) transformations.push('lo-true');
        if (blur) transformations.push(`bl-${blur}`);
        if (grayscale) transformations.push('e-grayscale');

        return transformations;
    };

    const transformations = createTransformations();
    const imageUrl = buildImageUrl(src, transformations);

    // URL para placeholder con baja calidad
    const placeholderUrl = placeholder || buildImageUrl(src, [
        width ? `w-${Math.min(width, 50)}` : 'w-50',
        height ? `h-${Math.min(height, 50)}` : 'h-50',
        'q-20',
        'bl-10'
    ]);

    const handleLoad = () => {
        setImageLoaded(true);
        if (onLoad) onLoad();
    };

    const handleError = () => {
        setImageError(true);
        if (onError) onError();
    };

    // Si hay error y existe fallback, mostrar fallback
    if (imageError && fallback) {
        return (
            <img
                src={fallback}
                alt={alt}
                className={className}
                loading={loading}
            />
        );
    }

    // Si hay error y no hay fallback, mostrar div placeholder
    if (imageError) {
        return (
            <div
                className={`bg-gray-200 flex items-center justify-center ${className}`}
                style={{ width: width ? `${width}px` : '100%', height: height ? `${height}px` : 'auto' }}
            >
                <span className="text-gray-500 text-sm">Error al cargar imagen</span>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Placeholder con baja calidad */}
            {!imageLoaded && (
                <img
                    src={placeholderUrl}
                    alt=""
                    className={`absolute inset-0 transition-opacity duration-300 ${imageLoaded ? 'opacity-0' : 'opacity-100'} ${className}`}
                    style={{ filter: 'blur(5px)' }}
                />
            )}

            {/* Imagen principal */}
            <img
                src={imageUrl}
                alt={alt}
                className={`transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
                loading={loading}
                onLoad={handleLoad}
                onError={handleError}
                width={width}
                height={height}
            />
        </div>
    );
};

// Hook personalizado para generar URLs de ImageKit
export const useImageKitUrl = () => {
    const generateUrl = (
        baseUrl: string,
        options: {
            width?: number;
            height?: number;
            quality?: number;
            format?: string;
            crop?: string;
        } = {}
    ) => {
        if (!baseUrl) return '';

        const transformations: string[] = [];

        if (options.width) transformations.push(`w-${options.width}`);
        if (options.height) transformations.push(`h-${options.height}`);
        if (options.quality) transformations.push(`q-${options.quality}`);
        if (options.format) transformations.push(`f-${options.format}`);
        if (options.crop) transformations.push(`c-${options.crop}`);

        if (transformations.length === 0) return baseUrl;

        const transformationString = transformations.join(',');

        // Si ya es una URL de ImageKit, extraer la parte base
        let cleanUrl = baseUrl;
        if (baseUrl.includes('?tr=')) {
            cleanUrl = baseUrl.split('?tr=')[0];
        }

        return `${cleanUrl}?tr=${transformationString}`;
    };

    return { generateUrl };
};

export default ImageKitImage;