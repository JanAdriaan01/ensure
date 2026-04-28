// /lib/auth.js
// This file can be imported anywhere (client components, server components, API routes)

// Client-side helpers (safe to use in browser)
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