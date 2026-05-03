export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = await verifyAuth(request);
    
    console.log('Auth/me - authenticated:', auth.authenticated);
    
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user details
    const result = await query(
      `SELECT id, email, name, role, is_active, created_at 
       FROM users 
       WHERE id = $1 AND is_active = true`,
      [auth.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = result.rows[0];

    return NextResponse.json({
      success: true,
      user,
      permissions: getPermissionsForRole(user.role)
    });

  } catch (error) {
    console.error('Auth/me error:', error);
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
      'report:view', 'report:export', 'settings:edit'
    ],
    user: [
      'job:view', 'quote:view', 'employee:view', 'client:view', 'invoice:view',
      'stock:view', 'tool:view'
    ]
  };
  return permissions[role] || permissions.user;
}