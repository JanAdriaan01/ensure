import { NextResponse } from 'next/server';

const mockQuotes = [
  {
    id: 1,
    quote_number: 'Q-2024-001',
    client_name: 'ABC Corp',
    status: 'approved',
    amount: 50000,
    po_received: true,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    quote_number: 'Q-2024-002',
    client_name: 'XYZ Ltd',
    status: 'pending',
    amount: 35000,
    po_received: false,
    created_at: new Date().toISOString()
  }
];

export async function GET() {
  return NextResponse.json(mockQuotes);
}