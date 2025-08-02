// static-server.js
const express = require('express');
const path = require('path');
const fs = require('fs');

// Crear una aplicación Express independiente
const app = express();
const PORT = process.env.STATIC_PORT || 3001;

// Middleware para log de todas las solicitudes
app.use((req, res, next) => {
    console.log(`[STATIC SERVER] ${req.method} ${req.url}`);
    next();
});

// Servir archivos estáticos con configuración detallada
app.use('/imagenes', express.static(path.join(__dirname, 'public', 'imagenes'), {
    maxAge: '1d',
    etag: true,
    index: false,
    setHeaders: (res, filePath) => {
        // Configurar headers según el tipo de archivo
        if (filePath.endsWith('.webp')) {
            res.setHeader('Content-Type', 'image/webp');
        }
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
}));

// Manejador específico para debugging
app.get('/debug/images/:folder', (req, res) => {
    const folderPath = path.join(__dirname, 'public', 'imagenes', req.params.folder);
    try {
        if (fs.existsSync(folderPath)) {
            const files = fs.readdirSync(folderPath);
            return res.json({
                success: true,
                folder: req.params.folder,
                path: folderPath,
                files: files.map(file => {
                    const filePath = path.join(folderPath, file);
                    const stats = fs.statSync(filePath);
                    return {
                        name: file,
                        size: stats.size,
                        created: stats.birthtime,
                        url: `/imagenes/${req.params.folder}/${file}`
                    };
                })
            });
        } else {
            return res.status(404).json({
                success: false,
                folder: req.params.folder,
                path: folderPath,
                error: 'Carpeta no encontrada'
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            folder: req.params.folder,
            path: folderPath,
            error: error.message
        });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`[STATIC SERVER] Servidor de archivos estáticos iniciado en el puerto ${PORT}`);

    // Mostrar información del sistema de archivos
    const publicDir = path.join(__dirname, 'public');
    if (fs.existsSync(publicDir)) {
        console.log(`[STATIC SERVER] Directorio público: ${publicDir} (existe)`);
        try {
            const imagenesDir = path.join(publicDir, 'imagenes');
            if (fs.existsSync(imagenesDir)) {
                console.log(`[STATIC SERVER] Directorio imagenes: ${imagenesDir} (existe)`);
                // Listar subdirectorios
                const subdirs = fs.readdirSync(imagenesDir, { withFileTypes: true })
                    .filter(dirent => dirent.isDirectory())
                    .map(dirent => dirent.name);
                console.log(`[STATIC SERVER] Subdirectorios: ${subdirs.join(', ')}`);

                // Verificar la carpeta hero
                const heroDir = path.join(imagenesDir, 'hero');
                if (fs.existsSync(heroDir)) {
                    const heroFiles = fs.readdirSync(heroDir);
                    console.log(`[STATIC SERVER] Archivos en hero (${heroFiles.length}): ${heroFiles.slice(0, 5).join(', ')}${heroFiles.length > 5 ? '...' : ''}`);
                }
            } else {
                console.log(`[STATIC SERVER] Directorio imagenes: ${imagenesDir} (no existe)`);
            }
        } catch (e) {
            console.error(`[STATIC SERVER] Error al listar directorios: ${e.message}`);
        }
    } else {
        console.log(`[STATIC SERVER] Directorio público: ${publicDir} (no existe)`);
    }
});