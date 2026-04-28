export const dynamic = 'force-dynamic';
// rest of your code
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // JWT is stateless, so logout is handled client-side by removing token
    // This endpoint exists for consistency and any server-side cleanup
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}