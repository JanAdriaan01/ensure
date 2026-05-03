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
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');
    const storedPermissions = localStorage.getItem('user_permissions');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      if (storedPermissions) {
        setPermissions(JSON.parse(storedPermissions));
      }
    }
    
    // Small delay to ensure state is stable before setting loading to false
    setTimeout(() => {
      setLoading(false);
    }, 100);
  }, []);

  const setCookie = (name, value, days) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  };

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      
      const data = await response.json();
      console.log('Login response:', data);
      
      if (response.ok && data.success) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('user_permissions', JSON.stringify(data.permissions));
        
        setCookie('auth_token', data.token, rememberMe ? 30 : 7);
        
        setToken(data.token);
        setUser(data.user);
        setPermissions(data.permissions || []);
        
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
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