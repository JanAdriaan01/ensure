import { NextResponse } from 'next/server';

export async function GET() {
  const schedule = [
    { id: 1, employee_name: 'John Doe', employee_id: 1, job_number: 'LC-2024-001', date: '2024-03-25', start_time: '08:00', end_time: '17:00', role: 'Site Manager' },
    { id: 2, employee_name: 'Jane Smith', employee_id: 2, job_number: 'LC-2024-002', date: '2024-03-26', start_time: '09:00', end_time: '18:00', role: 'Electrician' },
  ];
  return NextResponse.json(schedule);
}