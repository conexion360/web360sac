// setup-imagekit.js
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración de la base de datos
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function setupImageKitMigration() {
    console.log('🚀 Iniciando configuración de ImageKit...');

    try {
        // Conectar a la base de datos
        const client = await pool.connect();
        console.log('✅ Conectado a la base de datos');

        // Leer y ejecutar el script de migración
        const migrationPath = path.join(__dirname, 'setup-imagekit-migration.sql');

        if (fs.existsSync(migrationPath)) {
            const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

            // Ejecutar la migración
            await client.query(migrationSQL);
            console.log('✅ Migración de ImageKit aplicada correctamente');
        } else {
            console.log('⚠️  Archivo de migración no encontrado, aplicando manualmente...');

            // Migración manual si no existe el archivo
            const migrations = [
                `ALTER TABLE hero_slides 
         ADD COLUMN IF NOT EXISTS imagekit_file_id_desktop VARCHAR(255),
         ADD COLUMN IF NOT EXISTS imagekit_file_id_mobile VARCHAR(255);`,

                `ALTER TABLE galeria 
         ADD COLUMN IF NOT EXISTS imagekit_file_id VARCHAR(255);`,

                `ALTER TABLE generos 
         ADD COLUMN IF NOT EXISTS imagekit_file_id VARCHAR(255);`,

                `ALTER TABLE configuracion 
         ADD COLUMN IF NOT EXISTS imagekit_logo_file_id VARCHAR(255),
         ADD COLUMN IF NOT EXISTS imagekit_favicon_file_id VARCHAR(255);`,

                `ALTER TABLE sobre_nosotros 
         ADD COLUMN IF NOT EXISTS imagekit_file_id VARCHAR(255);`,

                `ALTER TABLE musica 
         ADD COLUMN IF NOT EXISTS imagekit_cover_file_id VARCHAR(255),
         ADD COLUMN IF NOT EXISTS imagekit_audio_file_id VARCHAR(255);`
            ];

            for (const migration of migrations) {
                try {
                    await client.query(migration);
                    console.log('✅ Migración aplicada');
                } catch (error) {
                    console.log('⚠️  Migración ya aplicada o error:', error.message);
                }
            }
        }

        // Verificar las variables de entorno de ImageKit
        const requiredEnvVars = [
            'IMAGEKIT_PUBLIC_KEY',
            'IMAGEKIT_PRIVATE_KEY',
            'IMAGEKIT_URL_ENDPOINT'
        ];

        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

        if (missingVars.length > 0) {
            console.warn('⚠️  Variables de entorno faltantes para ImageKit:', missingVars);
            console.log('🔧 Asegúrate de configurar estas variables en Railway:');
            console.log('   IMAGEKIT_PUBLIC_KEY=public_nJIM9VeYDWasBIUi3ixlGpRzZz4=');
            console.log('   IMAGEKIT_PRIVATE_KEY=private_OiWhfp78ou3Prah0GLZ67xoLE98=');
            console.log('   IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/qpdyvnppk');
        } else {
            console.log('✅ Variables de entorno de ImageKit configuradas correctamente');
        }

        client.release();
        console.log('🎉 Configuración de ImageKit completada');

    } catch (error) {
        console.error('❌ Error durante la configuración de ImageKit:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    setupImageKitMigration();
}

module.exports = { setupImageKitMigration };