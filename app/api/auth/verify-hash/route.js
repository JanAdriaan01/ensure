export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    // Get user's password hash
    const result = await query(
      `SELECT id, email, password_hash FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    
    // Test password verification
    const isValid = await verifyPassword(password, user.password_hash);
    
    return NextResponse.json({
      email: user.email,
      hash_length: user.password_hash?.length || 0,
      hash_prefix: user.password_hash?.substring(0, 20) || 'none',
      password_valid: isValid
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}