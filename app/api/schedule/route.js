import { NextResponse } from 'next/server';

const mockSchedule = [
  { id: 1, employee_name: 'John Doe', employee_id: 1, job_number: 'LC-2024-001', date: '2024-03-25', start_time: '08:00', end_time: '17:00', role: 'Site Manager' },
  { id: 2, employee_name: 'Jane Smith', employee_id: 2, job_number: 'LC-2024-002', date: '2024-03-26', start_time: '09:00', end_time: '18:00', role: 'Electrician' },
  { id: 3, employee_name: 'Mike Johnson', employee_id: 3, job_number: 'LC-2024-001', date: '2024-03-25', start_time: '08:00', end_time: '16:00', role: 'Laborer' },
];

export async function GET() {
  return NextResponse.json({ success: true, data: mockSchedule });
}

export async function POST(request) {
  const body = await request.json();
  const newEntry = { id: mockSchedule.length + 1, ...body };
  mockSchedule.push(newEntry);
  return NextResponse.json({ success: true, data: newEntry }, { status: 201 });
}