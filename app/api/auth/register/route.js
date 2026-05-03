import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { generateToken, hashPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existing = await query(`SELECT id FROM users WHERE email = $1`, [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user
    const result = await query(
      `INSERT INTO users (email, password_hash, name, role, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, role`,
      [email.toLowerCase(), password_hash, name || email.split('@')[0], 'user', true]
    );

    const user = result.rows[0];

    // Generate token
    const token = generateToken(user.id, user.email, user.role);

    return NextResponse.json({
      success: true,
      token,
      user,
      permissions: getPermissionsForRole('user')
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}

function getPermissionsForRole(role) {
  const permissions = {
    admin: ['*'],
    manager: ['job:view', 'job:create', 'job:edit', 'quote:view', 'quote:create', 'employee:view', 'client:view', 'invoice:view'],
    user: ['job:view', 'quote:view', 'employee:view', 'client:view', 'invoice:view'],
    viewer: ['job:view', 'quote:view', 'employee:view', 'client:view']
  };
  return permissions[role] || permissions.viewer;
}