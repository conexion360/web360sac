// src/app/api/generos/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener un género por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }
<<<<<<< HEAD

    console.log(`Obteniendo género con ID: ${id}`);

=======
    
>>>>>>> a6196d595eb927846a3f58427564aeea98536b3b
    const result = await db.query(
      'SELECT * FROM generos WHERE id = $1',
      [id]
    );
<<<<<<< HEAD

=======
    
>>>>>>> a6196d595eb927846a3f58427564aeea98536b3b
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Género no encontrado' },
        { status: 404 }
      );
    }
<<<<<<< HEAD

=======
    
>>>>>>> a6196d595eb927846a3f58427564aeea98536b3b
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener género:', error);
    return NextResponse.json(
      { error: 'Error al obtener el género' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un género
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }
<<<<<<< HEAD

    const { nombre, descripcion, imagen, icono, orden, activo } = await request.json();

    console.log(`Actualizando género con ID: ${id}`, {
      nombre,
      descripcion,
      imagen: imagen ? "Imagen proporcionada" : "Sin imagen",
      icono,
      orden,
      activo
    });

    // Construir la consulta SQL dinámicamente basada en los campos proporcionados
    let query = `UPDATE generos SET `;
    const updateFields = [];
    const queryParams = [];
    let paramIndex = 1;

    if (nombre !== undefined) {
      updateFields.push(`nombre = $${paramIndex++}`);
      queryParams.push(nombre);
    }

    if (descripcion !== undefined) {
      updateFields.push(`descripcion = $${paramIndex++}`);
      queryParams.push(descripcion);
    }

    if (imagen !== undefined) {
      updateFields.push(`imagen = $${paramIndex++}`);
      queryParams.push(imagen);
    }

    if (icono !== undefined) {
      updateFields.push(`icono = $${paramIndex++}`);
      queryParams.push(icono);
    }

    if (orden !== undefined) {
      updateFields.push(`orden = $${paramIndex++}`);
      queryParams.push(orden);
    }

    if (activo !== undefined) {
      updateFields.push(`activo = $${paramIndex++}`);
      queryParams.push(activo);
    }

    // Añadir fecha de actualización
    updateFields.push(`fecha_actualizacion = CURRENT_TIMESTAMP`);

    // Si no hay campos para actualizar, devolver error
    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No se proporcionaron campos para actualizar' },
        { status: 400 }
      );
    }

    query += updateFields.join(', ');
    query += ` WHERE id = $${paramIndex} RETURNING *`;
    queryParams.push(id);

    console.log("Consulta SQL:", query);
    console.log("Parámetros:", queryParams);

    const result = await db.query(query, queryParams);

=======
    
    const { nombre, descripcion, imagen, icono, orden, activo } = await request.json();
    
    const result = await db.query(
      `UPDATE generos 
       SET nombre = $1, descripcion = $2, imagen = $3, icono = $4, 
           orden = $5, activo = $6, fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [nombre, descripcion, imagen, icono, orden, activo, id]
    );
    
>>>>>>> a6196d595eb927846a3f58427564aeea98536b3b
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Género no encontrado' },
        { status: 404 }
      );
    }
<<<<<<< HEAD

=======
    
>>>>>>> a6196d595eb927846a3f58427564aeea98536b3b
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar género:', error);
    return NextResponse.json(
<<<<<<< HEAD
      { error: 'Error al actualizar el género: ' + (error instanceof Error ? error.message : 'Error desconocido') },
=======
      { error: 'Error al actualizar el género' },
>>>>>>> a6196d595eb927846a3f58427564aeea98536b3b
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un género
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }
<<<<<<< HEAD

=======
    
>>>>>>> a6196d595eb927846a3f58427564aeea98536b3b
    // Primero verificar si hay música que use este género
    const checkResult = await db.query(
      'SELECT COUNT(*) FROM musica WHERE genero_id = $1',
      [id]
    );
<<<<<<< HEAD

=======
    
>>>>>>> a6196d595eb927846a3f58427564aeea98536b3b
    if (parseInt(checkResult.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar este género porque está siendo utilizado por canciones' },
        { status: 400 }
      );
    }
<<<<<<< HEAD

=======
    
>>>>>>> a6196d595eb927846a3f58427564aeea98536b3b
    const result = await db.query(
      'DELETE FROM generos WHERE id = $1 RETURNING id',
      [id]
    );
<<<<<<< HEAD

=======
    
>>>>>>> a6196d595eb927846a3f58427564aeea98536b3b
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Género no encontrado' },
        { status: 404 }
      );
    }
<<<<<<< HEAD

=======
    
>>>>>>> a6196d595eb927846a3f58427564aeea98536b3b
    return NextResponse.json({ success: true, message: 'Género eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar género:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el género' },
      { status: 500 }
    );
  }
}