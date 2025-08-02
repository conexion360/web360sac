// Archivo a crear como: public/favicon.js
// Este script se cargará directamente en el HTML y configurará el favicon

(function () {
    // Función para establecer el favicon
    function setFavicon(faviconUrl) {
        // Remover cualquier favicon existente
        const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
        existingFavicons.forEach(favicon => {
            document.head.removeChild(favicon);
        });

        // Crear y añadir nuevos enlaces para el favicon
        const formats = [
            { rel: "icon", sizes: "32x32" },
            { rel: "shortcut icon" },
            { rel: "apple-touch-icon" }
        ];

        formats.forEach(format => {
            const link = document.createElement('link');
            link.rel = format.rel;
            if (format.sizes) link.sizes = format.sizes;
            link.href = faviconUrl;
            document.head.appendChild(link);
        });

        console.log('Favicon configurado correctamente:', faviconUrl);
    }

    // Intentar cargar la configuración del sitio
    fetch('/api/configuracion')
        .then(response => response.json())
        .then(data => {
            if (data && data.favicon) {
                setFavicon(data.favicon);
            } else {
                console.log('No se encontró favicon en la configuración');
            }
        })
        .catch(error => {
            console.error('Error al cargar la configuración para el favicon:', error);
        });
})();