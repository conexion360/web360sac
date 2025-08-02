// src/app/api/debug-files/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface SlideRow {
    id: number;
    titulo: string;
    imagen_desktop: string;
    imagen_mobile: string;
}

export async function GET(request: NextRequest) {
    try {
        const heroDir = join(process.cwd(), 'public', 'imagenes', 'hero');

        // Lista todos los archivos en la carpeta hero
        const files = existsSync(heroDir) ? readdirSync(heroDir) : [];

        // Obtener los slides de la base de datos
        const { Pool } = require('pg');
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/conexion360',
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });

        const client = await pool.connect();
        const slidesResult = await client.query('SELECT id, titulo, imagen_desktop, imagen_mobile FROM hero_slides');
        client.release();

        return NextResponse.json({
            heroDir,
            files,
            slides: slidesResult.rows,
            // Comprobar si las imágenes en la base de datos existen en el sistema de archivos
            fileCheck: slidesResult.rows.map((slide: SlideRow) => {
                // Extraer la ruta relativa del archivo desde la URL
                const desktopPath = slide.imagen_desktop.replace(/^\/imagenes\//, '');
                const mobilePath = slide.imagen_mobile.replace(/^\/imagenes\//, '');

                // Comprobar si los archivos existen
                const desktopExists = existsSync(join(process.cwd(), 'public', 'imagenes', desktopPath));
                const mobileExists = existsSync(join(process.cwd(), 'public', 'imagenes', mobilePath));

                return {
                    id: slide.id,
                    titulo: slide.titulo,
                    desktop: {
                        path: desktopPath,
                        exists: desktopExists
                    },
                    mobile: {
                        path: mobilePath,
                        exists: mobileExists
                    }
                };
            })
        });
    } catch (error) {
        console.error("Error debugging files:", error);
        return NextResponse.json({ error: 'Error debugging files', details: String(error) }, { status: 500 });
    }
}