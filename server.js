// server.js - Optimizado para Railway
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const express = require('express');
const path = require('path');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0'; // Importante para Railway
const port = parseInt(process.env.PORT || '3000', 10);

// Inicializa Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();

    // IMPORTANTE: Middleware para logs detallados
    server.use((req, res, next) => {
        if (req.url.startsWith('/imagenes/')) {
            console.log(`[STATIC] ${req.method} ${req.url}`);
        }
        next();
    });

    // Servir archivos estáticos con configuración robusta
    server.use('/imagenes', express.static(path.join(process.cwd(), 'public/imagenes'), {
        maxAge: dev ? '0' : '1d',
        dotfiles: 'ignore',
        etag: true,
        index: false,
        setHeaders: (res, filePath, stat) => {
            console.log(`[STATIC SERVE] Serving: ${filePath}`);

            // Headers específicos por tipo de archivo
            if (filePath.endsWith('.webp')) {
                res.setHeader('Content-Type', 'image/webp');
            } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
                res.setHeader('Content-Type', 'image/jpeg');
            } else if (filePath.endsWith('.png')) {
                res.setHeader('Content-Type', 'image/png');
            }

            // Headers de cache
            res.setHeader('Cache-Control', dev ? 'no-cache' : 'public, max-age=86400');
            res.setHeader('Access-Control-Allow-Origin', '*');
        }
    }));

    // Middleware para debug de archivos no encontrados
    server.use('/imagenes', (req, res, next) => {
        const requestedPath = path.join(process.cwd(), 'public/imagenes', req.path);
        console.log(`[STATIC 404] Archivo no encontrado: ${requestedPath}`);
        console.log(`[STATIC 404] Existe: ${fs.existsSync(requestedPath)}`);

        // Listar contenido del directorio padre para debug
        const parentDir = path.dirname(requestedPath);
        if (fs.existsSync(parentDir)) {
            try {
                const files = fs.readdirSync(parentDir);
                console.log(`[STATIC 404] Archivos en ${parentDir}:`, files);
            } catch (err) {
                console.log(`[STATIC 404] Error listando directorio: ${err.message}`);
            }
        }

        res.status(404).json({
            error: 'Archivo no encontrado',
            path: req.path,
            fullPath: requestedPath,
            exists: fs.existsSync(requestedPath)
        });
    });

    // Endpoint de debug para Railway
    server.get('/api/debug/files', (req, res) => {
        const publicDir = path.join(process.cwd(), 'public');
        const imagenesDir = path.join(publicDir, 'imagenes');

        try {
            const result = {
                success: true,
                cwd: process.cwd(),
                publicExists: fs.existsSync(publicDir),
                imagenesExists: fs.existsSync(imagenesDir),
                folders: {}
            };

            // Listar subdirectorios de imagenes
            if (fs.existsSync(imagenesDir)) {
                const subdirs = fs.readdirSync(imagenesDir, { withFileTypes: true })
                    .filter(dirent => dirent.isDirectory())
                    .map(dirent => dirent.name);

                subdirs.forEach(subdir => {
                    const subdirPath = path.join(imagenesDir, subdir);
                    try {
                        const files = fs.readdirSync(subdirPath);
                        result.folders[subdir] = {
                            count: files.length,
                            files: files.slice(0, 10), // Solo primeros 10
                            path: subdirPath
                        };
                    } catch (err) {
                        result.folders[subdir] = { error: err.message };
                    }
                });
            }

            res.json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
                cwd: process.cwd()
            });
        }
    });

    // Manejar todas las demás rutas con Next.js
    server.all('*', (req, res) => {
        return handle(req, res);
    });

    // Iniciar el servidor
    server.listen(port, hostname, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://${hostname}:${port}`);
        console.log(`> Environment: ${process.env.NODE_ENV}`);
        console.log(`> Current working directory: ${process.cwd()}`);

        // Log de información del sistema de archivos
        const publicDir = path.join(process.cwd(), 'public');
        const imagenesDir = path.join(publicDir, 'imagenes');

        console.log(`> Public directory: ${publicDir} (exists: ${fs.existsSync(publicDir)})`);
        console.log(`> Images directory: ${imagenesDir} (exists: ${fs.existsSync(imagenesDir)})`);

        if (fs.existsSync(imagenesDir)) {
            try {
                const subdirs = fs.readdirSync(imagenesDir, { withFileTypes: true })
                    .filter(dirent => dirent.isDirectory())
                    .map(dirent => dirent.name);
                console.log(`> Image subdirectories: ${subdirs.join(', ')}`);

                // Verificar contenido de hero
                const heroDir = path.join(imagenesDir, 'hero');
                if (fs.existsSync(heroDir)) {
                    const heroFiles = fs.readdirSync(heroDir);
                    console.log(`> Hero files (${heroFiles.length}): ${heroFiles.slice(0, 5).join(', ')}${heroFiles.length > 5 ? '...' : ''}`);
                }
            } catch (err) {
                console.error(`> Error reading directories: ${err.message}`);
            }
        }
    });
});