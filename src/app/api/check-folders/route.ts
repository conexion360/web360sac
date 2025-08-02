import { NextResponse } from 'next/server';
import { existsSync, readdirSync, mkdirSync } from 'fs';
import { join } from 'path';

export async function GET() {
    try {
        const basePath = process.cwd();
        console.log("Directorio base:", basePath);

        const folders = [
            join(basePath, 'public'),
            join(basePath, 'public', 'imagenes'),
            join(basePath, 'public', 'imagenes', 'hero'),
            join(basePath, 'public', 'musicas')
        ];

        const folderStatus = folders.map(folder => {
            const exists = existsSync(folder);

            // Crear la carpeta si no existe
            if (!exists) {
                try {
                    mkdirSync(folder, { recursive: true });
                    console.log(`Carpeta creada: ${folder}`);
                } catch (e) {
                    console.error(`Error al crear carpeta ${folder}:`, e);
                }
            }

            return {
                path: folder,
                exists: existsSync(folder),
                contents: existsSync(folder) ? readdirSync(folder) : [],
                writable: checkWritable(folder)
            };
        });

        return NextResponse.json({ folderStatus });
    } catch (error) {
        console.error("Error checking folders:", error);
        return NextResponse.json({ error: 'Error checking folders', details: String(error) }, { status: 500 });
    }
}

function checkWritable(dir: string): boolean {
    try {
        const testFile = join(dir, '.write-test');
        const timestamp = Date.now();
        const content = `Test ${timestamp}`;

        // Intentar escribir
        const fs = require('fs');
        fs.writeFileSync(testFile, content);

        // Verificar contenido
        const readContent = fs.readFileSync(testFile, 'utf8');

        // Limpiar
        fs.unlinkSync(testFile);

        return readContent === content;
    } catch (e) {
        console.error(`Error verificando permisos de escritura en ${dir}:`, e);
        return false;
    }
}