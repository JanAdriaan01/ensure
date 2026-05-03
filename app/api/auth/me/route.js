export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user details
    const result = await query(
      `SELECT id, email, name, role, is_active, created_at, phone, avatar_url, last_login 
       FROM users 
       WHERE id = $1 AND is_active = true`,
      [auth.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = result.rows[0];

    // Update last login
    await query(
      `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1`,
      [auth.userId]
    );

    // Get user permissions based on role
    const permissions = getPermissionsForRole(user.role);

    return NextResponse.json({
      success: true,
      user,
      permissions
    });

  } catch (error) {
    console.error('GET /api/auth/me error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
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
    supervisor: [
      'job:view', 'job:create', 'job:edit',
      'quote:view',
      'employee:view',
      'client:view',
      'invoice:view',
      'stock:view',
      'tool:view', 'tool:checkout',
      'schedule:view', 'schedule:create',
      'ohs:view', 'ohs:create',
      'report:view',
      'payroll:view'
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