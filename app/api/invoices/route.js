import { NextResponse } from 'next/server';

// Mock data for invoices
const mockInvoices = [
  {
    id: 1,
    invoice_number: 'INV-2024-001',
    client_name: 'ABC Construction',
    job_number: 'LC-2024-001',
    job_id: 1,
    amount: 25000,
    vat_amount: 3750,
    total_amount: 28750,
    status: 'paid',
    issue_date: '2024-02-01',
    due_date: '2024-03-01',
    paid_date: '2024-02-28',
    payment_method: 'bank_transfer'
  },
  {
    id: 2,
    invoice_number: 'INV-2024-002',
    client_name: 'ABC Construction',
    job_number: 'LC-2024-001',
    job_id: 1,
    amount: 20000,
    vat_amount: 3000,
    total_amount: 23000,
    status: 'pending',
    issue_date: '2024-03-01',
    due_date: '2024-04-01',
    paid_date: null,
    payment_method: null
  },
  {
    id: 3,
    invoice_number: 'INV-2024-003',
    client_name: 'XYZ Developers',
    job_number: 'LC-2024-002',
    job_id: 2,
    amount: 50000,
    vat_amount: 7500,
    total_amount: 57500,
    status: 'overdue',
    issue_date: '2024-02-15',
    due_date: '2024-03-15',
    paid_date: null,
    payment_method: null
  },
  {
    id: 4,
    invoice_number: 'INV-2024-004',
    client_name: 'Smith Properties',
    job_number: 'LC-2024-003',
    job_id: 3,
    amount: 15000,
    vat_amount: 2250,
    total_amount: 17250,
    status: 'draft',
    issue_date: null,
    due_date: null,
    paid_date: null,
    payment_method: null
  }
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const job_id = searchParams.get('job_id');
    
    let filteredInvoices = [...mockInvoices];
    
    if (status && status !== 'all') {
      filteredInvoices = filteredInvoices.filter(inv => inv.status === status);
    }
    
    if (job_id) {
      filteredInvoices = filteredInvoices.filter(inv => inv.job_id === parseInt(job_id));
    }
    
    return NextResponse.json({
      success: true,
      data: filteredInvoices,
      total: filteredInvoices.length,
      stats: {
        total_invoiced: mockInvoices.reduce((sum, inv) => sum + inv.total_amount, 0),
        total_paid: mockInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total_amount, 0),
        total_pending: mockInvoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.total_amount, 0),
        total_overdue: mockInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.total_amount, 0)
      }
    });
  } catch (error) {
    console.error('Invoices API error:', error);
    return NextResponse.json(
      { success: false, error: error.message, data: [] },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    const newInvoice = {
      id: mockInvoices.length + 1,
      ...body,
      created_at: new Date().toISOString()
    };
    
    mockInvoices.push(newInvoice);
    
    return NextResponse.json({
      success: true,
      data: newInvoice
    }, { status: 201 });
  } catch (error) {
    console.error('POST invoice error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, status, paid_date } = body;
    
    const invoiceIndex = mockInvoices.findIndex(inv => inv.id === id);
    
    if (invoiceIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    if (status) mockInvoices[invoiceIndex].status = status;
    if (paid_date) mockInvoices[invoiceIndex].paid_date = paid_date;
    
    return NextResponse.json({
      success: true,
      data: mockInvoices[invoiceIndex]
    });
  } catch (error) {
    console.error('PUT invoice error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}