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
    console.error('GET client error:', error);
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
    
    // First, check if client exists
    const clientCheck = await query(`SELECT id, client_name FROM clients WHERE id = $1`, [clientId]);
    if (clientCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    
    const clientName = clientCheck.rows[0].client_name;
    
    // Check for jobs
    const jobsCount = await query(`SELECT COUNT(*) as count FROM jobs WHERE client_id = $1`, [clientId]);
    const hasJobs = parseInt(jobsCount.rows[0].count) > 0;
    
    // Check for quotes
    const quotesCount = await query(`SELECT COUNT(*) as count FROM quotes WHERE client_id = $1`, [clientId]);
    const hasQuotes = parseInt(quotesCount.rows[0].count) > 0;
    
    // If client has related records, prevent deletion
    if (hasJobs || hasQuotes) {
      let errorMessage = `Cannot delete "${clientName}".`;
      if (hasJobs) {
        errorMessage += ` This client has ${jobsCount.rows[0].count} job(s).`;
      }
      if (hasQuotes) {
        errorMessage += ` This client has ${quotesCount.rows[0].count} quote(s).`;
      }
      errorMessage += ` Please delete or reassign these records first.`;
      
      return NextResponse.json({ 
        error: errorMessage,
        hasJobs: hasJobs,
        hasQuotes: hasQuotes,
        jobCount: parseInt(jobsCount.rows[0].count),
        quoteCount: parseInt(quotesCount.rows[0].count)
      }, { status: 400 });
    }
    
    // No related records, safe to delete
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