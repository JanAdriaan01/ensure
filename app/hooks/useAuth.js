'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);
  const authChecked = useRef(false);

  // Verify token with server
  const verifyToken = useCallback(async (storedToken) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${storedToken}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        return { valid: true, user: data.user, permissions: data.permissions || [] };
      }
      return { valid: false, user: null, permissions: [] };
    } catch (error) {
      console.error('Token verification error:', error);
      return { valid: false, user: null, permissions: [] };
    }
  }, []);

  // Initialize auth
  useEffect(() => {
    const initAuth = async () => {
      if (authChecked.current) return;
      authChecked.current = true;
      
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        const verification = await verifyToken(storedToken);
        
        if (verification.valid) {
          setToken(storedToken);
          setUser(verification.user);
          setPermissions(verification.permissions);
        } else {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          localStorage.removeItem('user_permissions');
        }
      }
      setLoading(false);
    };
    
    initAuth();
  }, [verifyToken]);

  const setCookie = (name, value, days) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  };

  const login = async (email, password, rememberMe = false) => {
    try {
      console.log('Login API call starting...');
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      
      const data = await response.json();
      console.log('Login API response received:', data);
      
      // Check for success in multiple ways
      const isSuccess = response.ok && (data.success === true || data.token);
      
      if (isSuccess) {
        console.log('Login successful, storing data');
        
        const userData = data.user || { email, name: email.split('@')[0], role: 'user' };
        const tokenData = data.token;
        const permissionsData = data.permissions || [];
        
        localStorage.setItem('auth_token', tokenData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('user_permissions', JSON.stringify(permissionsData));
        setCookie('auth_token', tokenData, rememberMe ? 30 : 7);
        
        setToken(tokenData);
        setUser(userData);
        setPermissions(permissionsData);
        
        return { success: true };
      }
      
      console.log('Login failed:', data.error);
      return { success: false, error: data.error || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed: ' + error.message };
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_permissions');
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setToken(null);
    setUser(null);
    setPermissions([]);
    router.push('/login');
  }, [router]);

  const value = {
    user,
    token,
    loading,
    permissions,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      token: null,
      loading: false,
      permissions: [],
      isAuthenticated: false,
      isAdmin: false,
      login: async () => ({ success: false }),
      logout: async () => {},
    };
  }
  return context;
}