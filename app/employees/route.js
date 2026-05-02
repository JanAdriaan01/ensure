import { NextResponse } from 'next/server';

const mockEmployees = [
  {
    id: 1,
    employee_number: 'EMP001',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    position: 'Senior Developer',
    department: 'Engineering',
    hourly_rate: 50,
    total_hours_worked: 120,
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    employee_number: 'EMP002',
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane@example.com',
    position: 'Project Manager',
    department: 'Operations',
    hourly_rate: 65,
    total_hours_worked: 95,
    status: 'active',
    created_at: new Date().toISOString()
  }
];

export async function GET() {
  return NextResponse.json(mockEmployees);
}