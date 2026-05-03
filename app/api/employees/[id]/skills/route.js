export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const employeeId = parseInt(id);
    
    if (isNaN(employeeId)) {
      return NextResponse.json({ error: 'Invalid employee ID' }, { status: 400 });
    }

    const result = await query(`
      SELECT 
        s.id,
        s.skill_name,
        es.years_experience,
        CASE 
          WHEN es.years_experience >= 5 THEN 'Expert'
          WHEN es.years_experience >= 3 THEN 'Advanced'
          WHEN es.years_experience >= 1 THEN 'Intermediate'
          WHEN es.years_experience > 0 THEN 'Beginner'
          ELSE 'Not Rated'
        END as proficiency_level
      FROM employee_skills es
      JOIN skills s ON es.skill_id = s.id
      WHERE es.employee_id = $1
      ORDER BY es.years_experience DESC, s.skill_name
    `, [employeeId]);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching employee skills:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const employeeId = parseInt(id);
    
    if (isNaN(employeeId)) {
      return NextResponse.json({ error: 'Invalid employee ID' }, { status: 400 });
    }

    const body = await request.json();
    const { skills } = body;
    
    if (!skills || !Array.isArray(skills)) {
      return NextResponse.json({ error: 'Skills array is required' }, { status: 400 });
    }

    await query('BEGIN');
    
    try {
      await query('DELETE FROM employee_skills WHERE employee_id = $1', [employeeId]);
      
      for (const skill of skills) {
        let skillId;
        
        if (skill.skill_id) {
          skillId = skill.skill_id;
        } else if (skill.skill_name) {
          const existingSkill = await query(
            'SELECT id FROM skills WHERE skill_name = $1',
            [skill.skill_name]
          );
          if (existingSkill.rows.length > 0) {
            skillId = existingSkill.rows[0].id;
          } else {
            const newSkill = await query(
              'INSERT INTO skills (skill_name) VALUES ($1) RETURNING id',
              [skill.skill_name]
            );
            skillId = newSkill.rows[0].id;
          }
        } else {
          continue;
        }
        
        await query(
          `INSERT INTO employee_skills (employee_id, skill_id, years_experience)
           VALUES ($1, $2, $3)`,
          [employeeId, skillId, skill.years_experience || 0]
        );
      }
      
      await query('COMMIT');
      
      const updated = await query(`
        SELECT s.skill_name, es.years_experience
        FROM employee_skills es
        JOIN skills s ON es.skill_id = s.id
        WHERE es.employee_id = $1
      `, [employeeId]);
      
      return NextResponse.json({ 
        success: true, 
        skills: updated.rows,
        message: 'Skills updated successfully'
      });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error updating employee skills:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}