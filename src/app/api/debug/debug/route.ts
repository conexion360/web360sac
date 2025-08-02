// src/app/api/debug/files/route.ts
import { NextResponse } from 'next/server';
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

export async function GET() {
    try {
        const publicDir = join(process.cwd(), 'public');
        const imagenesDir = join(publicDir, 'imagenes');

        const result = {
            success: true,
            timestamp: new Date().toISOString(),
            cwd: process.cwd(),
            publicExists: existsSync(publicDir),
            imagenesExists: existsSync(imagenesDir),
            folders: {} as Record<string, any>
        };

        // Listar subdirectorios de imagenes
        if (existsSync(imagenesDir)) {
            const subdirs = readdirSync(imagenesDir, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);

            subdirs.forEach(subdir => {
                const subdirPath = join(imagenesDir, subdir);
                try {
                    const files = readdirSync(subdirPath);
                    const fileDetails = files.map(file => {
                        const filePath = join(subdirPath, file);
                        const stats = statSync(filePath);
                        return {
                            name: file,
                            size: stats.size,
                            created: stats.birthtime,
                            modified: stats.mtime,
                            url: `/imagenes/${subdir}/${file}`
                        };
                    });

                    result.folders[subdir] = {
                        count: files.length,
                        files: fileDetails,
                        path: subdirPath
                    };
                } catch (err: any) {
                    result.folders[subdir] = {
                        error: err.message,
                        path: subdirPath
                    };
                }
            });
        } else {
            // Intentar crear el directorio si no existe
            try {
                const fs = require('fs');
                fs.mkdirSync(imagenesDir, { recursive: true });
                result.folders['_created'] = 'Directorio imagenes creado';
            } catch (err: any) {
                result.folders['_error'] = `No se pudo crear directorio: ${err.message}`;
            }
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Error in debug/files endpoint:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            cwd: process.cwd(),
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}