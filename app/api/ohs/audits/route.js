import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

// GET - Fetch all audits
export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!hasPermission(auth.role, 'ohs:view')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const result = await query(`
      SELECT 
        a.*,
        u.name as conducted_by_name,
        COUNT(af.id) as findings_count,
        COUNT(CASE WHEN af.status = 'open' THEN 1 END) as open_findings
      FROM ohs_audits a
      LEFT JOIN users u ON a.conducted_by = u.id
      LEFT JOIN ohs_audit_findings af ON a.id = af.audit_id
      GROUP BY a.id, u.name
      ORDER BY a.audit_date DESC
    `);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching audits:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new audit
export async function POST(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!hasPermission(auth.role, 'ohs:create')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const body = await request.json();
    const {
      audit_date,
      audit_type,
      scope,
      findings,
      recommendations,
      status,
    } = body;
    
    if (!audit_date || !audit_type) {
      return NextResponse.json(
        { error: 'Audit date and type are required' },
        { status: 400 }
      );
    }
    
    const result = await query(
      `INSERT INTO ohs_audits (
        audit_date, audit_type, scope, findings, recommendations,
        status, conducted_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        audit_date, audit_type, scope || null, findings || null,
        recommendations || null, status || 'draft', auth.userId
      ]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating audit:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}