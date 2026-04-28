import { cookies } from 'next/headers';
import { verifyJWT, signJWT } from '@/lib/api';

const SESSION_COOKIE = 'session_token';
const SESSION_EXPIRY = 7 * 24 * 60 * 60; // 7 days

export async function createSession(userId, userData) {
  const token = await signJWT(
    { userId, ...userData },
    { expiresIn: SESSION_EXPIRY }
  );
  
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_EXPIRY,
    path: '/'
  });
  
  return token;
}

export async function getSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  
  try {
    const decoded = await verifyJWT(token);
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function destroySession() {
  cookies().delete(SESSION_COOKIE);
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

// Client-side helpers
export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

export function setToken(token) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('access_token', token);
}

export function removeToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
}

export function isAuthenticated() {
  return !!getToken();
}