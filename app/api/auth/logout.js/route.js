import { NextResponse } from 'next/server';

export async function POST() {
  // Just return success - token is managed client-side
  return NextResponse.json({ success: true });
}