// /lib/auth.js
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

// Client-side helpers (these don't use server-only modules)
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
  if (typeof window === 'undefined') return false;
  return !!getToken();
}

// Utility function to get user from token (client-side)
export function getUserFromToken() {
  const token = getToken();
  if (!token) return null;
  
  try {
    // Decode without verifying (client-side)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}