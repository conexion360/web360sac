// create-admin.js
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Configuración de la conexión a PostgreSQL (ajustar según tus credenciales)
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
<<<<<<< HEAD
  password: process.env.DB_PASSWORD || '147ABC55',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '9134'),
=======
  password: process.env.DB_PASSWORD || '123456',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
>>>>>>> a6196d595eb927846a3f58427564aeea98536b3b
  database: process.env.DB_NAME || 'conexion360',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createAdminUser() {
  const client = await pool.connect();
<<<<<<< HEAD

  try {
    console.log('Conectado a PostgreSQL. Creando usuario administrador...');

=======
  
  try {
    console.log('Conectado a PostgreSQL. Creando usuario administrador...');
    
>>>>>>> a6196d595eb927846a3f58427564aeea98536b3b
    // Verificar si la tabla usuarios existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usuarios'
      );
    `);
<<<<<<< HEAD

    if (!tableCheck.rows[0].exists) {
      console.log('La tabla usuarios no existe. Creando tabla...');

=======
    
    if (!tableCheck.rows[0].exists) {
      console.log('La tabla usuarios no existe. Creando tabla...');
      
>>>>>>> a6196d595eb927846a3f58427564aeea98536b3b
      await client.query(`
        CREATE TABLE IF NOT EXISTS usuarios (
          id SERIAL PRIMARY KEY,
          nombre VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          rol VARCHAR(20) DEFAULT 'admin' NOT NULL,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          ultimo_acceso TIMESTAMP
        );
      `);
<<<<<<< HEAD

      console.log('Tabla usuarios creada correctamente.');
    }

=======
      
      console.log('Tabla usuarios creada correctamente.');
    }
    
>>>>>>> a6196d595eb927846a3f58427564aeea98536b3b
    // Verificar si el usuario admin ya existe
    const userCheck = await client.query(
      "SELECT * FROM usuarios WHERE email = 'admin@conexion360sac.com'"
    );
<<<<<<< HEAD

    if (userCheck.rows.length > 0) {
      console.log('El usuario admin ya existe. Actualizando contraseña...');

      // Hash de la contraseña 'admin123'
      const hashedPassword = await bcrypt.hash('admin123', 10);

=======
    
    if (userCheck.rows.length > 0) {
      console.log('El usuario admin ya existe. Actualizando contraseña...');
      
      // Hash de la contraseña 'admin123'
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
>>>>>>> a6196d595eb927846a3f58427564aeea98536b3b
      await client.query(
        `UPDATE usuarios 
         SET password = $1, 
             nombre = 'Administrador', 
             rol = 'superadmin' 
         WHERE email = 'admin@conexion360sac.com'`,
        [hashedPassword]
      );
<<<<<<< HEAD

      console.log('Contraseña de administrador actualizada correctamente.');
    } else {
      console.log('Creando nuevo usuario administrador...');

      // Hash de la contraseña 'admin123'
      const hashedPassword = await bcrypt.hash('admin123', 10);

=======
      
      console.log('Contraseña de administrador actualizada correctamente.');
    } else {
      console.log('Creando nuevo usuario administrador...');
      
      // Hash de la contraseña 'admin123'
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
>>>>>>> a6196d595eb927846a3f58427564aeea98536b3b
      await client.query(
        `INSERT INTO usuarios (nombre, email, password, rol) 
         VALUES ('Administrador', 'admin@conexion360sac.com', $1, 'superadmin')`,
        [hashedPassword]
      );
<<<<<<< HEAD

      console.log('Usuario administrador creado correctamente.');
    }

=======
      
      console.log('Usuario administrador creado correctamente.');
    }
    
>>>>>>> a6196d595eb927846a3f58427564aeea98536b3b
    // Verificar que el usuario se creó correctamente
    const userVerify = await client.query(
      "SELECT id, nombre, email, rol FROM usuarios WHERE email = 'admin@conexion360sac.com'"
    );
<<<<<<< HEAD

=======
    
>>>>>>> a6196d595eb927846a3f58427564aeea98536b3b
    if (userVerify.rows.length > 0) {
      console.log('Verificación exitosa:');
      console.log('- ID:', userVerify.rows[0].id);
      console.log('- Nombre:', userVerify.rows[0].nombre);
      console.log('- Email:', userVerify.rows[0].email);
      console.log('- Rol:', userVerify.rows[0].rol);
    } else {
      console.log('ERROR: No se pudo verificar la creación del usuario.');
    }
<<<<<<< HEAD

    console.log('\nInformación para inicio de sesión:');
    console.log('- Email: admin@conexion360sac.com');
    console.log('- Contraseña: admin123');

=======
    
    console.log('\nInformación para inicio de sesión:');
    console.log('- Email: admin@conexion360sac.com');
    console.log('- Contraseña: admin123');
    
>>>>>>> a6196d595eb927846a3f58427564aeea98536b3b
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

createAdminUser().catch(console.error);