export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

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

// PATCH - Update quote status with workflow rules
export async function PATCH(request, { params }) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const quoteId = parseInt(id);
    const body = await request.json();
    const { action, po_number, po_date } = body;
    
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
    let newStatus = currentStatus;
    let updateFields = {};
    
    // State machine logic - define allowed transitions
    switch (currentStatus) {
      case 'draft':
        if (action === 'send') {
          newStatus = 'sent';
          updateFields = { status: newStatus, sent_date: now };
        } else if (action === 'delete') {
          await query(`DELETE FROM quotes WHERE id = $1`, [quoteId]);
          return NextResponse.json({ success: true, message: 'Quote deleted' });
        } else {
          return NextResponse.json({ error: `Cannot ${action} a draft quote. Only 'send' is allowed.` }, { status: 400 });
        }
        break;
        
      case 'sent':
        if (action === 'mark_viewed') {
          newStatus = 'pending';
          updateFields = { status: newStatus, viewed_at: now };
        } else if (action === 'approve') {
          newStatus = 'approved';
          updateFields = { status: newStatus, accepted_date: now };
        } else if (action === 'reject') {
          newStatus = 'rejected';
          updateFields = { status: newStatus, rejected_date: now, rejection_reason: body.rejection_reason || null };
        } else {
          return NextResponse.json({ error: `Invalid action '${action}' for quote status '${currentStatus}'` }, { status: 400 });
        }
        break;
        
      case 'pending':
        if (action === 'approve') {
          newStatus = 'approved';
          updateFields = { status: newStatus, accepted_date: now };
        } else if (action === 'reject') {
          newStatus = 'rejected';
          updateFields = { status: newStatus, rejected_date: now, rejection_reason: body.rejection_reason || null };
        } else {
          return NextResponse.json({ error: `Invalid action '${action}' for quote status '${currentStatus}'` }, { status: 400 });
        }
        break;
        
      case 'approved':
        if (action === 'receive_po') {
          if (!po_number) {
            return NextResponse.json({ error: 'PO number is required' }, { status: 400 });
          }
          newStatus = 'po_received';
          updateFields = { 
            status: newStatus, 
            po_number: po_number, 
            po_date: po_date || now.toISOString().split('T')[0],
            accepted_date: now
          };
        } else {
          return NextResponse.json({ error: `Cannot ${action} an approved quote. Only 'receive_po' is allowed.` }, { status: 400 });
        }
        break;
        
      case 'po_received':
        return NextResponse.json({ error: 'Quote is finalized. No further changes allowed.' }, { status: 400 });
        
      case 'rejected':
        return NextResponse.json({ error: 'Rejected quotes cannot be modified.' }, { status: 400 });
        
      default:
        return NextResponse.json({ error: `Unknown status: ${currentStatus}` }, { status: 400 });
    }
    
    // Build update query
    const setClause = Object.keys(updateFields).map((key, idx) => `${key} = $${idx + 1}`).join(', ');
    const values = Object.values(updateFields);
    values.push(quoteId);
    
    await query(
      `UPDATE quotes SET ${setClause}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
      values
    );
    
    return NextResponse.json({
      success: true,
      old_status: currentStatus,
      new_status: newStatus,
      message: `Quote ${action === 'receive_po' ? 'PO received and ' + newStatus : newStatus}`
    });
    
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
    
    await query(`DELETE FROM quotes WHERE id = $1`, [quoteId]);
    
    return NextResponse.json({ success: true, message: 'Quote deleted' });
  } catch (error) {
    console.error('Error deleting quote:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}