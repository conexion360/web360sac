// src/app/api/upload/delete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { deleteFile } from '@/lib/imagekit';

export async function DELETE(request: NextRequest) {
    try {
        // Verificar autenticación
        const auth = await verifyAuth(request);
        if (!auth.success) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        // Obtener el fileId del cuerpo de la solicitud
        const { fileId } = await request.json();

        if (!fileId) {
            return NextResponse.json(
                { error: 'fileId es requerido' },
                { status: 400 }
            );
        }

        console.log(`Eliminando archivo de ImageKit con ID: ${fileId}`);

        // Eliminar archivo de ImageKit
        const result = await deleteFile(fileId);

        console.log(`Archivo eliminado exitosamente de ImageKit:`, result);

        return NextResponse.json({
            success: true,
            message: 'Archivo eliminado correctamente',
            fileId: fileId
        });

    } catch (error: any) {
        console.error('Error al eliminar archivo de ImageKit:', error);

        return NextResponse.json(
            {
                error: 'Error al eliminar el archivo',
                details: error.message || String(error)
            },
            { status: 500 }
        );
    }
}