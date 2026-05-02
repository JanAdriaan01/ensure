import { NextResponse } from 'next/server';

const mockInvoices = [
  {
    id: 1,
    invoice_number: 'INV-2024-001',
    job_id: 1,
    job_number: 'LC-2024-001',
    client_name: 'ABC Construction',
    amount: 25000,
    status: 'paid',
    issue_date: '2024-02-01',
    due_date: '2024-03-01',
    paid_date: '2024-02-28'
  },
  {
    id: 2,
    invoice_number: 'INV-2024-002',
    job_id: 1,
    job_number: 'LC-2024-001',
    client_name: 'ABC Construction',
    amount: 20000,
    status: 'pending',
    issue_date: '2024-03-01',
    due_date: '2024-04-01',
    paid_date: null
  },
  {
    id: 3,
    invoice_number: 'INV-2024-003',
    job_id: 2,
    job_number: 'LC-2024-002',
    client_name: 'XYZ Developers',
    amount: 50000,
    status: 'overdue',
    issue_date: '2024-04-01',
    due_date: '2024-05-01',
    paid_date: null
  }
];

export async function GET() {
  return NextResponse.json(mockInvoices);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const newInvoice = {
      id: mockInvoices.length + 1,
      invoice_number: `INV-2024-00${mockInvoices.length + 1}`,
      ...body,
      created_at: new Date().toISOString()
    };
    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}