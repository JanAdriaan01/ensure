import { getCompletedInvoices } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const invoices = await getCompletedInvoices();
    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}