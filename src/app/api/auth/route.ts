// src/app/api/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Rate limiting simple en memoria (resetea al reiniciar el servidor)
const loginAttempts = new Map<string, { count: number; firstAttempt: number; blockedUntil?: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const BLOCK_MS = 30 * 60 * 1000; // 30 minutos de bloqueo

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const real = request.headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; remaining?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  if (record.blockedUntil && now < record.blockedUntil) {
    return { allowed: false };
  }

  if (now - record.firstAttempt > WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  record.count++;

  if (record.count > MAX_ATTEMPTS) {
    record.blockedUntil = now + BLOCK_MS;
    return { allowed: false };
  }

  return { allowed: true, remaining: MAX_ATTEMPTS - record.count };
}

function resetAttempts(ip: string) {
  loginAttempts.delete(ip);
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // Verificar rate limit
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Demasiados intentos fallidos. Intenta de nuevo más tarde.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.email !== 'string' || typeof body.password !== 'string') {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const email = body.email.trim().toLowerCase();
    const password = body.password;

    // Validaciones básicas
    if (!email || !password || email.length > 254 || password.length > 200) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    // JWT_SECRET es OBLIGATORIO
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || jwtSecret.length < 16) {
      console.error('JWT_SECRET no configurado o muy corto');
      return NextResponse.json(
        { error: 'Configuración del servidor incompleta' },
        { status: 500 }
      );
    }

    // Buscar usuario por email
    const userResult = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);

    // Tiempo constante: realizar bcrypt incluso si el usuario no existe (evitar timing attacks)
    const user = userResult.rows[0];
    const hashToCompare = user?.password || '$2b$10$abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQR';
    const passwordMatch = await bcrypt.compare(password, hashToCompare);

    if (!user || !passwordMatch) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    // Login exitoso — resetear intentos de esta IP
    resetAttempts(ip);

    // Actualizar último acceso (no bloquear respuesta)
    db.query('UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = $1', [user.id]).catch(
      (err) => console.warn('No se pudo actualizar último acceso:', err.message)
    );

    const token = jwt.sign(
      {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
      jwtSecret,
      { expiresIn: '8h' }
    );

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    });
  } catch (error: any) {
    console.error('Error en login:', error.message);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}
