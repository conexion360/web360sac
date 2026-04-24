// src/app/api/galeria/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener una imagen por ID
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
    
    const result = await db.query(
      'SELECT * FROM galeria WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Imagen no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener imagen de galería:', error);
    return NextResponse.json(
      { error: 'Error al obtener la imagen' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar una imagen (actualización parcial)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();
    const allowedFields = ['titulo', 'descripcion', 'imagen', 'thumbnail', 'orden', 'categoria', 'destacado'];
    const setParts: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        setParts.push(`${field} = $${paramIndex++}`);
        values.push(body[field]);
      }
    }

    if (setParts.length === 0) {
      return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 });
    }

    setParts.push('fecha_actualizacion = CURRENT_TIMESTAMP');
    values.push(id);

    const result = await db.query(
      `UPDATE galeria SET ${setParts.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Imagen no encontrada' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error al actualizar imagen de galería:', error.message);
    return NextResponse.json({ error: 'Error al actualizar la imagen' }, { status: 500 });
  }
}

// DELETE - Eliminar una imagen
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
    
    const result = await db.query(
      'DELETE FROM galeria WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Imagen no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Imagen eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar imagen de galería:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la imagen' },
      { status: 500 }
    );
  }
}