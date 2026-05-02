import { addAttendance } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    const { log_date, hours_worked, notes } = await request.json();
    await addAttendance(params.id, log_date, hours_worked, notes);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add attendance' }, { status: 500 });
  }
}