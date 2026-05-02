import { NextResponse } from 'next/server';

const mockTools = [
  { id: 1, name: 'Hammer', serial_number: 'H-001', category: 'Hand Tools', status: 'available', location: 'Warehouse A' },
  { id: 2, name: 'Drill', serial_number: 'D-001', category: 'Power Tools', status: 'checked_out', location: 'Job Site' },
  { id: 3, name: 'Screwdriver Set', serial_number: 'S-001', category: 'Hand Tools', status: 'available', location: 'Warehouse B' },
  { id: 4, name: 'Saw', serial_number: 'SA-001', category: 'Cutting Tools', status: 'maintenance', location: 'Repair Shop' },
];

export async function GET() {
  return NextResponse.json({ success: true, data: mockTools });
}

export async function POST(request) {
  const body = await request.json();
  const newTool = { id: mockTools.length + 1, ...body };
  mockTools.push(newTool);
  return NextResponse.json({ success: true, data: newTool }, { status: 201 });
}