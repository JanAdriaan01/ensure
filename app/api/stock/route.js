import { NextResponse } from 'next/server';

const mockStock = [
  { id: 1, name: 'Cement', sku: 'CEM-001', category: 'Materials', quantity: 500, min_quantity: 100, unit: 'bags' },
  { id: 2, name: 'Bricks', sku: 'BRK-001', category: 'Materials', quantity: 2000, min_quantity: 500, unit: 'pieces' },
  { id: 3, name: 'Paint White', sku: 'PNT-001', category: 'Paint', quantity: 50, min_quantity: 20, unit: 'liters' },
  { id: 4, name: 'Nails', sku: 'NAIL-001', category: 'Hardware', quantity: 1000, min_quantity: 200, unit: 'boxes' },
];

export async function GET() {
  return NextResponse.json({ success: true, data: mockStock });
}

export async function POST(request) {
  const body = await request.json();
  const newItem = { id: mockStock.length + 1, ...body };
  mockStock.push(newItem);
  return NextResponse.json({ success: true, data: newItem }, { status: 201 });
}