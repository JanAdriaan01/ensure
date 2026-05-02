import { NextResponse } from 'next/server';

// Mock data - replace with database queries later
const invoices = [
  {
    id: 1,
    invoice_number: 'INV-2024-001',
    client_name: 'ABC Construction',
    client_id: 1,
    job_number: 'LC-2024-001',
    job_id: 1,
    amount: 25000,
    vat_rate: 15,
    vat_amount: 3750,
    total_amount: 28750,
    status: 'paid',
    issue_date: '2024-02-01',
    due_date: '2024-03-01',
    paid_date: '2024-02-28',
    payment_method: 'bank_transfer',
    notes: '',
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-28T14:30:00Z'
  },
  {
    id: 2,
    invoice_number: 'INV-2024-002',
    client_name: 'ABC Construction',
    client_id: 1,
    job_number: 'LC-2024-001',
    job_id: 1,
    amount: 20000,
    vat_rate: 15,
    vat_amount: 3000,
    total_amount: 23000,
    status: 'pending',
    issue_date: '2024-03-01',
    due_date: '2024-04-01',
    paid_date: null,
    payment_method: null,
    notes: '',
    created_at: '2024-03-01T09:00:00Z',
    updated_at: '2024-03-01T09:00:00Z'
  },
  {
    id: 3,
    invoice_number: 'INV-2024-003',
    client_name: 'XYZ Developers',
    client_id: 2,
    job_number: 'LC-2024-002',
    job_id: 2,
    amount: 50000,
    vat_rate: 15,
    vat_amount: 7500,
    total_amount: 57500,
    status: 'overdue',
    issue_date: '2024-02-15',
    due_date: '2024-03-15',
    paid_date: null,
    payment_method: null,
    notes: 'Second reminder sent',
    created_at: '2024-02-15T11:00:00Z',
    updated_at: '2024-03-16T08:00:00Z'
  },
  {
    id: 4,
    invoice_number: 'INV-2024-004',
    client_name: 'Smith Properties',
    client_id: 3,
    job_number: 'LC-2024-003',
    job_id: 3,
    amount: 15000,
    vat_rate: 15,
    vat_amount: 2250,
    total_amount: 17250,
    status: 'draft',
    issue_date: null,
    due_date: null,
    paid_date: null,
    payment_method: null,
    notes: 'Awaiting approval',
    created_at: '2024-03-20T14:00:00Z',
    updated_at: '2024-03-20T14:00:00Z'
  },
  {
    id: 5,
    invoice_number: 'INV-2024-005',
    client_name: 'Johnson Holdings',
    client_id: 4,
    job_number: 'LC-2024-004',
    job_id: 4,
    amount: 32500,
    vat_rate: 15,
    vat_amount: 4875,
    total_amount: 37375,
    status: 'pending',
    issue_date: '2024-03-10',
    due_date: '2024-04-10',
    paid_date: null,
    payment_method: null,
    notes: '',
    created_at: '2024-03-10T10:30:00Z',
    updated_at: '2024-03-10T10:30:00Z'
  }
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const job_id = searchParams.get('job_id');
    const client_id = searchParams.get('client_id');
    
    let filteredInvoices = [...invoices];
    
    if (status && status !== 'all') {
      filteredInvoices = filteredInvoices.filter(inv => inv.status === status);
    }
    
    if (job_id) {
      filteredInvoices = filteredInvoices.filter(inv => inv.job_id === parseInt(job_id));
    }
    
    if (client_id) {
      filteredInvoices = filteredInvoices.filter(inv => inv.client_id === parseInt(client_id));
    }
    
    const stats = {
      total_invoiced: invoices.reduce((sum, inv) => sum + inv.total_amount, 0),
      total_paid: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total_amount, 0),
      total_pending: invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.total_amount, 0),
      total_overdue: invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.total_amount, 0),
      total_draft: invoices.filter(inv => inv.status === 'draft').reduce((sum, inv) => sum + inv.total_amount, 0),
      count_paid: invoices.filter(inv => inv.status === 'paid').length,
      count_pending: invoices.filter(inv => inv.status === 'pending').length,
      count_overdue: invoices.filter(inv => inv.status === 'overdue').length,
      count_draft: invoices.filter(inv => inv.status === 'draft').length
    };
    
    return NextResponse.json({
      success: true,
      data: filteredInvoices,
      stats: stats,
      total: filteredInvoices.length
    });
    
  } catch (error) {
    console.error('GET /api/invoices error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      data: []
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    const newInvoice = {
      id: invoices.length + 1,
      invoice_number: `INV-2024-00${invoices.length + 1}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...body
    };
    
    invoices.push(newInvoice);
    
    return NextResponse.json({
      success: true,
      data: newInvoice
    }, { status: 201 });
    
  } catch (error) {
    console.error('POST /api/invoices error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, status, paid_date } = body;
    
    const invoiceIndex = invoices.findIndex(inv => inv.id === id);
    
    if (invoiceIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Invoice not found'
      }, { status: 404 });
    }
    
    if (status) invoices[invoiceIndex].status = status;
    if (paid_date) invoices[invoiceIndex].paid_date = paid_date;
    invoices[invoiceIndex].updated_at = new Date().toISOString();
    
    return NextResponse.json({
      success: true,
      data: invoices[invoiceIndex]
    });
    
  } catch (error) {
    console.error('PUT /api/invoices error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const invoiceIndex = invoices.findIndex(inv => inv.id === parseInt(id));
    
    if (invoiceIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Invoice not found'
      }, { status: 404 });
    }
    
    invoices.splice(invoiceIndex, 1);
    
    return NextResponse.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
    
  } catch (error) {
    console.error('DELETE /api/invoices error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}