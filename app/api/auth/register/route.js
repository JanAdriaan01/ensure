export const dynamic = 'force-dynamic';

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
    admin: [
      'job:view', 'job:create', 'job:edit', 'job:delete', 'job:finalize',
      'quote:view', 'quote:create', 'quote:edit', 'quote:delete', 'quote:approve',
      'employee:view', 'employee:create', 'employee:edit', 'employee:delete',
      'client:view', 'client:create', 'client:edit', 'client:delete',
      'invoice:view', 'invoice:create', 'invoice:edit', 'invoice:delete', 'invoice:pay',
      'stock:view', 'stock:create', 'stock:edit', 'stock:delete', 'stock:adjust',
      'tool:view', 'tool:create', 'tool:edit', 'tool:delete', 'tool:checkout',
      'schedule:view', 'schedule:create', 'schedule:edit', 'schedule:delete',
      'ohs:view', 'ohs:create', 'ohs:edit', 'ohs:delete',
      'report:view', 'report:export',
      'admin:access', 'user:manage', 'settings:edit'
    ],
    manager: [
      'job:view', 'job:create', 'job:edit', 'job:finalize',
      'quote:view', 'quote:create', 'quote:edit', 'quote:approve',
      'employee:view', 'employee:create', 'employee:edit',
      'client:view', 'client:create', 'client:edit',
      'invoice:view', 'invoice:create', 'invoice:edit', 'invoice:pay',
      'stock:view', 'stock:create', 'stock:adjust',
      'tool:view', 'tool:create', 'tool:checkout',
      'schedule:view', 'schedule:create', 'schedule:edit',
      'ohs:view', 'ohs:create', 'ohs:edit',
      'report:view', 'report:export',
      'settings:edit'
    ],
    user: [
      'job:view',
      'quote:view',
      'employee:view',
      'client:view',
      'invoice:view',
      'stock:view',
      'tool:view',
      'schedule:view',
      'ohs:view'
    ],
    viewer: [
      'job:view',
      'quote:view',
      'employee:view',
      'client:view',
      'invoice:view',
      'stock:view',
      'tool:view',
      'schedule:view',
      'ohs:view',
      'report:view'
    ]
  };
  return permissions[role] || permissions.viewer;
}