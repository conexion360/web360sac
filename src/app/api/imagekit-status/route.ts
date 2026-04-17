// src/app/api/imagekit-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { imagekit } from '@/lib/imagekit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // Verificar configuración de variables de entorno
        const config = {
            publicKey: !!process.env.IMAGEKIT_PUBLIC_KEY,
            privateKey: !!process.env.IMAGEKIT_PRIVATE_KEY,
            urlEndpoint: !!process.env.IMAGEKIT_URL_ENDPOINT,
            publicKeyValue: process.env.IMAGEKIT_PUBLIC_KEY ?
                process.env.IMAGEKIT_PUBLIC_KEY.substring(0, 20) + '...' : 'No configurada',
            urlEndpointValue: process.env.IMAGEKIT_URL_ENDPOINT || 'No configurada'
        };

        // Intentar hacer una llamada simple a ImageKit para verificar conectividad
        let connectionStatus = 'unknown';
        let errorDetails = null;

        try {
            // Intentar listar archivos (con límite de 1) para verificar conectividad
            const listResult = await imagekit.listFiles({
                limit: 1
            });

            connectionStatus = 'connected';
            console.log('✅ Conexión a ImageKit verificada exitosamente');
        } catch (error: any) {
            connectionStatus = 'error';
            errorDetails = {
                message: error.message,
                help: error.help || null,
                code: error.code || null
            };
            console.error('❌ Error al conectar con ImageKit:', error);
        }

        // Información de configuración
        const status = {
            timestamp: new Date().toISOString(),
            configured: config.publicKey && config.privateKey && config.urlEndpoint,
            connection: connectionStatus,
            config: {
                publicKey: config.publicKey,
                privateKey: config.privateKey,
                urlEndpoint: config.urlEndpoint,
                publicKeyPreview: config.publicKeyValue,
                urlEndpointValue: config.urlEndpointValue
            },
            error: errorDetails
        };

        // Determinar el código de estado HTTP
        const httpStatus = status.configured && connectionStatus === 'connected' ? 200 :
            status.configured && connectionStatus === 'error' ? 503 : 400;

        return NextResponse.json({
            success: connectionStatus === 'connected',
            status: status,
            message: connectionStatus === 'connected' ?
                'ImageKit configurado y funcionando correctamente' :
                status.configured ?
                    'ImageKit configurado pero hay problemas de conexión' :
                    'ImageKit no está configurado correctamente'
        }, { status: httpStatus });

    } catch (error: any) {
        console.error('Error al verificar estado de ImageKit:', error);

        return NextResponse.json({
            success: false,
            status: 'error',
            message: 'Error al verificar el estado de ImageKit',
            error: {
                message: error.message,
                details: error.stack
            }
        }, { status: 500 });
    }
}