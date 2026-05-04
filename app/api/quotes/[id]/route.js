// app/api/quotes/[id]/route.js
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// Helper function to generate job number
async function generateJobNumber() {
  const year = new Date().getFullYear();
  const result = await query(`SELECT COUNT(*) as count FROM jobs`);
  const count = parseInt(result.rows[0].count) + 1;
  return `JOB-${year}-${String(count).padStart(4, '0')}`;
}

// GET - Fetch single quote
export async function GET(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const quoteId = parseInt(id);
    
    if (isNaN(quoteId)) {
      return NextResponse.json({ error: 'Invalid quote ID' }, { status: 400 });
    }
    
    const quoteResult = await query(`
      SELECT q.*, c.client_name
      FROM quotes q
      LEFT JOIN clients c ON q.client_id = c.id
      WHERE q.id = $1
    `, [quoteId]);
    
    if (quoteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    
    return NextResponse.json(quoteResult.rows[0]);
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update quote status with workflow rules AND create job for PO
export async function PATCH(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const quoteId = parseInt(id);
    const body = await request.json();
    const { action, po_number, po_date, rejection_reason } = body;
    
    if (isNaN(quoteId)) {
      return NextResponse.json({ error: 'Invalid quote ID' }, { status: 400 });
    }
    
    // Get current quote
    const quoteResult = await query(`SELECT * FROM quotes WHERE id = $1`, [quoteId]);
    if (quoteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    
    const quote = quoteResult.rows[0];
    const currentStatus = quote.status;
    const now = new Date();
    
    console.log('=== QUOTE UPDATE ===');
    console.log('Quote ID:', quoteId);
    console.log('Action:', action);
    console.log('Current Status:', currentStatus);
    
    // State machine logic
    switch (currentStatus) {
      case 'draft':
        if (action === 'send') {
          await query(
            `UPDATE quotes SET status = 'sent', sent_date = $1, updated_at = NOW() WHERE id = $2`,
            [now, quoteId]
          );
          return NextResponse.json({ success: true, message: 'Quote sent' });
        }
        if (action === 'delete') {
          await query(`DELETE FROM quotes WHERE id = $1`, [quoteId]);
          return NextResponse.json({ success: true, message: 'Quote deleted' });
        }
        return NextResponse.json({ error: `Cannot ${action} a draft quote. Only 'send' is allowed.` }, { status: 400 });
        
      case 'sent':
        if (action === 'mark_viewed') {
          await query(
            `UPDATE quotes SET status = 'pending', viewed_at = $1, updated_at = NOW() WHERE id = $2`,
            [now, quoteId]
          );
          return NextResponse.json({ success: true, message: 'Quote marked as viewed' });
        }
        if (action === 'approve') {
          await query(
            `UPDATE quotes SET status = 'approved', accepted_date = $1, updated_at = NOW() WHERE id = $2`,
            [now, quoteId]
          );
          return NextResponse.json({ success: true, message: 'Quote approved' });
        }
        if (action === 'reject') {
          await query(
            `UPDATE quotes SET status = 'rejected', rejected_date = $1, rejection_reason = $2, updated_at = NOW() WHERE id = $3`,
            [now, rejection_reason, quoteId]
          );
          return NextResponse.json({ success: true, message: 'Quote rejected' });
        }
        return NextResponse.json({ error: `Invalid action '${action}' for quote status '${currentStatus}'` }, { status: 400 });
        
      case 'pending':
        if (action === 'approve') {
          await query(
            `UPDATE quotes SET status = 'approved', accepted_date = $1, updated_at = NOW() WHERE id = $2`,
            [now, quoteId]
          );
          return NextResponse.json({ success: true, message: 'Quote approved' });
        }
        if (action === 'reject') {
          await query(
            `UPDATE quotes SET status = 'rejected', rejected_date = $1, rejection_reason = $2, updated_at = NOW() WHERE id = $3`,
            [now, rejection_reason, quoteId]
          );
          return NextResponse.json({ success: true, message: 'Quote rejected' });
        }
        return NextResponse.json({ error: `Invalid action '${action}' for quote status '${currentStatus}'` }, { status: 400 });
        
      case 'approved':
        if (action === 'receive_po') {
          if (!po_number) {
            return NextResponse.json({ error: 'PO number is required' }, { status: 400 });
          }
          
          console.log('=== CREATING JOB FOR PO ===');
          console.log('PO Number:', po_number);
          
          // Start transaction
          await query('BEGIN');
          
          try {
            // Step 1: Create the job
            const jobNumber = await generateJobNumber();
            console.log('Generated job number:', jobNumber);
            
            const jobResult = await query(
              `INSERT INTO jobs (
                job_number, 
                client_id, 
                description, 
                po_status, 
                completion_status,
                po_number, 
                po_amount, 
                total_budget, 
                quote_id, 
                created_at, 
                updated_at
              ) VALUES ($1, $2, $3, 'approved', 'not_started', $4, $5, $6, $7, NOW(), NOW())
              RETURNING id`,
              [
                jobNumber, 
                quote.client_id, 
                `Job from quote: ${quote.quote_number}`,
                po_number, 
                quote.total_amount, 
                quote.total_amount, 
                quoteId
              ]
            );
            
            const newJobId = jobResult.rows[0].id;
            console.log('✅ Job created with ID:', newJobId);
            
            // Step 2: Update quote with PO info and job_id
            await query(
              `UPDATE quotes SET 
                status = 'po_received', 
                po_number = $1, 
                po_date = $2,
                po_amount = $3,
                job_id = $4,
                accepted_date = $5,
                updated_at = NOW()
              WHERE id = $6`,
              [po_number, po_date || now.toISOString().split('T')[0], quote.total_amount, newJobId, now, quoteId]
            );
            
            console.log('✅ Quote updated with job_id:', newJobId);
            
            // Commit transaction
            await query('COMMIT');
            
            return NextResponse.json({ 
              success: true, 
              message: `PO #${po_number} received! Job created successfully.`,
              job_id: newJobId,
              job_number: jobNumber
            });
            
          } catch (error) {
            await query('ROLLBACK');
            console.error('Job creation error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
          }
        }
        return NextResponse.json({ error: `Cannot ${action} an approved quote. Only 'receive_po' is allowed.` }, { status: 400 });
        
      case 'po_received':
        // If quote has PO but no job_id, try to create job
        if (!quote.job_id) {
          console.log('Quote has PO but missing job_id - attempting to create job');
          
          await query('BEGIN');
          try {
            const jobNumber = await generateJobNumber();
            const jobResult = await query(
              `INSERT INTO jobs (
                job_number, client_id, description, po_status, completion_status,
                po_number, po_amount, total_budget, quote_id, created_at, updated_at
              ) VALUES ($1, $2, $3, 'approved', 'not_started', $4, $5, $6, $7, NOW(), NOW())
              RETURNING id`,
              [jobNumber, quote.client_id, `Job from quote: ${quote.quote_number}`, 
               quote.po_number, quote.total_amount, quote.total_amount, quoteId]
            );
            
            const newJobId = jobResult.rows[0].id;
            await query(`UPDATE quotes SET job_id = $1, updated_at = NOW() WHERE id = $2`, [newJobId, quoteId]);
            await query('COMMIT');
            
            return NextResponse.json({ 
              success: true, 
              message: 'Job created successfully for existing PO',
              job_id: newJobId
            });
          } catch (error) {
            await query('ROLLBACK');
            return NextResponse.json({ error: error.message }, { status: 500 });
          }
        }
        return NextResponse.json({ error: 'Quote is finalized. No further changes allowed.' }, { status: 400 });
        
      case 'rejected':
        return NextResponse.json({ error: 'Rejected quotes cannot be modified.' }, { status: 400 });
        
      default:
        return NextResponse.json({ error: `Unknown status: ${currentStatus}` }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error updating quote:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete quote
export async function DELETE(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const quoteId = parseInt(id);
    
    const quoteResult = await query(`SELECT status FROM quotes WHERE id = $1`, [quoteId]);
    if (quoteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    
    const status = quoteResult.rows[0].status;
    if (status !== 'draft' && status !== 'pending') {
      return NextResponse.json({ error: 'Only draft or pending quotes can be deleted' }, { status: 400 });
    }
    
    await query(`DELETE FROM quote_items WHERE quote_id = $1`, [quoteId]);
    await query(`DELETE FROM quotes WHERE id = $1`, [quoteId]);
    
    return NextResponse.json({ success: true, message: 'Quote deleted' });
  } catch (error) {
    console.error('Error deleting quote:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}