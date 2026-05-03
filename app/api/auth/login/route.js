export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { generateToken, verifyPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password, rememberMe } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const result = await query(
      `SELECT id, email, name, role, password_hash, is_active, phone 
       FROM users 
       WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Account is disabled. Please contact support.' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate token
    const expiresIn = rememberMe ? '30d' : '7d';
    const token = generateToken(user.id, user.email, user.role, expiresIn);

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      token,
      user: userWithoutPassword,
      permissions: getPermissionsForRole(user.role)
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}

function getPermissionsForRole(role) {
  const permissions = {
    admin: [
      'job:view', 'job:create', 'job:edit', 'job:delete', 'job:finalize',
      'quote:view', 'quote:create', 'quote:edit', 'quote:delete', 'quote:approve',
      'employee:view', 'employee:create', 'employee:edit', 'employee:delete', 'employee:payroll',
      'client:view', 'client:create', 'client:edit', 'client:delete',
      'invoice:view', 'invoice:create', 'invoice:edit', 'invoice:delete', 'invoice:pay',
      'stock:view', 'stock:create', 'stock:edit', 'stock:delete', 'stock:adjust',
      'tool:view', 'tool:create', 'tool:edit', 'tool:delete', 'tool:checkout',
      'schedule:view', 'schedule:create', 'schedule:edit', 'schedule:delete',
      'ohs:view', 'ohs:create', 'ohs:edit', 'ohs:delete',
      'report:view', 'report:export',
      'payroll:view', 'payroll:process', 'payroll:edit',
      'reconciliation:view', 'reconciliation:match', 'reconciliation:edit',
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
      'payroll:view', 'payroll:process',
      'reconciliation:view', 'reconciliation:match',
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