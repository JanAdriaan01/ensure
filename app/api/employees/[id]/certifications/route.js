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
        c.id,
        c.certification_name,
        ec.certified_date,
        ec.expiry_date,
        CASE 
          WHEN ec.expiry_date IS NULL THEN 'No Expiry'
          WHEN ec.expiry_date < CURRENT_DATE THEN 'expired'
          WHEN ec.expiry_date < CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'
          ELSE 'valid'
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
    const { certifications } = body;
    
    if (!certifications || !Array.isArray(certifications)) {
      return NextResponse.json({ error: 'Certifications array is required' }, { status: 400 });
    }

    await query('BEGIN');
    
    try {
      await query('DELETE FROM employee_certifications WHERE employee_id = $1', [employeeId]);
      
      for (const cert of certifications) {
        let certId;
        
        if (typeof cert === 'number') {
          certId = cert;
        } else {
          const certResult = await query(
            'SELECT id FROM certifications WHERE certification_name = $1',
            [cert]
          );
          if (certResult.rows.length > 0) {
            certId = certResult.rows[0].id;
          } else {
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