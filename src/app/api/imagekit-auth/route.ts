// src/app/api/imagekit-auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticationParameters } from '@/lib/imagekit';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        // Verificar autenticación para endpoints sensibles
        const auth = await verifyAuth(request);
        if (!auth.success) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        // Generar parámetros de autenticación para ImageKit
        const authParameters = getAuthenticationParameters();

        return NextResponse.json({
            success: true,
            ...authParameters,
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
        });

    } catch (error: any) {
        console.error('Error al generar parámetros de autenticación ImageKit:', error);

        return NextResponse.json(
            {
                error: 'Error al generar parámetros de autenticación',
                details: error.message
            },
            { status: 500 }
        );
    }
}