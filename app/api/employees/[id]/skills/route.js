import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

// GET - Fetch all skills for a specific employee
export async function GET(request, { params }) {
  try {
    const employeeId = parseInt(params.id);
    
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

// POST - Replace all skills for a specific employee (bulk update)
export async function POST(request, { params }) {
  try {
    const employeeId = parseInt(params.id);
    
    if (isNaN(employeeId)) {
      return NextResponse.json({ error: 'Invalid employee ID' }, { status: 400 });
    }

    const body = await request.json();
    const { skills } = body; // Array of { skill_id, years_experience } or { skill_name, years_experience }
    
    if (!skills || !Array.isArray(skills)) {
      return NextResponse.json({ error: 'Skills array is required' }, { status: 400 });
    }

    // Start transaction
    await query('BEGIN');
    
    try {
      // Delete existing skills for this employee
      await query('DELETE FROM employee_skills WHERE employee_id = $1', [employeeId]);
      
      // Insert new skills
      for (const skill of skills) {
        let skillId;
        
        if (skill.skill_id) {
          // Already have the ID
          skillId = skill.skill_id;
        } else if (skill.skill_name) {
          // Find or create skill by name
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
          continue; // Skip invalid entries
        }
        
        await query(
          `INSERT INTO employee_skills (employee_id, skill_id, years_experience)
           VALUES ($1, $2, $3)`,
          [employeeId, skillId, skill.years_experience || 0]
        );
      }
      
      await query('COMMIT');
      
      // Fetch and return updated skills
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

// PUT - Update a specific skill for an employee (years of experience)
export async function PUT(request, { params }) {
  try {
    const employeeId = parseInt(params.id);
    const { skill_id, years_experience } = await request.json();
    
    if (isNaN(employeeId)) {
      return NextResponse.json({ error: 'Invalid employee ID' }, { status: 400 });
    }
    
    if (!skill_id) {
      return NextResponse.json({ error: 'Skill ID is required' }, { status: 400 });
    }
    
    // Check if employee has this skill
    const exists = await query(
      'SELECT * FROM employee_skills WHERE employee_id = $1 AND skill_id = $2',
      [employeeId, skill_id]
    );
    
    if (exists.rows.length === 0) {
      return NextResponse.json({ error: 'Employee does not have this skill' }, { status: 404 });
    }
    
    await query(
      `UPDATE employee_skills 
       SET years_experience = $1
       WHERE employee_id = $2 AND skill_id = $3`,
      [years_experience || 0, employeeId, skill_id]
    );
    
    return NextResponse.json({ success: true, message: 'Skill updated successfully' });
  } catch (error) {
    console.error('Error updating employee skill:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove a specific skill from an employee
export async function DELETE(request, { params }) {
  try {
    const employeeId = parseInt(params.id);
    const url = new URL(request.url);
    const skillId = url.searchParams.get('skill_id');
    
    if (isNaN(employeeId)) {
      return NextResponse.json({ error: 'Invalid employee ID' }, { status: 400 });
    }
    
    if (!skillId) {
      return NextResponse.json({ error: 'Skill ID is required' }, { status: 400 });
    }
    
    await query(
      'DELETE FROM employee_skills WHERE employee_id = $1 AND skill_id = $2',
      [employeeId, parseInt(skillId)]
    );
    
    return NextResponse.json({ success: true, message: 'Skill removed from employee successfully' });
  } catch (error) {
    console.error('Error removing employee skill:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}