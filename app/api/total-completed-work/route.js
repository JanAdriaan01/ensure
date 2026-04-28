import { getTotalCompletedWork } from '@/app/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const summary = await getTotalCompletedWork();
    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 });
  }
}