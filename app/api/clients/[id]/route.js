// app/api/clients/[id]/route.js
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
    const clientId = parseInt(id);
    
    if (isNaN(clientId)) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }
    
    const result = await query(
      `SELECT 
        c.id,
        c.client_name,
        c.contact_person,
        c.client_address,
        c.signup_date,
        c.email,
        c.phone,
        c.created_at,
        COUNT(DISTINCT j.id) as total_jobs,
        COALESCE(SUM(j.po_amount), 0) as total_value
      FROM clients c
      LEFT JOIN jobs j ON c.id = j.client_id
      WHERE c.id = $1
      GROUP BY c.id`,
      [clientId]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('GET client by id error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const clientId = parseInt(id);
    const body = await request.json();
    
    const { 
      client_name, 
      contact_person, 
      email, 
      phone, 
      client_address, 
      signup_date 
    } = body;
    
    const result = await query(
      `UPDATE clients SET 
        client_name = COALESCE($1, client_name),
        contact_person = COALESCE($2, contact_person),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        client_address = COALESCE($5, client_address),
        signup_date = COALESCE($6, signup_date)
       WHERE id = $7 
       RETURNING *`,
      [client_name, contact_person, email, phone, client_address, signup_date, clientId]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('PUT client error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const clientId = parseInt(id);
    
    if (isNaN(clientId)) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }
    
    // Get client name for error message
    const clientResult = await query(`SELECT client_name FROM clients WHERE id = $1`, [clientId]);
    if (clientResult.rows.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    const clientName = clientResult.rows[0].client_name;
    
    // Check if client has jobs
    const jobCheck = await query(`
      SELECT COUNT(*) as count, array_agg(job_number) as jobs 
      FROM jobs 
      WHERE client_id = $1
    `, [clientId]);
    const jobCount = parseInt(jobCheck.rows[0].count);
    const jobList = jobCheck.rows[0].jobs || [];
    
    // Check if client has quotes
    const quoteCheck = await query(`
      SELECT COUNT(*) as count, array_agg(quote_number) as quotes 
      FROM quotes 
      WHERE client_id = $1
    `, [clientId]);
    const quoteCount = parseInt(quoteCheck.rows[0].count);
    const quoteList = quoteCheck.rows[0].quotes || [];
    
    // If client has related records, return detailed error
    if (jobCount > 0) {
      return NextResponse.json({ 
        error: `Cannot delete "${clientName}". This client has ${jobCount} active job(s): ${jobList.join(', ')}. Please delete or reassign these jobs first.`,
        hasJobs: true,
        jobCount: jobCount,
        jobList: jobList
      }, { status: 400 });
    }
    
    if (quoteCount > 0) {
      return NextResponse.json({ 
        error: `Cannot delete "${clientName}". This client has ${quoteCount} active quote(s): ${quoteList.join(', ')}. Please delete or reassign these quotes first.`,
        hasQuotes: true,
        quoteCount: quoteCount,
        quoteList: quoteList
      }, { status: 400 });
    }
    
    // If no related records, delete the client
    await query(`DELETE FROM clients WHERE id = $1`, [clientId]);
    
    return NextResponse.json({ 
      success: true, 
      message: `Client "${clientName}" deleted successfully` 
    });
    
  } catch (error) {
    console.error('DELETE client error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}