// /lib/auth-server.js
// This file should ONLY be imported in Server Components and API routes
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const SESSION_COOKIE = 'session_token';
const SESSION_EXPIRY = 7 * 24 * 60 * 60; // 7 days

// JWT helper functions
export function signJWT(payload, options = {}) {
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-this';
  const expiresIn = options.expiresIn || SESSION_EXPIRY;
  
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyJWT(token) {
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-this';
  
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}

// Server-side session functions
export async function createSession(userId, userData) {
  const token = signJWT(
    { userId, ...userData },
    { expiresIn: SESSION_EXPIRY }
  );
  
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_EXPIRY,
    path: '/'
  });
  
  return token;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  
  if (!token) return null;
  
  try {
    const decoded = verifyJWT(token);
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  return session;
}

export async function requireRole(roles) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  
  const rolesArray = Array.isArray(roles) ? roles : [roles];
  if (!rolesArray.includes(session.role)) {
    throw new Error('Forbidden');
  }
  
  return session;
}