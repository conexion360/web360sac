// setup-database.js
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

// Leer variables de entorno
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '147ABC55',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '9134'),
    database: process.env.DB_NAME || 'conexion360',
    // No usar SSL para desarrollo local
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

console.log('Intentando conectar a la base de datos con configuración:', {
    user: dbConfig.user,
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    ssl: dbConfig.ssl
});

// Crear un pool de conexiones para la base de datos
const pool = new Pool(dbConfig);

async function setupDatabase() {
    let client;

    try {
        // Probar la conexión
        client = await pool.connect();
        console.log('✅ Conexión a PostgreSQL establecida correctamente');

        // Leer el archivo SQL
        const sqlPath = path.join(__dirname, 'init.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        console.log('Ejecutando script SQL para crear tablas...');
        await client.query(sqlContent);
        console.log('✅ Tablas creadas correctamente');

        // Crear usuario administrador
        console.log('Creando usuario administrador...');

        // Verificar si la tabla usuarios existe
        const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usuarios'
      );
    `);

        if (!tableCheck.rows[0].exists) {
            console.log('❌ La tabla usuarios no existe. Verifica el script SQL.');
            return;
        }

        // Verificar si el usuario admin ya existe
        const userCheck = await client.query(
            "SELECT * FROM usuarios WHERE email = 'admin@conexion360sac.com'"
        );

        if (userCheck.rows.length > 0) {
            console.log('El usuario admin ya existe. Actualizando contraseña...');

            // Hash de la contraseña 'admin123'
            const hashedPassword = await bcrypt.hash('admin123', 10);

            await client.query(
                `UPDATE usuarios 
         SET password = $1, 
             nombre = 'Administrador', 
             rol = 'superadmin' 
         WHERE email = 'admin@conexion360sac.com'`,
                [hashedPassword]
            );

            console.log('✅ Contraseña de administrador actualizada correctamente.');
        } else {
            console.log('Creando nuevo usuario administrador...');

            // Hash de la contraseña 'admin123'
            const hashedPassword = await bcrypt.hash('admin123', 10);

            await client.query(
                `INSERT INTO usuarios (nombre, email, password, rol) 
         VALUES ('Administrador', 'admin@conexion360sac.com', $1, 'superadmin')`,
                [hashedPassword]
            );

            console.log('✅ Usuario administrador creado correctamente.');
        }

        // Verificar que el usuario se creó correctamente
        const userVerify = await client.query(
            "SELECT id, nombre, email, rol FROM usuarios WHERE email = 'admin@conexion360sac.com'"
        );

        if (userVerify.rows.length > 0) {
            console.log('Verificación exitosa:');
            console.log('- ID:', userVerify.rows[0].id);
            console.log('- Nombre:', userVerify.rows[0].nombre);
            console.log('- Email:', userVerify.rows[0].email);
            console.log('- Rol:', userVerify.rows[0].rol);
        } else {
            console.log('❌ ERROR: No se pudo verificar la creación del usuario.');
        }

        console.log('\nInformación para inicio de sesión:');
        console.log('- Email: admin@conexion360sac.com');
        console.log('- Contraseña: admin123');

        // Crear carpetas necesarias
        console.log('\nCreando estructura de carpetas...');
        require('./enhanced-fix-folder-structure.js');

    } catch (error) {
        console.error('❌ Error en la configuración:', error);
    } finally {
        if (client) {
            client.release();
        }
        await pool.end();
    }
}

setupDatabase().catch(console.error);