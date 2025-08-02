// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Rutas que nunca deben requerir autenticación
  if (path === '/api/auth' || path === '/api/auth-debug') {
    // Permitir acceso a las rutas de autenticación sin verificación
    return NextResponse.next();
  }

  // Permitir explícitamente las subidas sin autenticación tanto en desarrollo como en producción
  if (path === '/api/upload' || path.startsWith('/api/upload')) {
    console.log("Middleware: Permitiendo explícitamente subidas sin verificación de autenticación");
    return NextResponse.next();
  }

  // Otras rutas públicas que no necesitan autenticación
  const publicPaths = [
    '/api/db-check',
    '/api/test-db',
    '/api/hero',
    '/api/galeria',
    '/api/generos',
    '/api/musica',
    '/api/nosotros',
    '/api/redes',
    '/api/configuracion',
    '/api/mensajes'
    // Nota: Quité '/api/upload' de aquí porque ya lo manejamos explícitamente arriba
  ];

  // Bypass para upload durante desarrollo (esto ya no es necesario por el bloque de arriba pero lo dejamos por compatibilidad)
  const uploadPath = '/api/upload';
  const isDevEnvironment = process.env.NODE_ENV === 'development';

  // Si estamos en desarrollo y es una petición a upload, dejar pasar
  if (isDevEnvironment && path === uploadPath) {
    console.log("Middleware: Permitiendo subida de archivos en desarrollo sin autenticación");
    return NextResponse.next();
  }

  // Si la ruta es pública o no es una API, permitir acceso
  if (!path.startsWith('/api/') || publicPaths.some(publicPath => path.startsWith(publicPath))) {
    return NextResponse.next();
  }

  // Verificar token JWT para rutas protegidas
  const auth = await verifyAuth(request);
  if (!auth.success) {
    console.log(`Middleware: Error de autenticación en ruta ${path}: ${auth.error}`);
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};