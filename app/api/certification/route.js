import { NextResponse } from 'next/server';

const mockCertifications = [
  { id: 1, employee_id: 1, employee_name: 'John Doe', certification_name: 'First Aid', issued_date: '2023-01-15', expiry_date: '2026-01-15', status: 'valid' },
  { id: 2, employee_id: 1, employee_name: 'John Doe', certification_name: 'OSHA Safety', issued_date: '2023-03-10', expiry_date: '2026-03-10', status: 'valid' },
  { id: 3, employee_id: 2, employee_name: 'Jane Smith', certification_name: 'Electrical License', issued_date: '2022-06-20', expiry_date: '2025-06-20', status: 'valid' },
  { id: 4, employee_id: 2, employee_name: 'Jane Smith', certification_name: 'First Aid', issued_date: '2022-01-15', expiry_date: '2025-01-15', status: 'expired' },
];

export async function GET() {
  return NextResponse.json({ success: true, data: mockCertifications });
}