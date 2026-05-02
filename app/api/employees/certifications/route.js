import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch all available certifications
export async function GET() {
  try {
    const result = await query(`
      SELECT * FROM certifications 
      ORDER BY certification_name
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching certifications:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Add a new certification
export async function POST(request) {
  try {
    const { certification_name } = await request.json();
    
    if (!certification_name) {
      return NextResponse.json({ error: 'Certification name is required' }, { status: 400 });
    }
    
    const result = await query(
      'INSERT INTO certifications (certification_name) VALUES ($1) RETURNING *',
      [certification_name]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Certification already exists' }, { status: 409 });
    }
    console.error('Error creating certification:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}