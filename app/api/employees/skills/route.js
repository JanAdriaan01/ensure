import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch all available skills
export async function GET() {
  try {
    const result = await query(`
      SELECT * FROM skills 
      ORDER BY skill_name
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Add a new skill
export async function POST(request) {
  try {
    const { skill_name } = await request.json();
    
    if (!skill_name) {
      return NextResponse.json({ error: 'Skill name is required' }, { status: 400 });
    }
    
    const result = await query(
      'INSERT INTO skills (skill_name) VALUES ($1) RETURNING *',
      [skill_name]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Skill already exists' }, { status: 409 });
    }
    console.error('Error creating skill:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}