// src/lib/db.ts
import { Pool, PoolConfig } from 'pg';

const isProduction = process.env.NODE_ENV === 'production';

const poolConfig: PoolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    }
  : {
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '147ABC55',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '9134'),
      database: process.env.DB_NAME || 'conexion360',
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool(poolConfig);

export const db = pool;

export async function checkDatabaseConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Conexión a la base de datos establecida:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    return false;
  }
}

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Ejecutada consulta', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error ejecutando consulta', { text, error });
    throw error;
  }
}
