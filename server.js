// server.js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const express = require('express');
const path = require('path');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Inicializa Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();

    // Servir archivos estáticos desde la carpeta public
    server.use(express.static(path.join(__dirname, 'public'), {
        maxAge: dev ? '0' : '365d', // Caché para producción
        dotfiles: 'ignore',
        etag: true,
    }));

    // Manejador para archivos estáticos
    server.get('/imagenes/:folder/:file', (req, res) => {
        const filePath = path.join(__dirname, 'public', 'imagenes', req.params.folder, req.params.file);
        console.log(`Solicitando archivo: ${filePath}`);

        // Verificar si el archivo existe
        if (fs.existsSync(filePath)) {
            console.log(`Archivo encontrado: ${filePath}`);
            return res.sendFile(filePath);
        } else {
            console.log(`Archivo NO encontrado: ${filePath}`);
            return res.status(404).send('Archivo no encontrado');
        }
    });

    // Manejar todas las demás rutas con Next.js
    server.all('*', (req, res) => {
        const parsedUrl = parse(req.url, true);
        return handle(req, res, parsedUrl);
    });

    // Iniciar el servidor
    server.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://${hostname}:${port}`);

        // Log de información adicional para depuración
        console.log(`> Entorno: ${process.env.NODE_ENV}`);
        console.log(`> Directorio base: ${__dirname}`);
        console.log(`> Directorio público: ${path.join(__dirname, 'public')}`);
        try {
            const publicDir = path.join(__dirname, 'public');
            if (fs.existsSync(publicDir)) {
                console.log(`> Directorio público existe: Sí`);
                console.log(`> Contenido de 'public':`, fs.readdirSync(publicDir).slice(0, 10));

                const imagenesDir = path.join(publicDir, 'imagenes');
                if (fs.existsSync(imagenesDir)) {
                    console.log(`> Directorio 'imagenes' existe: Sí`);
                    console.log(`> Contenido de 'imagenes':`, fs.readdirSync(imagenesDir).slice(0, 10));

                    const heroDir = path.join(imagenesDir, 'hero');
                    if (fs.existsSync(heroDir)) {
                        console.log(`> Directorio 'hero' existe: Sí`);
                        console.log(`> Contenido de 'hero':`, fs.readdirSync(heroDir).slice(0, 10));
                    } else {
                        console.log(`> Directorio 'hero' existe: No`);
                    }
                } else {
                    console.log(`> Directorio 'imagenes' existe: No`);
                }
            } else {
                console.log(`> Directorio público existe: No`);
            }
        } catch (e) {
            console.error(`> Error al verificar directorios: ${e.message}`);
        }
    });
});