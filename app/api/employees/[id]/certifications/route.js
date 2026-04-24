import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db.js';

// GET - Fetch all certifications for a specific employee
export async function GET(request, { params }) {
  try {
    const employeeId = parseInt(params.id);
    
    if (isNaN(employeeId)) {
      return NextResponse.json({ error: 'Invalid employee ID' }, { status: 400 });
    }

    const result = await query(`
      SELECT 
        c.id,
        c.certification_name,
        ec.certified_date,
        ec.expiry_date,
        CASE 
          WHEN ec.expiry_date IS NULL THEN 'No Expiry'
          WHEN ec.expiry_date < CURRENT_DATE THEN 'Expired'
          WHEN ec.expiry_date < CURRENT_DATE + INTERVAL '30 days' THEN 'Expiring Soon'
          ELSE 'Valid'
        END as status
      FROM employee_certifications ec
      JOIN certifications c ON ec.certification_id = c.id
      WHERE ec.employee_id = $1
      ORDER BY c.certification_name
    `, [employeeId]);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching employee certifications:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Replace all certifications for a specific employee
export async function POST(request, { params }) {
  try {
    const employeeId = parseInt(params.id);
    
    if (isNaN(employeeId)) {
      return NextResponse.json({ error: 'Invalid employee ID' }, { status: 400 });
    }

    const body = await request.json();
    const { certifications } = body; // Array of certification names or IDs
    
    if (!certifications || !Array.isArray(certifications)) {
      return NextResponse.json({ error: 'Certifications array is required' }, { status: 400 });
    }

    // Start a transaction
    await query('BEGIN');
    
    try {
      // Delete existing certifications for this employee
      await query('DELETE FROM employee_certifications WHERE employee_id = $1', [employeeId]);
      
      // Insert new certifications
      for (const cert of certifications) {
        let certId;
        
        // Check if cert is an ID or name
        if (typeof cert === 'number') {
          certId = cert;
        } else {
          // Find certification ID by name
          const certResult = await query(
            'SELECT id FROM certifications WHERE certification_name = $1',
            [cert]
          );
          if (certResult.rows.length > 0) {
            certId = certResult.rows[0].id;
          } else {
            // Optionally create new certification
            const newCert = await query(
              'INSERT INTO certifications (certification_name) VALUES ($1) RETURNING id',
              [cert]
            );
            certId = newCert.rows[0].id;
          }
        }
        
        if (certId) {
          await query(
            `INSERT INTO employee_certifications (employee_id, certification_id, certified_date)
             VALUES ($1, $2, CURRENT_DATE)`,
            [employeeId, certId]
          );
        }
      }
      
      await query('COMMIT');
      
      // Fetch and return updated certifications
      const updated = await query(`
        SELECT c.certification_name, ec.certified_date
        FROM employee_certifications ec
        JOIN certifications c ON ec.certification_id = c.id
        WHERE ec.employee_id = $1
      `, [employeeId]);
      
      return NextResponse.json({ 
        success: true, 
        certifications: updated.rows,
        message: 'Certifications updated successfully'
      });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error updating employee certifications:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update a specific certification (e.g., add expiry date)
export async function PUT(request, { params }) {
  try {
    const employeeId = parseInt(params.id);
    const { certification_id, expiry_date, certified_date } = await request.json();
    
    if (isNaN(employeeId)) {
      return NextResponse.json({ error: 'Invalid employee ID' }, { status: 400 });
    }
    
    if (!certification_id) {
      return NextResponse.json({ error: 'Certification ID is required' }, { status: 400 });
    }
    
    // Check if employee has this certification
    const exists = await query(
      'SELECT * FROM employee_certifications WHERE employee_id = $1 AND certification_id = $2',
      [employeeId, certification_id]
    );
    
    if (exists.rows.length === 0) {
      return NextResponse.json({ error: 'Employee does not have this certification' }, { status: 404 });
    }
    
    // Update certification details
    await query(
      `UPDATE employee_certifications 
       SET certified_date = COALESCE($1, certified_date),
           expiry_date = $2
       WHERE employee_id = $3 AND certification_id = $4`,
      [certified_date, expiry_date, employeeId, certification_id]
    );
    
    return NextResponse.json({ success: true, message: 'Certification updated successfully' });
  } catch (error) {
    console.error('Error updating certification:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove a specific certification from an employee
export async function DELETE(request, { params }) {
  try {
    const employeeId = parseInt(params.id);
    const url = new URL(request.url);
    const certificationId = url.searchParams.get('certification_id');
    
    if (isNaN(employeeId)) {
      return NextResponse.json({ error: 'Invalid employee ID' }, { status: 400 });
    }
    
    if (!certificationId) {
      return NextResponse.json({ error: 'Certification ID is required' }, { status: 400 });
    }
    
    await query(
      'DELETE FROM employee_certifications WHERE employee_id = $1 AND certification_id = $2',
      [employeeId, parseInt(certificationId)]
    );
    
    return NextResponse.json({ success: true, message: 'Certification removed successfully' });
  } catch (error) {
    console.error('Error removing certification:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}