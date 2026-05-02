import { NextResponse } from 'next/server';

export async function GET() {
  const tools = [
    { id: 1, name: 'Hammer', serial_number: 'H-001', category: 'Hand Tools', status: 'available', location: 'Warehouse A' },
    { id: 2, name: 'Drill', serial_number: 'D-001', category: 'Power Tools', status: 'checked_out', location: 'Job Site' },
    { id: 3, name: 'Screwdriver Set', serial_number: 'S-001', category: 'Hand Tools', status: 'available', location: 'Warehouse B' },
    { id: 4, name: 'Saw', serial_number: 'SA-001', category: 'Cutting Tools', status: 'maintenance', location: 'Repair Shop' },
  ];
  return NextResponse.json(tools);
}